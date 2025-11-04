import { create } from 'zustand'

export const useAlertStore = create((set) => ({
  visible: false,
  message: '',
  type: 'success', // success | danger

  show: (msg, msgType = 'success') => {
    set({ message: msg, type: msgType, visible: true })
    
    setTimeout(() => {
      set({ visible: false })
    }, 3000) // 자동 닫힘
  },

  hide: () => {
    set({ visible: false })
  }
}))

