<template>
  <div
    class="tab-pane tab-pane-navigation active show"
    id="formsStyleWithoutBorders"
    role="tabpanel"
  >
    <h4 class="mb-3">{{ props.title }}</h4>
    <div class="card bg-color-grey mb-4">
      <div class="card-body">
        <form class="post-form" method="POST" enctype="multipart/form-data">
          <BoardPostRegisterContent
            ref="registerRef"
            :skillActive="props.isQna"
          />

          <!-- 버튼 영역 -->
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-primary" @click="insertBoard">
              등록
            </button>
            <button
              type="button"
              class="btn btn-light"
              @click="this.$router.go(-1)"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, onUnmounted, ref } from 'vue'
import BoardPostRegisterContent from './BoardPostRegisterContent.vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/fo/stores/boardStore'

const alertStore = useAlertStore()
const boardStore = useBoardStore()

const router = useRouter()

const boardSq = ref(Number(boardStore.editSq))

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  isQna: {
    type: Boolean,
    default: false,
  },
})

// 전달 데이터
const registerRef = ref(null)

// html 공백 파악
const isHtmlEmpty = (htmlString) => {
  // 1. 태그 제거 (텍스트만 추출)
  const textOnly = htmlString
    .replace(/<[^>]*>/g, '') // 모든 HTML 태그 제거
    .replace(/&nbsp;/gi, '') // 공백 문자 제거 (html 공백)
    .trim() // 앞뒤 공백 제거

  return textOnly === ''
}

// 등록 함수
const insertBoard = async () => {
  try {
    const reqData = registerRef.value.sendData()
    if (reqData.get('ttl') == null || reqData.get('ttl').trim() == '') {
      alertStore.show('제목을 입력해주세요.', 'danger')
      return
    } else if (isHtmlEmpty(reqData.get('description'))) {
      alertStore.show('내용을 입력해주세요.', 'danger')
      return
    }

    if (boardSq.value != 0) {
      const res = await api.$patch(
        `/${props.isQna ? 'qna' : 'board'}/${boardSq.value}/edit`,
        reqData,
      )
      if (res.status == 'OK') {
        alertStore.show(res.message, 'success')
        router.push(`/${props.isQna ? 'qna' : 'board'}`)
      } else {
        alertStore.show('게시글 수정에 실패하였습니다.', 'danger')
      }
    } else {
      const res = await api.$post(`/${props.isQna ? 'qna' : 'board'}`, reqData)
      if (res.status == 'CREATED') {
        alertStore.show(res.message, 'success')
        router.push(`/${props.isQna ? 'qna' : 'board'}`)
      } else {
        alertStore.show('게시글 등록에 실패하였습니다.', 'danger')
      }
    }
  } catch (error) {
    alertStore.show('게시글 등록에 실패하였습니다.', 'danger')
  }
}

onUnmounted(() => {
  boardStore.resetBoard()
})
</script>
<style></style>
