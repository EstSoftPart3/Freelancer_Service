<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="일반 게시판"
      :breadcrumbs="[
        { text: '일반 게시판', link: '/board' },
        { text: boardInfo.ttl },
      ]"
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
import { onMounted, ref, watch } from 'vue'
import { defineProps } from 'vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import { api } from '@/axios'
import { useBoardStore } from '@/fo/stores/boardStore'

const alertStore = useAlertStore()
const boardStore = useBoardStore()

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

onMounted(() => {
  addViewCnt()
  getBoard()
})

watch(
  () => props.board_sq,
  (newSq, oldSq) => {
    if (newSq !== oldSq) {
      addViewCnt()
      getBoard()
    }
  },
)
</script>
<style></style>
