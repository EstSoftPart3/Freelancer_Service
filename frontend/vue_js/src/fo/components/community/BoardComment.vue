<template>
  <div>
    <div class="post-comments mt-5 post-comments">
      <h4 class="mb-3 font-size-15">댓글 ({{ props.comments.length }})</h4>
      <ul class="comments">
        <li v-for="comment in props.comments" :key="comment">
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
              
              <!-- 날짜 -->
              <span
                class="date float-end font-size-11"
                v-show="editSq != comment.sq"
              >
                {{ formatTime(comment.createdAt) }}
              </span>
              
              <!-- 대댓글 달기 버튼 -->
              <div v-show="editSq != comment.sq" class="mt-2 mb-2" style="clear: both;">
                <button 
                  v-if="showReplyForm !== comment.sq" 
                  @click="showReplyForm = comment.sq" 
                  class="btn btn-link btn-sm p-0 text-primary font-size-11"
                  style="text-decoration: none;">
                  대댓글 달기
                </button>
              </div>
              
              <!-- 대댓글 목록 -->
              <ul v-if="commentReplies[comment.sq] && commentReplies[comment.sq].length > 0" class="comments replies">
                <li v-for="reply in commentReplies[comment.sq]" :key="reply.replyCommentSq">
                  <div class="comment">
                    <div class="img-thumbnail img-thumbnail-no-borders d-none d-sm-block">
                      <div class="rounded-circle comment-profile">
                        <i class="fas fa-user text-muted"></i>
                      </div>
                    </div>
                    <div class="comment-block font-size-12">
                      <div class="comment-arrow"></div>
                      <div class="d-flex justify-content-between align-items-center mb-2" v-show="editReplySq != reply.replyCommentSq">
                        <span class="comment-by text-primary font-size-13">
                          <i class="fas fa-level-up-alt fa-rotate-90 me-2" style="font-size: 0.8rem; opacity: 0.6;"></i>
                          <strong>{{ reply.userNm }}</strong>
                        </span>
                        <!-- 본인 대댓글일 경우 -->
                        <span v-if="reply.userSq == viewerSq" class="comment-icons d-flex">
                          <button @click="clickEditReply(reply.replyCommentSq, reply.replyCommentDescriptionTxt)" class="text-danger me-2 font-size-10">
                            <span class="ms-2 text-primary">수정</span>
                          </button>
                          <button @click="openDeleteReplyConfirm(reply.replyCommentSq)" class="text-danger font-size-10">
                            <span class="ms-2 text-primary">삭제</span>
                          </button>
                        </span>
                        <!-- 다른 사람 대댓글일 경우 -->
                        <span v-else class="comment-icons d-flex">
                          <button @click="rcmndReply(reply.replyCommentSq)" class="text-danger me-2 font-size-10">
                            <span class="ms-2 text-primary">추천 {{ reply.replyCommentRecommendCnt || 0 }}</span>
                          </button>
                          <button @click="clickReportReply(reply.replyCommentSq)" class="text-danger font-size-10">
                            <span class="ms-2 text-primary">신고</span>
                          </button>
                        </span>
                      </div>
                      <p class="font-size-12" v-show="editReplySq != reply.replyCommentSq">{{ reply.replyCommentDescriptionTxt }}</p>
                      
                      <!-- 대댓글 수정 폼 -->
                      <form @submit.prevent="updateReply(reply.replyCommentSq)" v-if="editReplySq == reply.replyCommentSq">
                        <div class="input-group">
                          <input
                            v-model="editReplyDescription"
                            type="text"
                            maxlength="5000"
                            class="form-control"
                            placeholder="대댓글을 입력해주세요"
                            required
                          />
                          <button type="submit" class="btn btn-primary btn-sm">수정</button>
                          <button type="button" @click="editReplySq = null" class="btn btn-secondary btn-sm">취소</button>
                        </div>
                      </form>
                      
                      <span class="date float-end font-size-11" v-show="editReplySq != reply.replyCommentSq">{{ formatTime(reply.replyCommentCreatedAtDtm) }}</span>
                    </div>
                  </div>
                </li>
              </ul>
              
              <!-- 대댓글 작성 폼 -->
              <div v-if="showReplyForm === comment.sq" class="reply-form mt-3 ms-5">
                <form @submit.prevent="createReply(comment.sq)">
                  <div class="input-group">
                    <input 
                      v-model="replyDescription" 
                      type="text" 
                      maxlength="5000"
                      class="form-control" 
                      placeholder="대댓글을 입력해주세요" 
                      required 
                    />
                    <button type="submit" class="btn btn-primary btn-sm">작성</button>
                    <button type="button" @click="showReplyForm = null" class="btn btn-secondary btn-sm">취소</button>
                  </div>
                </form>
              </div>
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
const replyDescription = ref('')
const showReplyForm = ref(null)
const commentReplies = ref({})
const editReplySq = ref(null)
const editReplyDescription = ref('')

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

