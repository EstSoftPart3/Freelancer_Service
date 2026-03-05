// [Freelancer_Service] 로그인 관련
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const baseUrl = 'http://localhost:8080/api'

// axios 내부 설정 타입에 _retry 속성을 추가하기 위한 인터페이스 확장
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const apiInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
})

apiInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().auth.accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

interface FailedRequest {
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

apiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig
    const { auth } = useAuthStore.getState()

    if (
      !originalRequest ||
      originalRequest.url === '/refresh-token' ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiInstance(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // 1. 로컬 스토리지에서 리프레시 토큰 꺼내기
      const storedRefreshToken = localStorage.getItem('refreshToken')

      // 2. 백엔드 호출 (Body에 TokenDTO 구조로 전달)
      // 사용자님의 백엔드 ApiResponse 구조: { status, message, output: { token: { accessToken, refreshToken } } }
      const response = await axios.post(
        `${baseUrl}/refresh-token`,
        { refreshToken: storedRefreshToken }, // Body에 담아서 전송
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )

      // 3. 응답 구조에 맞춰 데이터 추출 (output -> token)
      const { token } = response.data.output
      const { accessToken, refreshToken } = token

      // 4. 스토어 및 로컬스토리지 갱신
      auth.setAccessToken(accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      processQueue(null, accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiInstance(originalRequest)
    } catch (err) {
      // 갱신 요청 자체가 실패했을 때 (RT 만료 등)
      processQueue(err, null)
      auth.reset() // Zustand/Redux 스토어 초기화
      localStorage.removeItem('refreshToken')

      // ✅ 이 줄이 핵심입니다! 강제로 로그인 페이지로 보냅니다.
      window.location.href = '/sign-in'

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export const api = {
  async $get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await apiInstance.get(url, { params })
    return response.data
  },
  async $post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiInstance.post(url, data, config)
    return response.data
  },
  async $put<T>(url: string, data?: unknown): Promise<T> {
    const response = await apiInstance.put(url, data)
    return response.data
  },
  async $patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiInstance.patch(url, data, config)
    return response.data
  },
  async $delete<T>(url: string): Promise<T> {
    const response = await apiInstance.delete(url)
    return response.data
  },
}
