// [Freelancer_Service] 로그인 관련 수정본
import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

// 쿠키 키 값 정의
const ACCESS_TOKEN = 'thisisjustarandomstring'
const AUTH_USER = 'auth_user_info' // ✅ 유저 정보 저장용 키 추가
export const REFRESH_TOKEN = 'admin_refresh_token'

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
  // accessToken/refreshToken 모두 세션 쿠키(max-age 없음)로 저장한다 — BO에는 FO 같은
  // "로그인 유지" 옵션이 없으므로, 브라우저를 닫으면 항상 로그아웃되는 게 맞는 기본값이다.
  // (예전엔 refreshToken을 localStorage에 영구 저장해 브라우저를 재시작해도 세션이 절대
  // 끊기지 않았다 — 2026-09-17 BO 로그아웃 버그의 핵심 원인)
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
            setCookie(AUTH_USER, JSON.stringify(user), null) // ✅ 쿠키에 저장
          } else {
            removeCookie(AUTH_USER)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken), null)
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
          removeCookie(REFRESH_TOKEN)
          // 마이그레이션 이전 코드가 localStorage에 영구 저장해 둔 잔재 정리
          localStorage.removeItem('refreshToken')

          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
