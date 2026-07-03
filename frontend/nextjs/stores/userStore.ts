// Mirrors vue_js/src/fo/stores/userStore.js
import { create } from 'zustand'
import { User, UserType } from '@/types'

interface UserState extends Partial<User> {
  // /me 부트스트랩(Providers) 완료 여부 — 확인 전 헤더가 로그인/로그아웃을 단정하지 않도록
  authChecked: boolean
  setAuthChecked: (v: boolean) => void
  getUserType: () => UserType | null
  isLoggedIn: () => boolean
  setUser: (user: User) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  userSq: undefined,
  userNm: undefined,
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

  setUser: (user) => set({ ...user }),
  clearUser: () =>
    set({
      userSq: undefined,
      userNm: undefined,
      userTypeCd: undefined,
      address: undefined,
      latitude: undefined,
      longitude: undefined,
      isAffiliated: undefined,
      affiliatedCompanySq: undefined,
      companyAuthStatusCd: undefined,
    }),
}))
