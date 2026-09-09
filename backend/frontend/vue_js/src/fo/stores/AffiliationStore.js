import { defineStore } from 'pinia'

export const useAffiliationStore = defineStore('Affiliation', {
  state: () => ({
    viewerSq: null,
    greeting: '',
    resume: {
      resumeSq: null,
      resumeTtl: '',
    },
  }),
  actions: {
    resetGreeting() {
      this.greeting = ''
    },
    resetResume() {
      this.resume = {
        resumeSq: null,
        resumeTtl: '',
      }
    },
    setResume(resumeInfo) {
      this.resume = {
        resumeSq: resumeInfo.resumeSq,
        resumeTtl: resumeInfo.resumeTtl,
      }
    },
  },
})
