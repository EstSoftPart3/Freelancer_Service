<template>
  <div>
    <div class="modal-header">
      <h4 class="modal-title" id="largeModalLabel">QnA 답변</h4>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-hidden="true"
        @click="closeModal"
      >
        ×
      </button>
    </div>
    <div class="modal-body">
      <div class="post-content ms-0">
        <BoardPost
          boardType="answer"
          :boardInfo="boardInfo"
          :parentUserSq="boardUserSq"
          :getBoard="getBoard"
          :adoptStatusCd="props.adoptStatusCd"
        />

        <BoardComment
          :comments="boardInfo.comments"
          :answerSq="props.answerSq"
          :isAnswer="true"
          :getBoard="getBoard"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-secondary" @click="closeModal">
        닫기
      </button>
    </div>
  </div>
</template>
<script setup>
import { useModalStore } from '@/fo/stores/modalStore'
import BoardComment from './BoardComment.vue'
import BoardPost from './BoardPost.vue'
import { defineProps, ref } from 'vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { onMounted } from 'vue'

const alertStore = useAlertStore()

const modalStore = useModalStore()

const props = defineProps({
  answerSq: {
    type: Number,
    default: 0,
  },
  boardUserSq: {
    type: Number,
    default: 0,
  },
  adoptStatusCd: {
    type: Number,
    default: 1501,
  },
})

const closeModal = () => {
  modalStore.closeModal()
}

const boardInfo = ref({
  sq: 1,
  ttl: 'React.js와 Vue.js의 차이점은 무엇인가요?',
  userSq: 1,
  userNm: '홍길동',
  createdAt: '2025-04-17',
  boardAdoptStatusCd: 4,
  viewCnt: 123,
  recommendCnt: 45,
  description: '',
  attachments: [],
  skillTags: [],
  normalTags: [],
  comments: [],
})

// 게시글 불러오기
const getBoard = async () => {
  try {
    const res = await api.$get(`/answer/${props.answerSq}`)
    if (res) {
      boardInfo.value = res.output
    }
  } catch (error) {
    alertStore.show('게시글을 불러올 수 없습니다.', 'danger')
  }
}

const addViewCnt = async () => {
  await api.$patch(`/answer/${props.answerSq}/increment-view`)
}

onMounted(() => {
  addViewCnt()
  getBoard()
})
</script>
<style></style>
