import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userNm: localStorage.getItem('userNm') || '',
    userType: localStorage.getItem('userType') || '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.userNm,
    getUserType: (state) => state.userType,
  },
  actions: {
    setUser({ userNm, userTypeCd }) {
      const userType =
        userTypeCd === 301 ? 'PERSONAL' : userTypeCd === 302 ? 'COMPANY' : ''

      this.userNm = userNm
      this.userType = userType

      localStorage.setItem('userNm', userNm)
      localStorage.setItem('userType', userType)
    },
    clearUser() {
      this.userNm = ''
      this.userType = ''

      localStorage.removeItem('userNm')
      localStorage.removeItem('userType')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('autoLogin')
    },
  },
})
