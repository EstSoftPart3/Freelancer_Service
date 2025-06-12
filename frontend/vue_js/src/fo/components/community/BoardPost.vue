<template>
  <div>
    <div class="post-header">
      <h1 class="font-weight-semi-bold mb-0 position-relative">
        <div v-if="boardType == 'qna'" class="d-flex flex-wrap gap-2 mb-2">
          <span
            v-if="boardInfo.boardAdoptStatusCd == 1501"
            class="badge bg-warning badge-xs font-size-l"
            >진행중</span
          >
          <span
            v-if="boardInfo.boardAdoptStatusCd == 1502"
            class="badge bg-success badge-xs font-size-l"
            >채택완료</span
          >
          <span
            v-if="boardInfo.boardAdoptStatusCd == 1503"
            class="badge bg-secondary badge-xs font-size-l"
            >자체해결</span
          >
          <span
            v-if="boardInfo.boardAdoptStatusCd == 1504"
            class="badge bg-danger badge-xs font-size-l"
            >미해결</span
          >
        </div>
        <div
          v-if="boardInfo.isAdoptedYn == 'Y'"
          class="d-flex flex-wrap gap-2 mb-2"
        >
          <span class="badge bg-primary badge-xs font-size-l">채택 답변</span>
        </div>
        <!-- 제목 + 오른쪽 아이콘들 -->
        <div class="d-flex justify-content-between align-items-start ttl-area">
          <p class="text-primary board-ttl">{{ boardInfo.ttl }}</p>
          <!-- 아이콘 버튼 -->
          <span class="post-icons d-flex ttl-icon-area">
            <!-- 조회수 버튼 추가 -->
            <button
              type="button"
              class="btn btn-light btn-rounded text-grey d-flex align-items-center me-2 font-size-xs"
            >
              <i class="fa-solid fa-eye font-size-s"></i>
              <span class="me-2 ms-2 text-grey">조회수</span>
              <span>{{ boardInfo.viewCnt }}</span>
            </button>
            <!-- 추천 버튼 -->
            <button
              type="button"
              class="btn btn-light btn-rounded text-grey d-flex align-items-center me-2 font-size-xs"
              @click="rcmndBoard"
            >
              <i class="fa-regular fa-thumbs-up font-size-s"></i>
              <span class="me-2 ms-2 text-grey">추천</span>
              <span>{{ boardInfo.recommendCnt }}</span>
            </button>
            <!-- 신고 버튼 -->
            <button
              v-if="boardInfo.userSq != viewerSq"
              type="button"
              class="btn btn-light btn-rounded text-grey d-flex align-items-center me-2 font-size-xs"
              @click="clickReportApplication"
            >
              <i class="fa-solid fa-land-mine-on font-size-s"></i>
              <span class="me-2 ms-2 text-grey">신고</span>
            </button>
          </span>
        </div>
      </h1>
      <div class="post-meta">
        <span class="me-2"
          ><i class="far fa-user"></i> By
          <a href="#">{{ boardInfo.userNm }}</a>
        </span>
        <span
          ><i class="far fa-calendar-alt me-1"></i>
          <span class="text-primary">{{
            formatTime(boardInfo.createdAt)
          }}</span></span
        >
      </div>
    </div>
    <!-- 게시글 본문 -->
    <div
      class="post-description mt-5 mb-5 text-5"
      v-html="boardInfo.description"
    ></div>
    <!-- 첨부파일 섹션 -->
    <div
      v-if="boardInfo.attachments?.length > 0"
      class="post-attachments mt-3 mb-4"
    >
      <h5 class="font-weight-bold text-grey">첨부파일</h5>
      <ul class="list-unstyled">
        <li v-for="attachment in boardInfo.attachments" :key="attachment">
          <a :href="`/api/board/download/${attachment.fileSq}`" download>{{
            attachment.fileOriginalNm
          }}</a>
        </li>
      </ul>
    </div>
    <!-- "태그" 제목 추가 -->
    <div
      v-if="boardInfo.normalTags.length > 0 || boardInfo.skillTags?.length > 0"
      class="post-tags mt-4"
    >
      <h5 class="font-weight-bold text-grey">태그</h5>
      <!-- 태그 제목 추가 -->

      <a
        v-for="skill_tag in boardInfo.skillTags"
        :key="skill_tag"
        href="#"
        class="btn btn-rounded btn-primary me-2"
        ><img
          :src="getSkillIcon(skill_tag.skillTagNm)"
          :alt="skill_tag.skillTagNm"
          class="skill-icon"
        />{{ skill_tag.skillTagNm }}</a
      >
      <a
        v-for="normal_tag in boardInfo.normalTags"
        :key="normal_tag"
        href="#"
        class="btn btn-rounded btn-light me-2"
        >{{ normal_tag }}</a
      >
    </div>
    <div class="post-admin mt-4 text-end">
      <button
        v-if="
          boardType == 'qna' && boardInfo.userSq != viewerSq && viewerSq != null
        "
        type="button"
        class="btn btn-primary me-2"
        @click="clickApplication"
      >
        답변 작성
      </button>
      <button
        v-if="
          boardType == 'qna' &&
          boardInfo.userSq == viewerSq &&
          boardInfo.boardAdoptStatusCd == 1501
        "
        type="button"
        class="btn btn-primary me-2"
        @click="updateStatus(1503)"
      >
        자체 해결
      </button>
      <button
        v-if="
          boardType == 'qna' &&
          boardInfo.userSq == viewerSq &&
          boardInfo.boardAdoptStatusCd == 1501
        "
        type="button"
        class="btn btn-primary me-2"
        @click="updateStatus(1504)"
      >
        미해결
      </button>
      <button
        v-if="boardInfo.userSq == viewerSq"
        class="btn btn-primary me-2"
        @click="editBoard"
      >
        수정
      </button>
      <button
        v-if="boardInfo.userSq == viewerSq"
        type="button"
        class="btn btn-primary"
        @click="openConfirm"
      >
        삭제
      </button>

      <!-- [추가] 답변글인 경우에만 && 원 QnA 게시글의 작성자 본인일 경우에만 -->
      <button
        v-if="
          boardType == 'answer' &&
          parentUserSq == viewerSq &&
          adoptStatusCd == 1501
        "
        class="btn btn-primary"
        @click="clickAdopt"
      >
        답변 채택하기
      </button>
    </div>
  </div>
