<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="공지사항"
      :breadcrumbs="[
        { text: '공지사항', link: '/notice' },
        { text: boardInfo.ttl },
      ]"
    />
    <div class="container py-5 mt-3">
      <div class="post-content ms-0">
        <BoardPost
          :boardInfo="boardInfo"
          boardType="notice"
          :getBoard="getNotice"
        />

        <BoardComment
          :comments="boardInfo.comments"
          :isAnswer="false"
          :getBoard="getNotice"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import BoardPost from '@/fo/components/community/BoardPost.vue'
import BoardComment from '@/fo/components/community/BoardComment.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { onMounted, ref, defineProps, watch } from 'vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import { api } from '@/axios'
import { useBoardStore } from '@/fo/stores/boardStore'

const alertStore = useAlertStore()
const boardStore = useBoardStore()

// 라우터에서 전달받는 공지사항 번호
const props = defineProps({ board_sq: String })

const boardInfo = ref({
  attachments: [],
  normalTags: [],
  comments: [],
})

// 공지사항 상세 정보 불러오기
const getNotice = async () => {
  try {
    // 백엔드 NoticeController의 @GetMapping("/{boardSq}") 호출
    const res = await api.$get(`/notice/${props.board_sq}`)
    if (res && res.output) {
      boardInfo.value = res.output
      boardStore.viewerSq = res.output.viewerSq
    }
  } catch (error) {
    alertStore.show('공지사항을 불러올 수 없습니다.', 'danger')
  }
}

// 공지사항 조회수 증가
const addViewCnt = async () => {
  // 백엔드 NoticeController의 @PatchMapping("/{boardSq}/increment-view") 호출
  await api.$patch(`/notice/${props.board_sq}/increment-view`)
}

onMounted(() => {
  addViewCnt()
  getNotice()
})

watch(
  () => props.board_sq,
  (newSq, oldSq) => {
    if (newSq !== oldSq) {
      addViewCnt()
      getNotice()
    }
  },
)
</script>
