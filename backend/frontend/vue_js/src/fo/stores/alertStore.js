import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  const visible = ref(false)
  const message = ref('')
  const type = ref('success') // success | danger

  function show(msg, msgType = 'success') {
    message.value = msg
    type.value = msgType
    visible.value = true

    setTimeout(() => {
      visible.value = false
    }, 3000) // 자동 닫힘
  }

  function hide() {
    visible.value = false
  }

  return {
    visible,
    message,
    type,
    show,
    hide,
  }
})
