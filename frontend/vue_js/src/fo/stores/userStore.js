import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userSq: localStorage.getItem('userSq') || '',
    userNm: localStorage.getItem('userNm') || '',
    userType: localStorage.getItem('userType') || '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.userNm,
    getUserType: (state) => state.userType,
  },
  actions: {
    setUser({ userSq, userNm, userTypeCd }) {
      const userType =
        userTypeCd === 301 ? 'PERSONAL' : userTypeCd === 302 ? 'COMPANY' : ''

      // 인턴 추가 작업: userSq 값 검증 및 저장
      if (userSq && userSq !== '') {
        this.userSq = userSq
        localStorage.setItem('userSq', userSq)
        console.log('userSq 저장 완료:', userSq)
      } else {
        console.log('userSq 값이 비어있음:', userSq)
      }

      this.userNm = userNm
      this.userType = userType

      localStorage.setItem('userNm', userNm)
      localStorage.setItem('userType', userType)
    },
    clearUser() {
      this.userSq = ''
      this.userNm = ''
      this.userType = ''

      localStorage.removeItem('userSq')
      localStorage.removeItem('userNm')
      localStorage.removeItem('userType')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('autoLogin')
    },
  },
})
