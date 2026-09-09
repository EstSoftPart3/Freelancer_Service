<template>
  <div class="testpage-container">
    <CommonPageHeader
      title="테스트페이지"
      strongText="예제 모음"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: 'Test' }]"
    />
    <div class="mt-5"></div>
    <button @click="openConfirm">Confirm 열기 / 성공 Alert</button>
    <button @click="openConfirmLarge">Confirm (large) 열기 / 실패 Alert</button>

    <button @click="openResumeDetailModal">이력서 상세보기 모달창 샘플</button>

    <CommonPagination
      :currentPage="1"
      :totalPages="10"
      @update:currentPage="page = $event"
    />
  </div>
</template>

<script setup>
import CommonPagination from '../components/common/CommonPagination.vue'
import CommonConfirmModal from '../components/common/CommonConfirmModal.vue'
import CommonPageHeader from '../components/common/CommonPageHeader.vue'
import { useModalStore } from '../stores/modalStore'
import { useAlertStore } from '../stores/alertStore'
import ResumeDetailModal from '../components/mypage/common/ResumeDetailModal.vue'

const alertStore = useAlertStore()

const modalStore = useModalStore()

function openConfirm() {
  modalStore.openModal(CommonConfirmModal, {
    title: '기본 모달창',
    message: '정말 삭제하시겠습니까?',
    onConfirm: () => {
      alertStore.show('삭제하였습니다.', 'success')
      modalStore.closeModal()
    },
  })
}

function openConfirmLarge() {
  modalStore.openModal(CommonConfirmModal, {
    title: '기본 모달창 (Large)',
    message: '정말 삭제하시겠습니까?',
    size: 'modal-lg', // 큰 모달
    onConfirm: () => {
      alertStore.show('삭제에 실패하였습니다.', 'danger')
      modalStore.closeModal()
    },
  })
}

function openResumeDetailModal() {
  modalStore.openModal(ResumeDetailModal, {
    title: '이력서 상세보기',
    size: 'modal-lg',
    props: {
      resumeSq: 1234, // 여기에 실제 이력서 번호 넘김
    },
    onConfirm: () => {
      modalStore.closeModal()
    },
  })
}
</script>

<style scoped>
.testpage-container {
  height: 100%; /* 화면 전체 높이 */
  overflow-y: auto; /* 콘텐츠가 넘칠 경우 스크롤 가능 */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
