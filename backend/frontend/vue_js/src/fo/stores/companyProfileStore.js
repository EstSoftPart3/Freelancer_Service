// src/stores/companyProfileStore.js
import { defineStore } from 'pinia'

export const useCompanyProfileStore = defineStore('companyProfile', {
  state: () => ({
    companyData: {
      companyName: '',
      ceoName: '',
      openDate: '',
      bizNumber: '',
    },
    termsAgreed: false,
  }),
  actions: {
    resetProfile() {
      this.companyData = {
        companyName: '',
        ceoName: '',
        openDate: '',
        bizNumber: '',
      }
      this.termsAgreed = false
    },
    /**
     * 외부에서 인증된 기업 데이터로 업데이트할 때 사용
     */
    setProfile(payload) {
      this.companyData = {
        companyName: payload.companyName || '',
        ceoName: payload.ceoName || '',
        openDate: payload.openDate || '',
        bizNumber: payload.bizNumber || '',
      }
      this.termsAgreed = payload.termsAgreed ?? false
    },
  },
})
