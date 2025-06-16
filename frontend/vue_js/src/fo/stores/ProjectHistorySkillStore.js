// /src/fo/stores/skillStore.js
import { defineStore } from 'pinia'

export const useSkillStore = defineStore('skillStore', {
  state: () => ({
    skills: {
      device: [],
      os: [],
      dbms: [],
      language: [],
      tool: [],
      framework: [],
    },
  }),
  actions: {
    setSkills(newSkills) {
      this.skills = {
        device: newSkills.device || [],
        os: newSkills.os || [],
        dbms: newSkills.dbms || [],
        language: newSkills.language || [],
        tool: newSkills.tool || [],
        framework: newSkills.framework || [],
      }
    },
    resetSkills() {
      this.skills = {
        device: [],
        os: [],
        dbms: [],
        language: [],
        tools: [],
        framework: [],
      }
    },
  },
})
