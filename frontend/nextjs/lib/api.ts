// Mirrors vue_js/src/axios.js — Bearer token injection + 401 refresh queue
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

// 브라우저: /api/* → Next.js rewrites → 백엔드 (CORS 우회)
// 서버 컴포넌트: 직접 백엔드 호출
export const baseUrl =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api')
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
        const newToken: string = data.output.accessToken
        const newRefreshToken: string | undefined = data.output.refreshToken

        setCookie('accessToken', newToken)
        if (newRefreshToken) setCookie('refreshToken', newRefreshToken, 14)
        processQueue(null, newToken)
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }
        return api(original)
      } catch (err) {
        processQueue(err, null)
        clearAuthCookies()
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]
}

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

function clearAuthCookies() {
  document.cookie = 'accessToken=; Max-Age=0; path=/'
  document.cookie = 'refreshToken=; Max-Age=0; path=/'
  document.cookie = 'userType=; Max-Age=0; path=/'
}

export default api
