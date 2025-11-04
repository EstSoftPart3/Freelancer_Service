import { create } from 'zustand'

// 마이페이지 모달 관리 store
export const useMypageStore = create((set, get) => ({
  modalStack: [],
  isOpen: false,

  // 모달 열기 함수들
  openSkillModal: (component, props = {}) => {
    set((state) => ({
      modalStack: [...state.modalStack, {
        component,
        props,
        type: 'skill',
      }],
      isOpen: true,
    }))
  },

  openProjectModal: (component, props = {}) => {
    set((state) => ({
      modalStack: [...state.modalStack, {
        component,
        props,
        type: 'project',
      }],
      isOpen: true,
    }))
  },

  openEducationModal: (component, props = {}) => {
    set((state) => ({
      modalStack: [...state.modalStack, {
        component,
        props,
        type: 'education',
      }],
      isOpen: true,
    }))
  },

  openCareerModal: (component, props = {}) => {
    set((state) => ({
      modalStack: [...state.modalStack, {
        component,
        props,
        type: 'career',
      }],
      isOpen: true,
    }))
  },

  openTrainingModal: (component, props = {}) => {
    set((state) => ({
      modalStack: [...state.modalStack, {
        component,
        props,
        type: 'training',
      }],
      isOpen: true,
    }))
  },

  openCertificateModal: (component, props = {}) => {
    set((state) => ({
      modalStack: [...state.modalStack, {
        component,
        props,
        type: 'certificate',
      }],
      isOpen: true,
    }))
  },

  openResumeModal: (component, props = {}) => {
    set((state) => ({
      modalStack: [...state.modalStack, {
        component,
        props,
        type: 'resume',
      }],
      isOpen: true,
    }))
  },

  openAddressSearchModal: (component, props = {}) => {
    set((state) => ({
      modalStack: [...state.modalStack, {
        component,
        props,
        type: 'addressSearch',
      }],
      isOpen: true,
    }))
  },

  // 모달 닫기
  closeModal: () => {
    set((state) => {
      const newStack = [...state.modalStack]
      newStack.pop()
      
      return {
        modalStack: newStack,
        isOpen: newStack.length > 0,
      }
    })
  },

  // 현재 모달 정보를 가져오기
  getCurrentModal: () => {
    const state = get()
    return state.modalStack[state.modalStack.length - 1]
  },
}))

// 학력 검색 시 주소 유지하도록 전역 상태 저장
export const useSchoolStore = create((set) => ({
  selectedSchool: null,

  setSchool: (school) => {
    set({ selectedSchool: school })
  },
}))

