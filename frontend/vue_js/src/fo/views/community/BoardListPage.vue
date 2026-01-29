<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="일반 게시판"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '일반 게시판' }]"
    />
    <div class="container py-5 mt-3">
      <!-- 검색창 및 필터 영역 -->
      <div
        class="row align-items-center justify-content-between py-3 border-bottom mb-3"
      >
        <div class="col-md-6 mb-3 mb-md-0">
          <select
            class="form-select w-auto d-inline-block"
            v-model="sortType"
            @change="getBoardList"
          >
            <option selected value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="view">조회순</option>
            <option value="comment">댓글순</option>
            <option value="recommend">추천순</option>
          </select>
        </div>
        <div class="col-md-6 text-end">
          <form
            class="d-flex justify-content-md-end"
            @submit.prevent="getBoardList"
          >
            <select v-model="searchType" class="form-select w-auto me-2">
              <option selected value="all">전체</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>
            <input
              v-model="keyword"
              class="form-control w-auto me-2"
              type="search"
              placeholder="검색어 입력"
              @keyup.enter="submit"
            />
            <button class="btn btn-primary px-3" type="submit">검색</button>
          </form>
        </div>
      </div>
      <!-- 게시판 리스트 -->
      <div class="row">
        <div class="col">
          <BoardTable :boardList="boardList" :isQna="false" />
          <!-- 등록 버튼 -->
          <div class="d-flex justify-content-end mb-3">
            <a href="/board/register" class="btn btn-primary px-4">등록</a>
          </div>
          <!-- 페이지네이션: 우측 하단 정렬 -->
          <CommonPagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            @update:currentPage="currentPage = $event"
          />
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
import BoardTable from '@/fo/components/community/BoardTable.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import { onMounted, ref, watch } from 'vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import { api } from '@/axios'

const alertStore = useAlertStore()

const boardList = ref([])

// 한 화면에 보일 박스 숫자 설정
const size = 10

const currentPage = ref(1)

const totalPages = ref(1)

// 필터
const searchType = ref('all')
const keyword = ref(null)
const sortType = ref('latest')

// 게시글 리스트 불러오기
const getBoardList = async () => {
  try {
    const searchFilter =
      keyword.value == null || keyword.value.trim() == ''
        ? ''
        : `&searchType=${searchType.value}&keyword=${keyword.value}`
    const res = await api.$get(
      `/board?page=${currentPage.value}&size=${size}&sortType=${sortType.value}${searchFilter}`,
    )
    if (res) {
      if (res.output.totalElements == 0) {
        totalPages.value = 1
      } else {
        totalPages.value = Math.floor(
          (res.output.totalElements + size - 1) / size,
        )
      }
      boardList.value = res.output.boards
    }
  } catch (error) {
    alertStore.show('게시글을 불러올 수 없습니다.', 'danger')
  }
}
watch(currentPage, () => {
  getBoardList()
})

onMounted(() => {
  getBoardList()
})
</script>
<style></style>
