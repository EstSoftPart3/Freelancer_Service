import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userSq: localStorage.getItem('userSq')
      ? Number(localStorage.getItem('userSq'))
      : null,
    userNm: localStorage.getItem('userNm') || '',
    userType: localStorage.getItem('userType') || '',
    userAddress: localStorage.getItem('userAddress') || '',
    // 문자열을 숫자로 변환하여 저장
    userLat: localStorage.getItem('userLat')
      ? Number(localStorage.getItem('userLat'))
      : null,
    userLng: localStorage.getItem('userLng')
      ? Number(localStorage.getItem('userLng'))
      : null,
    isAffiliated: localStorage.getItem('isAffiliated') || 'N',
    // [추가] 기업 인증 상태 (기본값 null)
    companyAuthStatusCd: localStorage.getItem('companyAuthStatusCd')
      ? Number(localStorage.getItem('companyAuthStatusCd'))
      : null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.userNm,
    getUserType: (state) => state.userType,
    // [추가] 좌표 객체 반환 게터
    userCoords: (state) =>
      state.userLat && state.userLng
        ? { lat: state.userLat, lng: state.userLng }
        : null,
  },
  actions: {
    setUser({
      userSq,
      userNm,
      userTypeCd,
      address,
      latitude,
      longitude,
      isAffiliated,
      companyAuthStatusCd, // [추가]
    }) {
      const userType =
        userTypeCd === 301 ? 'PERSONAL' : userTypeCd === 302 ? 'COMPANY' : ''

      this.userSq = userSq
      this.userNm = userNm
      this.userType = userType
      this.userAddress = address || ''
      this.userLat = latitude
      this.userLng = longitude
      this.isAffiliated = isAffiliated || 'N'
      this.companyAuthStatusCd = companyAuthStatusCd // [추가]

      localStorage.setItem('userSq', userSq)
      localStorage.setItem('userNm', userNm)
      localStorage.setItem('userType', userType)
      // [추가] 로컬 스토리지 저장 (새로고침 대비)
      if (address) localStorage.setItem('userAddress', address)
      if (latitude !== undefined && latitude !== null)
        localStorage.setItem('userLat', latitude)
      if (longitude !== undefined && longitude !== null)
        localStorage.setItem('userLng', longitude)
      localStorage.setItem('isAffiliated', this.isAffiliated)
      // [추가] 로컬 스토리지 저장
      if (companyAuthStatusCd)
        localStorage.setItem('companyAuthStatusCd', companyAuthStatusCd)
    },
    clearUser() {
      this.userSq = null
      this.userNm = ''
      this.userType = ''
      this.userAddress = ''
      this.userLat = null
      this.userLng = null
      this.isAffiliated = 'N'
      this.companyAuthStatusCd = null

      localStorage.removeItem('userSq')
      localStorage.removeItem('userNm')
      localStorage.removeItem('userType')
      localStorage.removeItem('userAddress')
      localStorage.removeItem('userLat')
      localStorage.removeItem('userLng')
      localStorage.removeItem('isAffiliated')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('autoLogin')
      localStorage.removeItem('companyAuthStatusCd')
    },
  },
})