</template>
<script setup>
import { useModalStore } from '@/fo/stores/modalStore'
import { computed, defineProps, onMounted, ref, watch } from 'vue'
import AnswerRegisterModal from './AnswerRegisterModal.vue'
import CommonConfirmModal from '../common/CommonConfirmModal.vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import ReportModal from './ReportModal.vue'
import { useBoardStore } from '@/fo/stores/boardStore'
import { useRouter } from 'vue-router'
import { api } from '@/axios'
import skillIconMap from '@/assets/skillIconMap.js'

const alertStore = useAlertStore()
const modalStore = useModalStore()
const boardStore = useBoardStore()

const router = useRouter()

const props = defineProps({
  boardInfo: {
    type: Object,
    default: () => ({}),
  },
  boardType: { type: String, default: '' },
  parentUserSq: { type: Number, default: 0 },
  getBoard: { type: Function, default: () => {} },
  adoptStatusCd: { type: Number, default: 0 },
})

const boardInfo = computed(() => props.boardInfo)
const boardType = computed(() => props.boardType)
const parentUserSq = computed(() => props.parentUserSq)
const adoptStatusCd = computed(() => props.adoptStatusCd)

const formatTime = (createdAt) => {
  const date = new Date(createdAt)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day

  return `${year}-${month}-${day}`
}

// 현재 사용자 시퀀스
const viewerSq = ref(boardStore.viewerSq)