// 대댓글 작성
const createReply = async (commentSq) => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  if (replyDescription.value.trim() === '') {
    alertStore.show('내용을 입력해주세요.', 'danger')
    return
  }
  
  try {
    const res = await api.$post('/reply', {
      commentSq: commentSq,
      boardSq: boardSq,
      description: replyDescription.value
    })
    
    if (res.status === 'CREATED') {
      alertStore.show(res.message, 'success')
      replyDescription.value = ''
      showReplyForm.value = null
      props.getBoard()
    }
  } catch (error) {
    alertStore.show('대댓글 등록에 실패하였습니다.', 'danger')
  }
}

// 대댓글 추천
const rcmndReply = async (replyCommentSq) => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  
  try {
    const res = await api.$post(`/reply/${replyCommentSq}/recommend`)
    if (res.status === 'OK') {
      alertStore.show(res.message, 'success')
      props.getBoard()
    }
  } catch (error) {
    alertStore.show('대댓글 추천에 실패하였습니다.', 'danger')
  }
}

// 대댓글 신고
const clickReportReply = (replyCommentSq) => {
  if (viewerSq.value == null) {
    alertStore.show('로그인 후 이용해주세요.', 'danger')
    return
  }
  modalStore.openModal(ReportModal, { reportTypeCd: 2004, sq: replyCommentSq })
}

// 대댓글 수정
const clickEditReply = (replyCommentSq, description) => {
  editReplySq.value = replyCommentSq
  editReplyDescription.value = description
}

const updateReply = async (replyCommentSq) => {
  if (editReplyDescription.value.trim() === '') {
    alertStore.show('내용을 입력해주세요.', 'danger')
    return
  }
  
  modalStore.openModal(CommonConfirmModal, {
    title: '대댓글 수정',
    message: '대댓글을 수정하시겠습니까?',
    onConfirm: async () => {
      try {
        // URLSearchParams를 사용하여 쿼리 파라미터 전달
        const params = new URLSearchParams()
        params.append('description', editReplyDescription.value)
        const res = await api.$put(`/reply/${replyCommentSq}?${params.toString()}`)
        
        if (res.status === 'OK') {
          alertStore.show(res.message, 'success')
          editReplySq.value = null
          editReplyDescription.value = ''
          props.getBoard()
        }
      } catch (error) {
        alertStore.show('대댓글 수정에 실패하였습니다.', 'danger')
      }
      modalStore.closeModal()
    }
  })
}

// 대댓글 삭제
const openDeleteReplyConfirm = (replyCommentSq) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '대댓글 삭제',
    message: '정말 삭제하시겠습니까?',
    onConfirm: async () => {
      try {
        const res = await api.$patch(`/reply/${replyCommentSq}`)
        if (res.status === 'OK') {
          alertStore.show(res.message, 'success')
          props.getBoard()
        }
      } catch (error) {
        alertStore.show('대댓글 삭제에 실패하였습니다.', 'danger')
      }
      modalStore.closeModal()
    }
  })
}

// 각 댓글의 대댓글 조회
const loadReplies = async () => {
  for (const comment of props.comments) {
    try {
      // 간단하게 DB에서 직접 조회하는 방식 대신, getBoard로 한 번에 가져오기
      const replies = comment.replies || []
      commentReplies.value[comment.sq] = replies
    } catch (error) {
      console.error('대댓글 조회 실패', error)
    }
  }
}

onMounted(() => {
  viewerSq.value = boardStore.viewerSq
  loadReplies()
})

watch(
  () => props.comments,
  () => {
    loadReplies()
  },
  { deep: true }
)
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
/* 대댓글 스타일 */
.comments.replies {
  margin-left: 60px;
}
.comments.replies .comment {
  background-color: #fafafa;
}
.btn-link:hover {
  text-decoration: underline !important;
}
.fa-rotate-90 {
  transform: rotate(90deg);
}
</style>
