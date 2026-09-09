// src/stores/modalStore.js
import { defineStore } from 'pinia'
import { ref, markRaw } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const modalStack = ref([]) // 모달 스택을 배열로 관리
  const isOpen = ref(false) // 모달 열림 여부

  function openModal(component, props = {}) {
    modalStack.value.push({
      component: markRaw(component), // markRaw로 감싸기
      props,
    })
    isOpen.value = true
  }

  // 모달 닫기
  function closeModal() {
    modalStack.value.pop() // 현재 모달을 스택에서 제거
    if (modalStack.value.length > 0) {
      isOpen.value = true // 스택에 남아있는 모달을 다시 열기
    } else {
      isOpen.value = false // 더 이상 모달이 없으면 모달 닫기
    }
  }

  //  모든 모달 한꺼번에 닫기
  function closeAllModals() {
    modalStack.value = []
    isOpen.value = false
  }

  // 현재 모달 정보를 가져오기
  function getCurrentModal() {
    return modalStack.value[modalStack.value.length - 1]
  }

  return {
    modalStack,
    isOpen,
    openModal,
    closeModal,
    closeAllModals,
    getCurrentModal,
  }
})
