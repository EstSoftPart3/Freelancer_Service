import { defineStore } from 'pinia'

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: {}, // { [projectId]: { form, skills } }
  }),

  actions: {
    // 폼 초기화 또는 직접 설정
    initForm(projectId) {
      if (!this.projects[projectId]) {
        this.projects[projectId] = {}
      }
      this.projects[projectId].form = {
        name: '',
        startDate: '',
        endDate: '',
        client: '',
        workUnit: '',
        role: '',
      }
    },

    setForm(projectId, formData) {
      if (!this.projects[projectId]) {
        this.projects[projectId] = {}
      }
      this.projects[projectId].form = { ...formData }
    },

    getForm(projectId) {
      return (
        this.projects[projectId]?.form || {
          name: '',
          startDate: '',
          endDate: '',
          client: '',
          workUnit: '',
          role: '',
        }
      )
    },
    hasForm(projectId) {
      return !!this.projects[projectId]?.form
    },
    // 기술 스킬 관련
    setSkills(projectId, skills) {
      if (!this.projects[projectId]) {
        this.projects[projectId] = {}
      }
      this.projects[projectId].skills = {
        device: skills.device || [],
        os: skills.os || [],
        dbms: skills.dbms || [],
        language: skills.language || [],
        tool: skills.tool || [],
        framework: skills.framework || [],
      }
    },

    getSkills(projectId) {
      return (
        this.projects[projectId]?.skills || {
          device: [],
          os: [],
          dbms: [],
          language: [],
          tool: [],
          framework: [],
        }
      )
    },

    resetProject(projectId) {
      this.projects[projectId] = {
        form: {
          name: '',
          startDate: '',
          endDate: '',
          client: '',
          workUnit: '',
          role: '',
        },
        skills: {
          device: [],
          os: [],
          dbms: [],
          language: [],
          tool: [],
          framework: [],
        },
      }
    },

    deleteProject(projectId) {
      delete this.projects[projectId]
    },
  },
})
