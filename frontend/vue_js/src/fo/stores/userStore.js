import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userNm: localStorage.getItem('userNm') || '',
    userType: localStorage.getItem('userType') || '',
    // [추가] 주소 및 좌표 정보
    userAddress: localStorage.getItem('userAddress') || '',
    userLat: localStorage.getItem('userLat') || null,
    userLng: localStorage.getItem('userLng') || null,
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
    setUser({ userNm, userTypeCd, address, latitude, longitude }) {
      const userType =
        userTypeCd === 301 ? 'PERSONAL' : userTypeCd === 302 ? 'COMPANY' : ''

      this.userNm = userNm
      this.userType = userType
      this.userAddress = address || ''
      this.userLat = latitude || null
      this.userLng = longitude || null

      localStorage.setItem('userNm', userNm)
      localStorage.setItem('userType', userType)
      // [추가] 로컬 스토리지 저장 (새로고침 대비)
      if (address) localStorage.setItem('userAddress', address)
      if (latitude) localStorage.setItem('userLat', latitude)
      if (longitude) localStorage.setItem('userLng', longitude)
    },
    clearUser() {
      this.userNm = ''
      this.userType = ''
      this.userAddress = ''
      this.userLat = null
      this.userLng = null

      localStorage.removeItem('userNm')
      localStorage.removeItem('userType')
      localStorage.removeItem('userAddress')
      localStorage.removeItem('userLat')
      localStorage.removeItem('userLng')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('autoLogin')
    },
  },
})
