// Mirrors vue_js/src/fo/stores/userStore.js
import { create } from 'zustand'
import { User, UserApiResponse, UserType } from '@/types'

interface UserState extends Partial<User> {
  // /me 부트스트랩(Providers) 완료 여부 — 확인 전 헤더가 로그인/로그아웃을 단정하지 않도록
  authChecked: boolean
  setAuthChecked: (v: boolean) => void
  getUserType: () => UserType | null
  isLoggedIn: () => boolean
  // 인자는 /login, /me 원본 응답 모양(UserApiResponse) — isAffiliated 는 여기서 boolean 으로 정규화된다.
  setUser: (user: UserApiResponse) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  userSq: undefined,
  userNm: undefined,
  userNickname: undefined,
  userTypeCd: undefined,
  address: undefined,
  latitude: undefined,
  longitude: undefined,
  isAffiliated: undefined,
  affiliatedCompanySq: undefined,
  companyAuthStatusCd: undefined,

  authChecked: false,
  setAuthChecked: (v) => set({ authChecked: v }),

  getUserType: (): UserType | null => {
    const cd = get().userTypeCd
    if (cd === 301) return 'PERSONAL'
    if (cd === 302) return 'COMPANY'
    return null
  },
  isLoggedIn: () => !!get().userSq,

  // 백엔드는 isAffiliated 를 boolean 이 아니라 'Y'/'N' 문자열로 내려준다 — 그대로 저장하면
  // "N" 도 truthy 라 소속 없음 판정이 깨진다. 여기서 한 번만 boolean 으로 정규화한다.
  setUser: (user) => set({ ...user, isAffiliated: user.isAffiliated === 'Y' }),
  clearUser: () =>
    set({
      userSq: undefined,
      userNm: undefined,
      userNickname: undefined,
      userTypeCd: undefined,
      address: undefined,
      latitude: undefined,
      longitude: undefined,
      isAffiliated: undefined,
      affiliatedCompanySq: undefined,
      companyAuthStatusCd: undefined,
    }),
}))
