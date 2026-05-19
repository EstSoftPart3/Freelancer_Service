// Mirrors vue_js/src/fo/stores/modalStore.js (composition API stack pattern)
import { create } from 'zustand'
import { ModalConfig } from '@/types'

interface ModalState {
  modalStack: ModalConfig[]
  isOpen: boolean
  openModal: (component: ModalConfig['component'], props?: ModalConfig['props']) => void
  closeModal: () => void
  closeAllModals: () => void
  getCurrentModal: () => ModalConfig | undefined
}

export const useModalStore = create<ModalState>((set, get) => ({
  modalStack: [],
  isOpen: false,

  openModal: (component, props) =>
    set((state) => ({
      modalStack: [...state.modalStack, { component, props }],
      isOpen: true,
    })),

  closeModal: () =>
    set((state) => {
      const next = state.modalStack.slice(0, -1)
      return { modalStack: next, isOpen: next.length > 0 }
    }),

  closeAllModals: () => set({ modalStack: [], isOpen: false }),

  getCurrentModal: () => {
    const stack = get().modalStack
    return stack[stack.length - 1]
  },
}))
