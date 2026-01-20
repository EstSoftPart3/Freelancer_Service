<template>
  <div>
    <div class="post-comments mt-5 post-comments">
      <h4 class="mb-3 font-size-15">댓글</h4>

      <ul class="comments">
        <li v-for="comment in props.comments" :key="comment.sq">
          <div class="comment">
            <div
              class="img-thumbnail img-thumbnail-no-borders d-none d-sm-block"
            >
              <img
                v-if="comment.userProfileImgUrl"
                class="avatar object-fit-cover"
                :src="comment.userProfileImgUrl"
              />
              <div v-else class="rounded-circle comment-profile">
                <i class="fas fa-user text-muted"></i>
              </div>
            </div>

            <div class="comment-block font-size-12">
              <div class="comment-arrow"></div>
              <div
                class="d-flex justify-content-between align-items-center mb-2"
                v-show="editSq != comment.sq"
              >
                <span class="comment-by text-primary font-size-13">
                  <strong>{{ comment.userNm }}</strong>
                </span>

                <span class="comment-icons d-flex align-items-center">
                  <button
                    v-if="!comment.parentCommentSq"
                    class="text-primary me-2 font-size-10"
                    @click="toggleReply(comment.sq)"
                  >
                    <span>답글</span>
                  </button>

                  <template v-if="comment.userSq == viewerSq">
                    <span class="text-primary me-2 font-size-10">
                      추천 {{ comment.recommendCnt }}
                    </span>
                    <button
                      class="text-secondary me-2 font-size-10"
                      @click="clickEdit(comment.sq, comment.description)"
                    >
                      <span>수정</span>
                    </button>
                    <button
                      class="text-danger font-size-10"
                      @click="openDeleteConfirm(comment.sq)"
                    >
                      <span>삭제</span>
                    </button>
                  </template>

                  <template v-else>
                    <button
                      class="text-danger me-2 font-size-10"
                      @click="rcmndComment(comment.sq)"
                    >
                      <span class="text-primary"
                        >추천 {{ comment.recommendCnt }}</span
                      >
                    </button>
                    <button
                      class="text-danger font-size-10"
                      @click="clickReportApplication(comment.sq)"
                    >
                      <span class="text-primary">신고</span>
                    </button>
                  </template>
                </span>
              </div>

              <p class="font-size-12" v-show="editSq != comment.sq">
                {{ comment.description }}
              </p>

              <form
                v-if="editSq == comment.sq"
                @submit.prevent="editRegisterConfirm(comment.sq)"
              >
                <div class="input-group">
                  <input
                    v-model="editdescription"
                    type="text"
                    class="form-control"
                    required
                  />
                  <button type="submit" class="btn btn-primary">
                    수정 완료
                  </button>
                  <button
                    type="button"
                    class="btn btn-light"
                    @click="editSq = null"
                  >
                    취소
                  </button>
                </div>
              </form>

              <span
                class="date float-end font-size-11"
                v-show="editSq != comment.sq"
              >
                {{ formatTime(comment.createdAt) }}
              </span>
            </div>
          </div>

          <ul
            v-if="comment.childComments && comment.childComments.length > 0"
            class="comments reply-list ms-5 mt-2"
          >
            <li v-for="reply in comment.childComments" :key="reply.sq">
              <div class="comment">
                <div
                  class="img-thumbnail img-thumbnail-no-borders d-none d-sm-block"
                >
                  <img
                    v-if="reply.userProfileImgUrl"
                    class="avatar object-fit-cover reply-avatar"
                    :src="reply.userProfileImgUrl"
                  />
                  <div
                    v-else
                    class="rounded-circle comment-profile reply-profile"
                  >
                    <i class="fas fa-user text-muted"></i>
                  </div>
                </div>

                <div class="comment-block font-size-12 bg-light">
                  <div class="comment-arrow"></div>
                  <div
                    class="d-flex justify-content-between align-items-center mb-2"
                    v-show="editSq != reply.sq"
                  >
                    <span class="comment-by text-primary font-size-13">
                      <strong>{{ reply.userNm }}</strong>
                    </span>

                    <span class="comment-icons d-flex align-items-center">
                      <template v-if="reply.userSq == viewerSq">
                        <span class="text-primary me-2 font-size-10"
                          >추천 {{ reply.recommendCnt }}</span
                        >
                        <button
                          class="text-secondary me-2 font-size-10"
                          @click="clickEdit(reply.sq, reply.description)"
                        >
                          수정
                        </button>
                        <button
                          class="text-danger font-size-10"
                          @click="openDeleteConfirm(reply.sq)"
                        >
                          삭제
                        </button>
                      </template>
                      <template v-else>
                        <button
                          class="text-danger me-2 font-size-10"
                          @click="rcmndComment(reply.sq)"
                        >
                          <span class="text-primary"
                            >추천 {{ reply.recommendCnt }}</span
                          >
                        </button>
                        <button
                          class="text-danger font-size-10"
                          @click="clickReportApplication(reply.sq)"
                        >
                          신고
                        </button>
                      </template>
                    </span>
                  </div>

                  <p class="font-size-12" v-show="editSq != reply.sq">
                    {{ reply.description }}
                  </p>

                  <form
                    v-if="editSq == reply.sq"
                    @submit.prevent="editRegisterConfirm(reply.sq)"
                  >
                    <div class="input-group">
                      <input
                        v-model="editdescription"
                        type="text"
                        class="form-control"
                        required
                      />
                      <button type="submit" class="btn btn-primary btn-sm">
                        수정
                      </button>
                    </div>
                  </form>
                  <span class="date float-end font-size-11">{{
                    formatTime(reply.createdAt)
                  }}</span>
                </div>
              </div>
            </li>
          </ul>

          <div
            v-if="replySq == comment.sq"
            class="reply-input-wrapper mt-2 ms-5"
          >
            <form @submit.prevent="registerReply(comment.sq)">
              <div class="input-group">
                <span class="input-group-text font-size-10">답글</span>
                <input
                  v-model="replyDescription"
                  type="text"
                  class="form-control"
                  placeholder="답글을 입력하세요"
                  required
                />
                <button type="submit" class="btn btn-primary btn-sm">
                  등록
                </button>
                <button
                  type="button"
                  class="btn btn-light btn-sm"
                  @click="replySq = null"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </li>
      </ul>
    </div>

    <div class="post-block mt-5 post-leave-comment">
      <form
        class="contact-form p-4 rounded bg-color-grey"
        @submit.prevent="openRegisterConfirm"
      >
        <label class="form-label font-weight-bold text-dark text-5 mb-3"
          >댓글 남기기</label
        >
        <div class="input-group">
          <input
            v-model="description"
            type="text"
            class="form-control"
            placeholder="댓글을 입력해주세요"
            required
          />
          <button type="submit" class="btn btn-primary">댓글 작성</button>
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

