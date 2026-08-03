// Mirrors vue_js/src/axios.js — Bearer token injection + 401 refresh queue
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { getCookie, setCookie, clearAuthCookies } from '@/lib/cookies'
import { alertStore } from '@/stores/alertStore'

// 브라우저: /api/* → Next.js rewrites → 백엔드 (CORS 우회)
// 서버 컴포넌트: 직접 백엔드 호출 — 컨테이너 내부 주소(API_INTERNAL_BASE_URL)를 쓴다.
// 공개 도메인을 쓰면 SSR 요청이 Cloudflare 를 한 바퀴 돌아 되돌아온다.
export const baseUrl =
  typeof window === 'undefined'
    ? (process.env.API_INTERNAL_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      'http://localhost:8080/api')
    : '/api'

const api = axios.create({ baseURL: baseUrl })

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof document !== 'undefined') {
    const token = getCookie('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    // 백엔드가 HTTP 200으로 에러를 내려주는 경우 (e.g. SignUpController)
    // ApiResponse { status: "BAD_REQUEST", message: "...", output: null }
    const d = res.data
    if (
      d &&
      typeof d === 'object' &&
      'status' in d &&
      d.status !== 'OK' &&
      d.status !== 'CREATED'
    ) {
      const err = Object.assign(new Error(d.message ?? '요청 처리에 실패했습니다.'), {
        response: res,
      })
      return Promise.reject(err)
    }
    return res
  },
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // 새 토큰으로 재시도했는데도 401이면(예: 이미 로그아웃된 계정) 재차 refresh를
        // 시도하지 않도록 큐에 넣는 시점에 _retry를 미리 표시해 무한 루프를 막는다.
        original._retry = true
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers = { ...original.headers, Authorization: `Bearer ${token}` }
            return api(original)
          })
          .catch(Promise.reject.bind(Promise))
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = getCookie('refreshToken')
        // 백엔드 LoginController는 refresh token을 Authorization 헤더(Bearer)로 받는다 (body 아님)
        // 인터셉터 없는 기본 axios를 써서 request 인터셉터가 access token으로 덮어쓰지 않도록 한다
        const { data } = await axios.post(`/api/refresh-token`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })
        // 응답은 ApiResponse 래퍼: { status, message, output: { accessToken, refreshToken } }
        const newToken: string | undefined = data?.output?.accessToken
        const newRefreshToken: string | undefined = data?.output?.refreshToken
        if (!newToken) throw new Error('토큰 재발급 응답이 올바르지 않습니다.')

        // 로그인 시 선택한 로그인 유지 여부를 그대로 따른다 (재발급이 세션 쿠키를
        // 영구 쿠키로 바꾸거나, 자동로그인 쿠키를 조기 만료시키지 않도록).
        const rememberMe =
          typeof window !== 'undefined' && localStorage.getItem('autoLogin') === 'true'
        const days = rememberMe ? 30 : null

        setCookie('accessToken', newToken, days)
        if (newRefreshToken) setCookie('refreshToken', newRefreshToken, days)
        processQueue(null, newToken)
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }
        return api(original)
      } catch (err) {
        processQueue(err, null)
        clearAuthCookies()
        if (typeof window !== 'undefined') {
          alertStore.show('세션이 만료되었습니다. 다시 로그인해 주세요.', 'danger')
          window.location.href = '/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
