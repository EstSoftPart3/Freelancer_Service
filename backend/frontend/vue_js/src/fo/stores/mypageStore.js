import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMypageStore = defineStore('mypage', () => {
  const modalStack = ref([])
  const isOpen = ref(false)

  // 모달 열기 함수들
  const openSkillModal = (component, props = {}) => {
    modalStack.value.push({
      component,
      props,
      type: 'skill',
    })
    isOpen.value = true
  }

  const openProjectModal = (component, props = {}) => {
    modalStack.value.push({
      component,
      props,
      type: 'project',
    })
    isOpen.value = true
  }

  const openEducationModal = (component, props = {}) => {
    modalStack.value.push({
      component,
      props,
      type: 'education',
    })
    isOpen.value = true
  }

  const openCareerModal = (component, props = {}) => {
    modalStack.value.push({
      component,
      props,
      type: 'career',
    })
    isOpen.value = true
  }

  const openTrainingModal = (component, props = {}) => {
    modalStack.value.push({
      component,
      props,
      type: 'training',
    })
    isOpen.value = true
  }

  const openCertificateModal = (component, props = {}) => {
    modalStack.value.push({
      component,
      props,
      type: 'certificate',
    })
    isOpen.value = true
  }

  const openResumeModal = (component, props = {}) => {
    modalStack.value.push({
      component,
      props,
      type: 'resume',
    })
    isOpen.value = true
  }

  const openAddressSearchModal = (component, props = {}) => {
    modalStack.value.push({
      component,
      props,
      type: 'addressSearch',
    })
    isOpen.value = true
  }

  // 모달 닫기
  const closeModal = () => {
    modalStack.value.pop()
    if (modalStack.value.length > 0) {
      isOpen.value = true
    } else {
      isOpen.value = false
    }
  }

  // 현재 모달 정보를 가져오기.
  const getCurrentModal = () => {
    return modalStack.value[modalStack.value.length - 1]
  }

  return {
    modalStack,
    isOpen,
    openSkillModal,
    openProjectModal,
    openEducationModal,
    openCareerModal,
    openTrainingModal,
    openCertificateModal,
    closeModal,
    getCurrentModal,
    openResumeModal,
    openAddressSearchModal,
  }
})
//학력 검색 시 주소 유지하도록 전역 상태 저장
export const useSchoolStore = defineStore('school', {
  state: () => ({
    selectedSchool: null,
  }),
  actions: {
    setSchool(school) {
      this.selectedSchool = school
    },
  },
})