// 상태 변경
const updateStatus = (cd) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '채택 상태 변경',
    message: `${cd == 1503 ? '자체해결' : '미해결'} 상태로 변경하시겠습니까?`,
    onConfirm: async () => {
      const res = await api.$put(`/qna/${boardInfo.value.sq}/status/${cd}`)
      if (res.status == 'OK') {
        alertStore.show(
          `${cd == 1503 ? '자체해결' : '미해결'} 상태로 변경되었습니다.`,
          'success',
        )
        props.getBoard()
      } else {
        alertStore.show('채택 상태 변경에 실패하였습니다.', 'danger')
      }
      modalStore.closeModal()
    },
  })
}

// 추천
const rcmndBoard = async () => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  const res = await api.$post(
    `/${boardType.value}/${boardInfo.value.sq}/recommend`,
  )
  if (res.status == 'OK') {
    alertStore.show(res.message, 'success')
    props.getBoard()
  } else {
    alertStore.show('추천 반영에 실패하였습니다.', 'danger')
  }
}

// 게시글 수정 모달
const editBoard = () => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  boardStore.setBoard(boardInfo.value)
  boardStore.editSq = Number(boardInfo.value.sq)
  if (boardType.value == 'board' || boardType.value == 'qna') {
    router.push(`/${boardType.value}/register`)
  } else if (boardType.value == 'answer') {
    modalStore.openModal(AnswerRegisterModal, { size: 'modal-lg' })
  }
}

// 삭제 컨펌 모달
const openConfirm = () => {
  modalStore.openModal(CommonConfirmModal, {
    title: '게시글 삭제',
    message: '정말 삭제하시겠습니까?',
    onConfirm: async () => {
      const res = await api.$patch(`/${boardType.value}/${boardInfo.value.sq}`)
      if (res.status == 'OK') {
        alertStore.show(res.message, 'success')
        if (boardType.value == 'answer') {
          window.location.reload()
        } else {
          router.push(`/${boardType.value}`)
        }
      } else {
        alertStore.show('채택 상태 변경에 실패하였습니다.', 'danger')
      }
      modalStore.closeModal()
      modalStore.closeModal()
    },
  })
}

// 답변 작성 모달
const clickApplication = () => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  modalStore.openModal(AnswerRegisterModal, {
    size: 'modal-lg',
    onConfirm: () => {
      modalStore.closeModal()
      props.getBoard()
    },
  })
}

// 신고 모달
const clickReportApplication = () => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  modalStore.openModal(ReportModal, {
    reportTypeCd: boardType.value == 'answer' ? 2002 : 2001,
    sq: boardInfo.value.sq,
  })
}

// 답변 채택
const clickAdopt = () => {
  modalStore.openModal(CommonConfirmModal, {
    title: '답변 채택',
    message: '채택 이후 변경 불가합니다. 답변을 채택 하시겠습니까?',
    onConfirm: async () => {
      try {
        const res = await api.$patch(`/answer/${boardInfo.value.sq}/adopt`)
        if (res.status == 'OK') {
          alertStore.show(res.message, 'success')
        } else {
          alertStore.show(res.message, 'danger')
        }
        modalStore.closeModal()
      } catch (error) {
        alertStore.show('답변 채택에 실패했습니다.', 'danger')
      }
    },
  })
}

// 기술태그 아이콘
const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

// 파일 url

watch(
  () => boardStore.viewerSq,
  (newVal) => {
    viewerSq.value = newVal
  },
)

onMounted(() => {
  viewerSq.value = boardStore.viewerSq
})
</script>
<style>
button {
  background: inherit;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  overflow: visible;
  cursor: pointer;
}
.font-size-xs {
  font-size: 1rem;
}
.font-size-s {
  font-size: 1.2rem;
}
.font-size-l {
  font-size: large;
}
.ttl-area {
  flex-wrap: wrap;
}
.board-ttl {
  line-height: 1.2;
}
.ttl-icon-area {
  margin-left: auto;
}
.skill-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}
</style>
