<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="QnA 게시판"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]"
    />

    <div class="container py-5 mt-3">
      <div class="post-content ms-0">
        <BoardPost
          :boardInfo="boardInfo"
          boardType="qna"
          :getBoard="getBoard"
        />
        <!-- 답변 영역 -->
        <div class="answers-section mt-5">
          <h4 class="mb-4 f-s-15">답변 ({{ boardInfo.answers.length }})</h4>
          <div
            v-for="answer in boardInfo.answers"
            :key="answer.sq"
            :id="`answer-${answer.sq}`"
            class="answer-box card p-4 mb-3 border-0"
            :class="{ 'disable-box': answer.sq === null }"
            @click="clickApplication(answer.sq)"
          >
            <div
              class="d-flex justify y-content-between align-items-center mb-2"
            >
              <h5 class="mb-0 text-dark f-s-13 me-2">
                {{ answer.ttl || '삭제된 답변입니다.' }}
              </h5>
              <span
                v-if="answer.isAdoptedYn == 'Y'"
                class="badge bg-primary f-s-11"
                >채택 답변</span
              >
            </div>
            <div
              class="d-flex justify-content-between text-muted f-s-11"
              v-if="answer.isDeletedYn == 'N'"
            >
              <div>
                <i class="far fa-user"></i> By
                <span>{{ answer.userNm }}</span> &nbsp;&nbsp;
                <i class="far fa-calendar-alt"></i>
                &nbsp;{{ formatTime(answer.createdAt) }}
              </div>
              <div>
                조회 {{ answer.viewCnt }} · 댓글 {{ answer.commentCnt }} · 추천
                {{ answer.recommendCnt }}
              </div>
            </div>
          </div>
        </div>
        <BoardComment
          :comments="boardInfo.comments"
          :isAnswer="false"
          :getBoard="getBoard"
        />
      </div>
    </div>
  </section>
</template>
<script setup>
import BoardComment from '@/fo/components/community/BoardComment.vue'
import BoardPost from '@/fo/components/community/BoardPost.vue'
import AnswerDetailModal from '@/fo/components/community/AnswerDetailModal.vue'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { defineProps, ref, nextTick } from 'vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { onMounted } from 'vue'
import { useBoardStore } from '@/fo/stores/boardStore'
import { useRoute } from 'vue-router'
const alertStore = useAlertStore()
const modalStore = useModalStore()
const boardStore = useBoardStore()
const route = useRoute()
const props = defineProps({ board_sq: String })

const boardInfo = ref({
  attachments: [],
  skillTags: [],
  normalTags: [],
  answers: [],
  comments: [],
})

// 답변 모달
const clickApplication = (sq) => {
  if (sq == null) {
    return
  }
  modalStore.openModal(AnswerDetailModal, {
    size: 'modal-lg',
    answerSq: sq,
    boardUserSq: boardInfo.value.userSq,
    adoptStatusCd: boardInfo.value.boardAdoptStatusCd,
  })
}

// 게시글 불러오기
const getBoard = async () => {
  try {
    const res = await api.$get(`/qna/${props.board_sq}`)
    if (res) {
      boardInfo.value = res.output
      boardStore.viewerSq = res.output.viewerSq
    }
  } catch (error) {
    alertStore.show('게시글을 불러올 수 없습니다.', 'danger')
  }
}

const addViewCnt = async () => {
  await api.$patch(`/board/${props.board_sq}/increment-view`)
}

const formatTime = (createdAt) => {
  const date = new Date(createdAt)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day

  return `${year}-${month}-${day}`
}
function scrollToElement(hash) {
  //약간의 지연을 주어 DOM이 완전히 렌더링 되도록 함
  setTimeout(() => {
    const element = document.querySelector(hash)
    if (element) {
      //부드러운 스크롤
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, 300)
}

onMounted(async () => {
  addViewCnt()
  await getBoard()
  await nextTick()
  if (route.hash) {
    scrollToElement(route.hash)
  }
})
</script>
<style>
.answer-box {
  background-color: #f4f4f4;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  scroll-margin-top: 100px;
  transition: background-color 0.3s ease;
}
.f-s-11 {
  font-size: 1.1rem;
}
.f-s-13 {
  font-size: 1.3rem;
}
.f-s-15 {
  font-size: 1.5rem;
}
.answer-box.disable-box {
  cursor: default;
}
</style>
