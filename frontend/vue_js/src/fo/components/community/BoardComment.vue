<template>
  <div>
    <div class="post-comments mt-5 post-comments">
      <h4 class="mb-3 font-size-15">댓글 ({{ props.comments.length }})</h4>
      <ul class="comments">
        <li
          v-for="comment in props.comments"
          :key="comment"
          :id="`comment-${comment.sq}`"
          class="comment-item"
        >
          <div class="comment">
            <div
              class="img-thumbnail img-thumbnail-no-borders d-none d-sm-block"
            >
              <img
                v-if="comment.userProfileImgUrl != null"
                class="avatar object-fit-cover"
                alt=""
                :src="`${comment.userProfileImgUrl}`"
              />
              <div v-else class="rounded-circle comment-profile">
                <i class="fas fa-user text-muted"></i>
              </div>
            </div>
            <div class="comment-block font-size-12">
              <div class="comment-arrow"></div>
              <!-- 이름 + 신고/하트 -->
              <div
                class="d-flex justify-content-between align-items-center mb-2"
                v-show="editSq != comment.sq"
              >
                <span class="comment-by text-primary font-size-13">
                  <strong>{{ comment.userNm }}</strong>
                </span>
                <!-- 작성자 본인일 경우 -->
                <span
                  v-if="comment.userSq == viewerSq"
                  class="comment-icons d-flex"
                >
                  <button
                    href="#"
                    class="text-danger me-2 font-size-10"
                    @click="clickEdit(comment.sq, comment.description)"
                  >
                    <span class="ms-2 text-primary">수정</span>
                  </button>
                  <button
                    href="#"
                    class="text-danger font-size-10"
                    @click="openDeleteConfirm(comment.sq)"
                  >
                    <span class="ms-2 text-primary">삭제</span>
                  </button>
                </span>
                <!-- 작성자 아닌 경우 -->
                <span v-else class="comment-icons d-flex">
                  <button
                    class="text-danger me-2 font-size-10"
                    @click="rcmndComment(comment.sq)"
                  >
                    <span class="ms-2 text-primary"
                      >추천 {{ comment.recommendCnt }}</span
                    >
                  </button>
                  <button
                    class="text-danger font-size-10"
                    @click="clickReportApplication(comment.sq)"
                  >
                    <span class="ms-2 text-primary">신고</span>
                  </button>
                </span>
              </div>
              <!-- 내용 -->
              <p class="font-size-12" v-show="editSq != comment.sq">
                {{ comment.description }}
              </p>
              <form @submit.prevent="editRegisterConfirm(comment.sq)">
                <div class="input-group" v-if="editSq == comment.sq">
                  <input
                    v-model="editdescription"
                    type="text"
                    maxlength="5000"
                    class="form-control"
                    name="message"
                    placeholder="댓글을 입력해주세요"
                    required
                  />
                  <button
                    type="submit"
                    class="btn btn-primary"
                    data-loading-text="로딩 중..."
                  >
                    댓글 작성
                  </button>
                </div>
              </form>
              <!-- 날짜 + 수정/삭제 (홍길동과 동일하게 float-end 사용) -->
              <span
                class="date float-end font-size-11"
                v-show="editSq != comment.sq"
              >
                {{ formatTime(comment.createdAt) }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div class="post-block mt-5 post-leave-comment">
      <form
        class="contact-form p-4 rounded bg-color-grey"
        @submit.prevent="openRegisterConfirm"
      >
        <div class="p-2">
          <div class="row">
            <label class="form-label font-weight-bold text-dark text-5 mb-3"
              >댓글 남기기</label
            >
            <div class="input-group">
              <input
                v-model="description"
                type="text"
                maxlength="5000"
                class="form-control"
                name="message"
                placeholder="댓글을 입력해주세요"
                required
              />
              <button
                type="submit"
                class="btn btn-primary"
                data-loading-text="로딩 중..."
              >
                댓글 작성
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { useAlertStore } from '@/fo/stores/alertStore'
import { useModalStore } from '@/fo/stores/modalStore'
import { defineProps, onMounted, ref, watch } from 'vue'
import CommonConfirmModal from '../common/CommonConfirmModal.vue'
import { api } from '@/axios'
import { useRoute } from 'vue-router'
import ReportModal from './ReportModal.vue'
import { useBoardStore } from '@/fo/stores/boardStore'

const alertStore = useAlertStore()
const modalStore = useModalStore()
const boardStore = useBoardStore()

const route = useRoute()
const boardSq = route.params.board_sq
const editSq = ref(null)
const viewerSq = ref(boardStore.viewerSq)

const formatTime = (createdAt) => {
  const date = new Date(createdAt)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let timePeriod = 'am'
  if (hour > 12) {
    hour += -12
    timePeriod = 'pm'
  }
  if (minute < 10) minute = '0' + minute

  return `${year}년 ${month}월 ${day}일 ${hour}:${minute} ${timePeriod}`
}

const props = defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
  isAnswer: {
    type: Boolean,
    default: false,
  },
  answerSq: {
    type: Number,
    default: 0,
  },
  getBoard: {
    type: Function,
    default: () => {},
  },
})

