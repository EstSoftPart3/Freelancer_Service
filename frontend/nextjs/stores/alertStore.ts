// Mirrors vue_js/src/fo/stores/alertStore.js
// CommonAlert.vue 역할을 Sonner toast로 대체 — 별도 Zustand 상태 불필요
import { toast } from 'sonner'

export const alertStore = {
  // 같은 문구는 id 로 묶어 하나만 띄운다 — 상세 화면이 개발 StrictMode 이중 effect 등으로 같은 실패를
  // 두 번 처리하면(삭제된 글 알림 클릭 등) 같은 토스트가 겹쳐 떴다.
  show(message: string, type: 'success' | 'danger' = 'success') {
    if (type === 'success') toast.success(message, { id: message })
    else toast.error(message, { id: message })
  },
}
