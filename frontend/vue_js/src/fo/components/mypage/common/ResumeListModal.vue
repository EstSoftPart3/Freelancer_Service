<template>
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title" id="schoolSearchModalLabel">이력서 선택</h4>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-hidden="true"
        @click="close"
      ></button>
    </div>
    <div class="modal-body">
      <div>
        <ul class="simple-post-list m-0">
          <li
            class="d-flex align-items-center gap-2"
            v-for="resume in resumes"
            :key="resume.resumeSq"
          >
            <div class="post-info align-items-center gap-2">
              <a href="#" @click="openResumeDetailModal(resume)">
                {{ resume.resumeTtl }}
              </a>
              <span
                v-if="resume.resumeIsRepresentativeYn == 'Y'"
                class="badge bg-primary ms-2 align-middle"
                style="font-size: 12px; padding: 3px 6px"
                >대표 이력서</span
              >
              <div class="post-meta">
                <span class="text-dark text-uppercase font-weight-semibold"
                  >등록일자</span
                >
                | {{ formatTime(resume.resumeCreatedAtDtm) }}
              </div>
            </div>
            <div class="ms-auto">
              <button
                v-if="
                  selectedResume && selectedResume.resumeSq === resume.resumeSq
                "
                class="btn btn-primary btn-sm"
                disabled
              >
                선택됨
              </button>
              <button
                v-else
                class="btn btn-primary btn-outline btn-sm"
                @click="selectResume(resume)"
              >
                선택하기
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- 페이지네이션  -->
      <CommonPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:currentPage="currentPage = $event"
      />
    </div>
    <div class="modal-footer">
      <button
        @click="close"
        type="button"
        class="btn btn-light"
        data-bs-dismiss="modal"
      >
        닫기
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useModalStore } from '../../../stores/modalStore'
import { useAlertStore } from '../../../stores/alertStore'
import { api } from '@/axios.js'
import CommonPagination from '../../common/CommonPagination.vue'
import CommonConfirmModal from '../../common/CommonConfirmModal.vue'
import { useAffiliationStore } from '@/fo/stores/AffiliationStore'
import ResumeDetailModal from './ResumeDetailModal.vue'

const currentPage = ref(1)
const totalPages = ref(1)

const modalStore = useModalStore()
const selectedResume = ref(null)
const alertStore = useAlertStore()
const affiliationStore = useAffiliationStore()
const close = () => {
  modalStore.closeModal()
}

const resumes = ref([])

const getResumes = async () => {
  try {
    const res = await api.$get('/mypage/resume/select-list')
    if (Array.isArray(res.output)) {
      resumes.value = res.output
    }
  } catch (error) {
    alertStore.show('이력서 목록 조회에 실패했습니다.', 'danger')
  }
}

const selectResume = (resume) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '이력서 선택',
    message: `해당 이력서를 선택하시겠습니까?`,
    onConfirm: () => {
      affiliationStore.setResume(resume)
      alertStore.show('이력서 선택이 완료되었습니다.', 'success')
      close()
    },
  })
}

function openResumeDetailModal(resume) {
  modalStore.openModal(ResumeDetailModal, {
    title: '이력서 상세보기',
    size: 'modal-lg',
    resumeSq: resume.resumeSq,
    onConfirm: () => {
      selectResume(resume)
    },
  })
}

const formatTime = (createdAt) => {
  const date = new Date(createdAt)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day

  return `${year}.${month}.${day}`
}

onMounted(() => {
  getResumes()
})
// TODO: 이력서 제목 클릭 시 이력서 상세 모달창 호출
</script>
<style></style>
