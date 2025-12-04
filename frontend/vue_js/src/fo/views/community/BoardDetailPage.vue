<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="일반 게시판"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '커뮤니티' }]"
    />
    <div class="container py-5 mt-3">
      <div class="post-content ms-0">
        <BoardPost
          :boardInfo="boardInfo"
          boardType="board"
          :getBoard="getBoard"
        />
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
import BoardPost from '@/fo/components/community/BoardPost.vue'
import BoardComment from '@/fo/components/community/BoardComment.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { onMounted, ref, nextTick } from 'vue'
import { defineProps } from 'vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import { api } from '@/axios'
import { useBoardStore } from '@/fo/stores/boardStore'
import { useRoute } from 'vue-router'

const alertStore = useAlertStore()
const boardStore = useBoardStore()
const route = useRoute()
const props = defineProps({ board_sq: String })

const boardInfo = ref({
  attachments: [],
  normalTags: [],
  comments: [],
})

// 게시글 불러오기
const getBoard = async () => {
  try {
    const res = await api.$get(`/board/${props.board_sq}`)
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
<style></style>