// 대댓글 관련 신규 상태
const replySq = ref(null)
const replyDescription = ref('')

// 1. 답글 창 토글 (비로그인 체크 로직 추가)
const toggleReply = (sq) => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  replySq.value = replySq.value === sq ? null : sq
  replyDescription.value = ''
}

// 대댓글 등록
const registerReply = async (parentSq) => {
  if (!replyDescription.value.trim()) return

  modalStore.openModal(CommonConfirmModal, {
    title: '답글 등록',
    message: '답글을 등록하시겠습니까?',
    onConfirm: async () => {
      try {
        const res = await api.$post(`/comment`, {
          parentCommentSq: parentSq,
          boardSq: props.isAnswer ? null : boardSq,
          answerSq: props.isAnswer ? props.answerSq : null,
          description: replyDescription.value,
        })

        if (res.status === 'CREATED' || res.status === 'OK') {
          alertStore.show(res.message, 'success')
          replySq.value = null
          replyDescription.value = ''
          props.getBoard()
        }
      } catch (error) {
        alertStore.show('답글 등록 실패', 'danger')
      }
      modalStore.closeModal()
    },
  })
}

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

// 추천 (대댓글과 공용 사용 가능)
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
          description.value = ''

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

/* 대댓글 들여쓰기 디자인 */
.ms-5 {
  margin-left: 3rem !important;
}
.reply-list {
  border-left: 2px solid #dee2e6;
  padding-left: 10px;
}
.bg-light {
  background-color: #f8f9fa !important;
}
</style>
