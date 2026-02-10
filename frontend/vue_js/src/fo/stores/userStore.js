import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // 개발용
  // state: () => ({
  //   userNm: localStorage.getItem('userNm') || '',
  //   userType: localStorage.getItem('userType') || '',
  //   userAddress: localStorage.getItem('userAddress') || '',
  //   userLat: localStorage.getItem('userLat') || null,
  //   userLng: localStorage.getItem('userLng') || null,
  // isAffiliated: localStorage.getItem('isAffiliated') || 'N',
  // }),

  // 배포용
  state: () => ({
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
      userNm,
      userTypeCd,
      address,
      latitude,
      longitude,
      isAffiliated,
    }) {
      const userType =
        userTypeCd === 301 ? 'PERSONAL' : userTypeCd === 302 ? 'COMPANY' : ''

      this.userNm = userNm
      this.userType = userType
      this.userAddress = address || ''
      this.userLat = latitude
      this.userLng = longitude
      this.isAffiliated = isAffiliated || 'N'

      localStorage.setItem('userNm', userNm)
      localStorage.setItem('userType', userType)
      // [추가] 로컬 스토리지 저장 (새로고침 대비)
      if (address) localStorage.setItem('userAddress', address)
      if (latitude !== undefined && latitude !== null)
        localStorage.setItem('userLat', latitude)
      if (longitude !== undefined && longitude !== null)
        localStorage.setItem('userLng', longitude)
      localStorage.setItem('isAffiliated', this.isAffiliated)
    },
    clearUser() {
      this.userNm = ''
      this.userType = ''
      this.userAddress = ''
      this.userLat = null
      this.userLng = null
      this.isAffiliated = 'N'

      localStorage.removeItem('userNm')
      localStorage.removeItem('userType')
      localStorage.removeItem('userAddress')
      localStorage.removeItem('userLat')
      localStorage.removeItem('userLng')
      localStorage.removeItem('isAffiliated')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('autoLogin')
    },
  },
})
