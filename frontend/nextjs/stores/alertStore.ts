// Mirrors vue_js/src/fo/stores/alertStore.js
// CommonAlert.vue 역할을 Sonner toast로 대체 — 별도 Zustand 상태 불필요
import { toast } from 'sonner'

export const alertStore = {
  show(message: string, type: 'success' | 'danger' = 'success') {
    if (type === 'success') toast.success(message)
    else toast.error(message)
  },
}
