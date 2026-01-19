import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userSq: localStorage.getItem('userSq') || null,
    userNm: localStorage.getItem('userNm') || '',
    userEmail: localStorage.getItem('userEmail') || '',
    socialId: localStorage.getItem('socialId') || null,
    userType: localStorage.getItem('userType') || '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.userNm,
    getUserType: (state) => state.userType,
  },
  actions: {
    setUser({ userSq, userNm, userEmail, socialId, userTypeCd }) {
      const userType =
        userTypeCd === 301 ? 'PERSONAL' : userTypeCd === 302 ? 'COMPANY' : ''

      this.userSq = userSq
      this.userNm = userNm
      this.userEmail = userEmail
      this.socialId = socialId
      this.userType = userType

      localStorage.setItem('userSq', userSq)
      localStorage.setItem('userNm', userNm)
      localStorage.setItem('userEmail', userEmail)
      if (socialId) {
        localStorage.setItem('socialId', socialId)
      } else {
        localStorage.removeItem('socialId')
      }
      localStorage.setItem('userType', userType)
    },

    setSocialId(id) {
      this.socialId = id
      if (id) {
        localStorage.setItem('socialId', id)
      } else {
        localStorage.removeItem('socialId')
      }
    },

    clearUser() {
      this.userSq = null
      this.userNm = ''
      this.userEmail = ''
      this.socialId = null
      this.userType = ''

      localStorage.removeItem('userSq')
      localStorage.removeItem('userNm')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('socialId')
      localStorage.removeItem('userType')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('autoLogin')
    },
  },
})
