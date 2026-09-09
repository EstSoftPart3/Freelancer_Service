// [Freelancer_Service] 로그인 관련 수정본
import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

// 쿠키 키 값 정의
const ACCESS_TOKEN = 'thisisjustarandomstring'
const AUTH_USER = 'auth_user_info' // ✅ 유저 정보 저장용 키 추가

interface AuthUser {
  accountNo: string
  userId: string
  userName: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // --- 초기화 로직 (새로고침 시 실행) ---
  const cookieToken = getCookie(ACCESS_TOKEN)
  const initToken = cookieToken ? JSON.parse(cookieToken) : ''

  // ✅ 유저 정보도 쿠키에서 읽어와서 새로고침 시 유지되도록 함
  const cookieUser = getCookie(AUTH_USER)
  const initUser = cookieUser ? JSON.parse(cookieUser) : null

  return {
    auth: {
      user: initUser, // ✅ null 대신 초기화된 정보 사용
      setUser: (user) =>
        set((state) => {
          if (user) {
            setCookie(AUTH_USER, JSON.stringify(user)) // ✅ 쿠키에 저장
          } else {
            removeCookie(AUTH_USER)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          // ✅ 모든 인증 관련 정보 삭제
          removeCookie(ACCESS_TOKEN)
          removeCookie(AUTH_USER)
          localStorage.removeItem('refreshToken') // 리프레시 토큰도 함께 청소

          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
