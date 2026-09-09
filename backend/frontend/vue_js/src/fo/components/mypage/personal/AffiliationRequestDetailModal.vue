<template>
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title" style="font-weight: bold">소속 신청 내역</h4>
      <button
        type="button"
        class="btn-close"
        @click="closeModal"
        aria-hidden="true"
      ></button>
    </div>
    <div class="modal-body" style="background-color: #f5f5f5">
      <!-- 회사명 -->
      <div class="mb-3">
        <label
          for="companyName"
          class="form-label text-primary"
          style="font-weight: bold"
          >회사명</label
        >
        <div class="text-dark" id="companyName">
          {{ companyInfo.companyNm }}
        </div>
      </div>

      <!-- 대표자명  -->
      <div class="mb-3">
        <label
          for="ceoName"
          class="form-label text-primary"
          style="font-weight: bold"
          >대표자명</label
        >
        <div class="text-dark" id="ceoName">{{ companyInfo.ceoNm }}</div>
      </div>

      <!-- 개업년수 -->
      <div class="mb-3">
        <label
          for="yearsInBusiness"
          class="form-label text-primary"
          style="font-weight: bold"
          >개업년수</label
        >
        <div class="text-dark" id="yearsInBusiness">
          {{ companyInfo.openYear }}년
        </div>
      </div>

      <!-- 회사위치 -->
      <div class="mb-3">
        <label
          for="companyLocation"
          class="form-label text-primary"
          style="font-weight: bold"
          >회사위치</label
        >
        <div class="text-dark" id="companyLocation">
          {{ companyInfo.address }}
        </div>
      </div>

      <!-- 간단한 설명 -->
      <div class="mb-3">
        <label
          for="companyDescription"
          class="form-label text-primary"
          style="font-weight: bold"
          >회사 설명</label
        >
        <div class="text-dark" id="companyDescription">
          {{ companyInfo.greeting }}
        </div>
      </div>

      <!-- 관련 태그 -->
      <div class="mb-3">
        <label
          for="companyTags"
          class="form-label text-primary"
          style="font-weight: bold"
          >관련 태그</label
        >
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            v-for="tag in companyInfo.tags"
            :key="tag"
            class="btn btn-rounded btn-3d btn-light"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 이력서 선택 -->
      <div class="mb-3">
        <label
          for="resume"
          class="form-label text-primary"
          style="font-weight: bold"
          >소속 신청한 이력서</label
        >
        <div class="text-dark" id="resume">
          선택한 이력서:
          <button type="button" class="text-primary" @click="openResumeModal">
            {{ applyInfo.resumeTtl }}
          </button>
        </div>
      </div>

      <!-- 간단한 자기소개 -->
      <div class="mb-3">
        <label
          for="selfIntroduction"
          class="form-label text-primary"
          style="font-weight: bold"
          >간단한 자기소개</label
        >
        <div class="text-dark" id="introduce">
          {{ applyInfo.greeting }}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <!-- <button type="button" class="btn btn-primary" @click="handleSubmit">
        신청 취소
      </button> -->
      <button type="button" class="btn btn-light" @click="closeModal">
        닫기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import ResumeDetailModal from '../common/ResumeDetailModal.vue'

const modalStore = useModalStore()
const alertStore = useAlertStore()

const props = defineProps({
  applicationSq: {
    type: Number,
    required: true,
    default: 0,
  },
})

const companyInfo = ref({})
const applyInfo = ref({})

const getCompanyInfo = async () => {
  try {
    const res = await api.$get(`/mypage/applications/${props.applicationSq}`)
    companyInfo.value = res.output.affiliation
    applyInfo.value = res.output.apply
  } catch (error) {
    alertStore.show('소속 정보를 불러올 수 없습니다.', 'danger')
  }
}

// 이력서 모달창 열기
const openResumeModal = () => {
  modalStore.openModal(ResumeDetailModal, {
    title: '이력서 상세보기',
    size: 'modal-lg',
    resumeSq: applyInfo.value.resumeSq,
    onConfirm: () => {},
  })
}

// 모달 닫기
const closeModal = () => {
  modalStore.closeModal()
}

onMounted(() => {
  getCompanyInfo()
})
</script>

<style scoped>
.modal-content {
  border-radius: 8px;
}

.btn-rounded {
  border-radius: 20px;
}

.btn-3d {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gap-2 {
  gap: 0.5rem;
}
</style>