const description = ref('')
const editdescription = ref('')

// 추천
const rcmndComment = async (sq) => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  const res = await api.$post(`/comment/${sq}/recommend`)

  if (res.status == 'OK') {
    alertStore.show(res.message, 'success')
    props.getBoard()
  } else {
    alertStore.show('추천 반영에 실패하였습니다.', 'danger')
  }
}

// 삭제 컨펌 모달
const openDeleteConfirm = (sq) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '댓글 삭제',
    message: '정말 삭제하시겠습니까?',
    onConfirm: async () => {
      try {
        const res = await api.$patch(`/comment/${sq}`)

        if (res.status == 'OK') {
          alertStore.show(res.message, 'success')
          editSq.value = null
          editdescription.value = ''
          props.getBoard()
        } else {
          alertStore.show('댓글 삭제에 실패하였습니다.', 'danger')
        }
      } catch (error) {
        alertStore.show('댓글 삭제에 실패하였습니다.', 'danger')
      }
      modalStore.closeModal()
    },
  })
}

// 수정
const clickEdit = (idx, description) => {
  editSq.value = idx
  editdescription.value = description
}
const editRegisterConfirm = (sq) => {
  if (editdescription.value == null || editdescription.value.trim() == '') {
    alertStore.show('내용을 입력해주세요.', 'danger')
    return
  }
  modalStore.openModal(CommonConfirmModal, {
    title: '댓글 수정',
    message: '댓글을 수정하시겠습니까?',
    onConfirm: async () => {
      try {
        const res = await api.$put(`/comment/${sq}`, {
          description: editdescription.value,
        })

        if (res.status == 'OK') {
          alertStore.show(res.message, 'success')
          editSq.value = null
          editdescription.value = ''
          props.getBoard()
        } else {
          alertStore.show('댓글 수정에 실패하였습니다.', 'danger')
        }
      } catch (error) {
        alertStore.show('댓글 수정에 실패하였습니다.', 'danger')
      }
      modalStore.closeModal()
    },
  })
}

// 댓글 등록 컨펌 모달
const openRegisterConfirm = () => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  if (description.value == null || description.value.trim() == '') {
    alertStore.show('내용을 입력해주세요.', 'danger')
    return
  }
  modalStore.openModal(CommonConfirmModal, {
    title: '댓글 등록',
    message: '댓글을 등록하시겠습니까?',
    onConfirm: async () => {
      try {
        const res = await api.$post(`/comment`, {
          userSq: 4,
          boardSq: props.isAnswer ? null : boardSq,
          answerSq: props.isAnswer ? props.answerSq : null,
          description: description.value,
        })

        if (res.status == 'CREATED') {
          alertStore.show(res.message, 'success')
          props.getBoard()
        } else {
          alertStore.show('댓글 등록에 실패하였습니다.', 'danger')
        }
      } catch (error) {
        alertStore.show('댓글 등록에 실패하였습니다.', 'danger')
      }
      modalStore.closeModal()
    },
  })
}

// 신고 모달
const clickReportApplication = (sq) => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  modalStore.openModal(ReportModal, { reportTypeCd: 2003, sq })
}

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
.font-size-10 {
  font-size: 1rem;
}
.font-size-11 {
  font-size: 1.1rem;
}
.font-size-12 {
  font-size: 1.2rem;
}
.font-size-13 {
  font-size: 1.3rem;
}
.font-size-15 {
  font-size: 1.5rem;
}
.rounded-circle.comment-profile {
  width: 48px;
  height: 48px;
}
.comment-profile .fas.fa-user.text-muted {
  font-size: 20px;
}

.comment-item {
  scroll-margin-top: 100px;
  transition: background-color 0.3s ease;
}
</style>
