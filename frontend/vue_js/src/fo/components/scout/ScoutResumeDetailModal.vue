<template>
  <Teleport to="body">
    <!-- targetResumeSq 존재 시 모달 레이어 생성 -->
    <div
      v-if="targetResumeSq"
      class="scout-resume-modal-overlay d-flex align-items-center justify-content-center"
      @click.self="closeModal"
    >
      <div class="scout-resume-modal-card bg-white rounded-2 shadow-lg d-flex flex-column overflow-hidden">
        <!-- 상단 헤더: 제목 없이 우측 상단 X 닫기 버튼 + 구분선 -->
        <div class="modal-header px-4 py-3 border-bottom bg-white d-flex align-items-center justify-content-end">
          <button
            type="button"
            class="btn-close fs-6"
            aria-label="Close"
            @click="closeModal"
          ></button>
        </div>

        <!-- 모달 본문 (ResumeDetailModal 스크롤 영역) -->
        <div class="modal-body px-4 py-3 overflow-auto flex-grow-1">
          <ResumeDetailModal
            ref="baseModalRef"
            :resume-sq="targetResumeSq"
            :project-sq="0"
            :application-sq="0"
            @close="closeModal"
          >
            <!-- 자식 컴포넌트 내부 기본 푸터 숨김 -->
            <template #footer>
              <div class="d-none"></div>
            </template>
          </ResumeDetailModal>
        </div>

        <!-- 모달 하단 푸터 ([제의 하기] [닫기] 우측 정렬) -->
        <div class="modal-footer px-4 py-3 border-top bg-white d-flex justify-content-end align-items-center gap-2">
          <button
            v-if="isCorporateUser"
            type="button"
            class="btn btn-primary px-4 py-2 fw-bold"
            @click="handleScoutOffer"
          >
            제의 하기
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary px-4 py-2"
            @click="closeModal"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, defineEmits, defineExpose, nextTick } from 'vue'
import ResumeDetailModal from '@/fo/components/mypage/common/ResumeDetailModal.vue'
import { useUserStore } from '@/fo/stores/userStore'

const emit = defineEmits(['open-scout-offer'])

const userStore = useUserStore()
const baseModalRef = ref(null)
const currentScout = ref(null)
const targetResumeSq = ref(null)

const isCorporateUser = computed(() => {
  // 스토어 루트 및 userInfo 객체 참조
  const store = userStore || {}
  const info = userStore.userInfo || {}

  // userType 이 'COMPANY', 'CORPORATE', 또는 userTypeCd 가 302 일 때 true
  const isCorp =
    store.userType === 'COMPANY' ||
    info.userType === 'COMPANY' ||
    store.userType === 'CORPORATE' ||
    info.userType === 'CORPORATE' ||
    String(store.userTypeCd) === '302' ||
    String(info.userTypeCd) === '302' ||
    userStore.isCorporate === true

  return isCorp
})

const openModal = async (scout) => {
  targetResumeSq.value = null
  await nextTick()

  let sq = null
  if (typeof scout === 'object' && scout !== null) {
    sq =
      scout.resumeSq ||
      scout.resume_sq ||
      scout.freelancerSq ||
      scout.freelancer_sq ||
      scout.userSq ||
      scout.user_sq ||
      scout.id ||
      scout.sq
  } else {
    sq = scout
  }

  currentScout.value = scout
  targetResumeSq.value = sq ? Number(sq) : null

  await nextTick()

  if (baseModalRef.value) {
    const child = baseModalRef.value
    if (typeof child.openModal === 'function') child.openModal(targetResumeSq.value)
    else if (typeof child.open === 'function') child.open(targetResumeSq.value)
    else if (typeof child.show === 'function') child.show(targetResumeSq.value)
  }
}

const closeModal = () => {
  if (baseModalRef.value) {
    const child = baseModalRef.value
    if (typeof child.closeModal === 'function') child.closeModal()
    else if (typeof child.close === 'function') child.close()
  }
  targetResumeSq.value = null
}

const handleScoutOffer = () => {
  emit('open-scout-offer', currentScout.value)
}

defineExpose({
  openModal,
  closeModal,
})
</script>

<style scoped>
.scout-resume-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
  pointer-events: none;
  z-index: 9999;
}

.scout-resume-modal-card {
  width: 90%;
  max-width: 800px;
  height: 85vh;
  border: 1px solid #dcdcdc;
  pointer-events: auto;
  z-index: 10000;
  animation: fadeIn 0.15s ease-in-out;
}

.scout-resume-modal-card :deep(.modal-body .modal-header) {
  display: none !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>