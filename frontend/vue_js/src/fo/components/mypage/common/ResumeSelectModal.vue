<template>
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">이력서 선택</h4>
      <button
        type="button"
        class="btn-close"
        @click="close"
        aria-hidden="true"
      ></button>
    </div>

    <div class="modal-body">
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
              v-if="resume.resumeIsRepresentativeYn === 'Y'"
              class="badge bg-primary ms-2 align-middle"
              style="font-size: 12px; padding: 3px 6px"
            >
              대표 이력서
            </span>
            <div class="post-meta">
              <span class="text-dark text-uppercase font-weight-semibold"
                >등록일자</span
              >
              | {{ formatTime(resume.resumeCreatedAtDtm) }}
            </div>
          </div>

          <div class="ms-auto">
            <button
              v-if="selectedResume.some((r) => r.resumeSq === resume.resumeSq)"
              class="btn btn-primary btn-sm"
              disabled
            >
              선택됨
            </button>
            <button
              v-else
              class="btn btn-outline-primary btn-sm"
              @click="selectResume(resume)"
            >
              선택하기
            </button>
          </div>
        </li>
      </ul>

      <CommonPagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:currentPage="currentPage = $event"
      />
    </div>

    <div class="modal-footer">
      <button @click="confirm" class="btn btn-primary">선택 완료</button>
      <button @click="close" class="btn btn-light">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, reactive } from 'vue'
import { useModalStore } from '../../../stores/modalStore'
import { useAlertStore } from '../../../stores/alertStore'
import { api } from '@/axios.js'

import CommonPagination from '@/fo/components/common/CommonPagination.vue'

import ResumeDetailModal from '@/fo/components/project/ProjectResumeDetailModal.vue'

const props = defineProps({
  userSq: {
    type: Number,
    required: false, // 소속 인원 리스트에서 호출할 때만 전달.
  },
  projectSq: {
    type: Number,
    required: false, // 개인 지원 할 때만 필요.
  },
  role: {
    type: String,
    required: true,
  },
  onConfirm: {
    type: Function,
    required: false,
  },
})

const modalStore = useModalStore()
const alertStore = useAlertStore()

const currentPage = ref(1)
const totalPages = ref(1)
const resumes = ref([])
const selectedResume = reactive([])

const close = () => {
  modalStore.closeModal()
}

const getResumes = async () => {
  if (props.role === 'PERSONAL') {
    try {
      const res = await api.$get('/mypage/resume/select-list')
      // console.log('이력서 목록 응답:', res)
      if (Array.isArray(res.output)) {
        // console.log(res.output)
        resumes.value = res.output
      } else {
        console.error('이력서 목록이 배열이 아닙니다:', res)
      }
    } catch (error) {
      console.error('이력서 목록 조회 실패:', error)
    }
  } else if (props.role === 'COMPANY') {
    try {
      const res = await api.$get(`/mypage/resume/list/${props.userSq}`)
      if (Array.isArray(res.output)) {
        resumes.value = res.output
      } else {
        console.error('이력서 목록이 배열이 아닙니다:', res)
      }
    } catch (error) {
      console.error('이력서 목록 조회 실패:', error)
    }
  }
}

const selectResume = (resume) => {
  // 1. 기존 대표 이력서 뱃지 제거
  resumes.value = resumes.value.map((r) => ({
    ...r,
    resumeIsRepresentativeYn: 'N',
  }))

  // 2. 선택된 이력서에 대표 뱃지 부여
  const selected = resumes.value.find((r) => r.resumeSq === resume.resumeSq)
  if (selected) {
    selected.resumeIsRepresentativeYn = 'Y'
  }

  // 3. selectedResume 업데이트 (배열이므로 비우고 다시 push)
  selectedResume.splice(0, selectedResume.length, resume)
}

const openResumeDetailModal = (resume) => {
  modalStore.openModal(ResumeDetailModal, {
    title: '이력서 상세보기',
    size: 'modal-lg',
    resumeSq: resume.resumeSq,
    onConfirm: () => selectResume(resume),
  })
}

const formatTime = (createdAt) => {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

const confirm = async () => {
  if (selectedResume.length === 0) {
    alertStore.show('이력서를 선택해주세요.', 'danger')
    return
  }

  if (props.role === 'PERSONAL') {
    try {
      await api.$post(`/projects/applications/${props.projectSq}`, {
        resumeSq: selectedResume.map((r) => r.resumeSq),
        projectApplicationTyp: props.role,
      })

      alertStore.show('프로젝트 지원에 성공하였습니다.')

      // ✅ 콜백 실행
      if (props.onConfirm) {
        props.onConfirm()
      }

      modalStore.closeModal()
    } catch (error) {
      console.error(error)
      alertStore.show('프로젝트 지원에 실패했습니다.', 'danger')
    }
  } else if (props.role === 'COMPANY') {
    try {
      await api.$patch(
        `/mypage/resume/representative/${selectedResume[0].resumeSq}`,
        {
          memberSq: props.userSq,
        },
        {
          withCredentials: true,
        },
      )

      // ✅ 콜백 실행
      if (props.onConfirm) {
        props.onConfirm()
      }

      modalStore.closeModal()
    } catch (error) {
      console.error(error)
      alertStore.show('프로젝트 지원에 실패했습니다.', 'danger')
    }
  }
}

onMounted(() => {
  getResumes()
})
</script>
