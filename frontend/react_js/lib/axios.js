import axios from 'axios'

const baseUrl = 'http://localhost:8080'

// axios 인스턴스 생성
const apiInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'ngrok-skip-browser-warning': '65455',
  },
})

// 요청 인터셉터 설정
apiInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 토큰 재발급 시도 중 여부 플래그
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// 로그인 초기화 함수 (외부에서 주입받음)
let clearLoginState = () => {}

// 외부에서 clearLoginState 함수를 설정하는 함수
export function setClearLoginState(fn) {
  clearLoginState = fn
}

// 응답 인터셉터 설정
apiInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // refresh-token 요청에 대해선 인터셉터 로직 skip
    if (originalRequest.url === '/refresh-token') {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then(() => apiInstance(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available.')
        }

        const response = await apiInstance.post(
          '/refresh-token',
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        )

        const newAccessToken = response.data.data.accessToken
        const newRefreshToken = response.data.data.refreshToken
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null)
        return apiInstance(originalRequest)
      } catch (err) {
        processQueue(err)
        clearLoginState()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// 공통 HTTP 메서드 정의
export const api = {
  async $get(url, params) {
    try {
      const response = await apiInstance.get(url, params)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  },
  async $post(url, data = undefined, config = undefined) {
    try {
      const response = await apiInstance.post(url, data, config)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  },
  async $put(url, data, config = {}) {
    try {
      const headers = { ...(config.headers || {}) }
      // FormData가 아닌 경우에만 content-type을 application/json으로
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }
      const response = await apiInstance.put(url, data, {
        ...config,
        headers
      })
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  },
  async $patch(url, data, config) {
    try {
      const response = await apiInstance.patch(url, data, config)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  },
  async $delete(url) {
    try {
      const response = await apiInstance.delete(url)
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  },
}

export { baseUrl }




