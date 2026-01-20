// src/fo/stores/socialStore.js
import { defineStore } from 'pinia'

export const useSocialStore = defineStore('social', {
  state: () => ({
    tempUser: {
      email: '',
      userNm: '',
      socialId: '',
      socialType: 'google',
    },
  }),
  actions: {
    setTempUser(payload) {
      this.tempUser = { ...this.tempUser, ...payload }
    },
    clearTempUser() {
      this.tempUser = {
        email: '',
        userNm: '',
        socialId: '',
        socialType: 'google',
      }
    },
  },
})
