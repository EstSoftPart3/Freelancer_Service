<template>
  <!-- isOpen 상태일 때만 모달 컴포넌트를 렌더링하여 화면 하단에 깨지는 현상 방지 -->
  <ResumeDetailModal
    v-if="isOpen"
    ref="baseModalRef"
    @close="closeModal"
  >
    <template #footer>
      <div class="d-flex justify-content-between align-items-center w-100">
        <div>
          <!-- 기업 회원(isCorporate)일 경우에만 스카우트 제안 버튼 노출 -->
          <button
            v-if="isCorporateUser"
            type="button"
            class="btn btn-primary px-4"
            @click="handleScoutOffer"
          >
            스카우트 제안
          </button>
        </div>

        <button
          type="button"
          class="btn btn-outline-secondary px-4"
          @click="closeModal"
        >
          닫기
        </button>
      </div>
    </template>
  </ResumeDetailModal>
</template>

<script setup>
import { ref, computed, nextTick, defineEmits, defineExpose } from 'vue'
import ResumeDetailModal from '@/fo/components/mypage/common/ResumeDetailModal.vue'
import { useUserStore } from '@/fo/stores/userStore'

const emit = defineEmits(['open-scout-offer'])

const userStore = useUserStore()
const baseModalRef = ref(null)
const currentScout = ref(null)
const isOpen = ref(false)

const isCorporateUser = computed(() => {
  return (
    userStore.isCorporate ||
    userStore.userInfo?.userType === 'CORPORATE' ||
    userStore.userInfo?.role === 'ROLE_COMPANY'
  )
})

const openModal = async (scout) => {
  currentScout.value = scout
  isOpen.value = true

  await nextTick()
  if (baseModalRef.value?.openModal) {
    baseModalRef.value.openModal(scout)
  }
}

const closeModal = () => {
  if (baseModalRef.value?.closeModal) {
    baseModalRef.value.closeModal()
  }
  isOpen.value = false
}

const handleScoutOffer = () => {
  emit('open-scout-offer', currentScout.value)
}

defineExpose({
  openModal,
  closeModal,
})
</script>