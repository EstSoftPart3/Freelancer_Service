<template>
  <div class="table-responsive">
    <table class="table table-hover table-bordered align-middle text-center">
      <thead class="table-light">
        <tr>
          <th class="th-ws">순번</th>
          <th class="th-ttl">제목</th>
          <th class="th-wm">작성자</th>
          <th class="th-wl">등록일</th>
          <th class="th-ws">조회</th>
          <th class="th-ws d-none d-md-table-cell">댓글</th>
          <th class="th-ws d-none d-md-table-cell">추천</th>
          <th v-if="isQna" class="th-wl">상태</th>
        </tr>
      </thead>
      <tbody v-if="boardList.length > 0">
        <tr v-for="board in boardList" :key="board.sq">
          <td>{{ board.sq }}</td>
          <td class="text-start px-3">
            <router-link :to="`/${detailPath}/${board.sq}`">
              {{ board.ttl }}
              <span
                class="text-grey ml-1 px-2"
                v-show="isQna && board.answerCnt > 0"
              >
                <i class="fas fa-comment-dots me-1"></i>답변
                {{ board.answerCnt }}
              </span>
            </router-link>
            <BoardTags
              :skillTags="board.skillTags"
              :normalTags="board.normalTags"
            />
          </td>
          <td>{{ board.userNm }}</td>
          <td>{{ formatTime(board.createdAt) }}</td>
          <td>{{ board.viewCnt }}</td>
          <td class="d-none d-md-table-cell">{{ board.commentCnt }}</td>
          <td class="d-none d-md-table-cell">{{ board.recommendCnt }}</td>
          <td v-if="isQna">
            <span
              v-if="board.boardAdoptStatusCd == 1501"
              class="badge bg-warning"
              >진행중</span
            >
            <span
              v-if="board.boardAdoptStatusCd == 1502"
              class="badge bg-success"
              >채택완료</span
            >
            <span
              v-if="board.boardAdoptStatusCd == 1503"
              class="badge bg-secondary"
              >자체해결</span
            >
            <span
              v-if="board.boardAdoptStatusCd == 1504"
              class="badge bg-danger"
              >미해결</span
            >
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td class="text-start px-3 text-center" :colspan="isQna ? 8 : 7">
            게시글이 없습니다.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed, defineProps } from 'vue'
import BoardTags from './BoardTags.vue'

const props = defineProps({
  boardList: { type: Array, default: () => [] },
  isQna: { type: Boolean, default: false },
  isNotice: { type: Boolean, default: false },
})

const boardList = computed(() => props.boardList)
const isQna = computed(() => props.isQna)

const detailPath = computed(() => {
  if (props.isQna) return 'qna'
  if (props.isNotice) return 'notice'
  return 'board'
})

const formatTime = (createdAt) => {
  const date = new Date(createdAt)
  let year = date.getFullYear().toString().slice(-2)
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day

  return `${year}-${month}-${day}`
}
</script>
<style>
.tag {
  font-size: 12px;
}
.th-ttl {
  min-width: 300px;
}
.th-wl {
  width: 100px;
}
.th-wm {
  width: 90px;
}
.th-ws {
  width: 70px;
}
</style>
