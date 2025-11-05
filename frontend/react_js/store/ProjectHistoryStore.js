import { create } from 'zustand';

export const useProjectStore = create((set, get) => ({
  // 프로젝트별 폼 데이터 저장
  forms: {},
  // 프로젝트별 선택된 스킬 저장
  skills: {},

  // 폼 존재 여부 확인
  hasForm: (projectId) => {
    const forms = get().forms;
    return projectId in forms;
  },

  // 폼 초기화
  initForm: (projectId) => {
    set((state) => ({
      forms: {
        ...state.forms,
        [projectId]: {
          name: '',
          client: '',
          workUnit: '',
          role: '',
          startDate: null,
          endDate: null,
        },
      },
      skills: {
        ...state.skills,
        [projectId]: {
          device: [],
          os: [],
          dbms: [],
          language: [],
          tool: [],
          framework: [],
        },
      },
    }));
  },

  // 폼 데이터 가져오기
  getForm: (projectId) => {
    const forms = get().forms;
    return forms[projectId] || {
      name: '',
      client: '',
      workUnit: '',
      role: '',
      startDate: null,
      endDate: null,
    };
  },

  // 폼 데이터 설정
  setForm: (projectId, formData) => {
    set((state) => ({
      forms: {
        ...state.forms,
        [projectId]: formData,
      },
    }));
  },

  // 스킬 데이터 가져오기
  getSkills: (projectId) => {
    const skills = get().skills;
    return skills[projectId] || {
      device: [],
      os: [],
      dbms: [],
      language: [],
      tool: [],
      framework: [],
    };
  },

  // 스킬 데이터 설정
  setSkills: (projectId, skillsData) => {
    set((state) => ({
      skills: {
        ...state.skills,
        [projectId]: skillsData,
      },
    }));
  },

  // 특정 프로젝트 데이터 삭제
  clearProject: (projectId) => {
    set((state) => {
      const newForms = { ...state.forms };
      const newSkills = { ...state.skills };
      delete newForms[projectId];
      delete newSkills[projectId];
      return {
        forms: newForms,
        skills: newSkills,
      };
    });
  },

  // 모든 데이터 초기화
  clearAll: () => {
    set({ forms: {}, skills: {} });
  },
}));

