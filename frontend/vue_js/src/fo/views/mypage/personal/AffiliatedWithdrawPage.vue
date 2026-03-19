<template>
  <div>
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">소속 탈퇴</h4>
      </div>
    </div>

    <div class="card p-4 mt-3">
      <h5 class="mb-3">소속 탈퇴 안내</h5>
      <ul class="mb-4" style="line-height: 2">
        <li>소속 탈퇴 시 해당 소속에서 즉시 제외됩니다.</li>
        <li>탈퇴 후 동일 소속에 재가입하려면 처음부터 다시 신청해야 합니다.</li>
        <li>탈퇴 처리된 이력은 취소할 수 없습니다.</li>
      </ul>
      <div class="d-flex justify-content-end">
        <button type="button" class="btn btn-danger" @click="confirmLeave">
          소속 탈퇴
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { api } from '@/axios'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'

const router = useRouter()
const userStore = useUserStore()
const alertStore = useAlertStore()
const modalStore = useModalStore()

const confirmLeave = () => {
  modalStore.openModal(CommonConfirmModal, {
    title: '소속 탈퇴',
    message: '소속을 탈퇴하시겠습니까? 탈퇴 후에는 취소할 수 없습니다.',
    confirmText: '탈퇴',
    cancelText: '취소',
    onConfirm: async () => {
      try {
        await api.$patch('/affiliation/leave', {}, { withCredentials: true })
        userStore.isAffiliated = 'N'
        userStore.affiliatedCompanySq = null
        localStorage.setItem('isAffiliated', 'N')
        modalStore.closeModal()
        alertStore.show('소속 탈퇴가 완료되었습니다.', 'success')
        router.push('/mypage')
      } catch (e) {
        modalStore.closeModal()
        alertStore.show('소속 탈퇴 중 오류가 발생했습니다.', 'danger')
      }
    },
  })
}
</script>
