<template>
  <section>
    <CommonPageHeader
      title=""
      :strongText="dynamicStrongText"
      :breadcrumbs="dynamicBreadcrumbs"
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
            @change="onSortChange"
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
            @submit.prevent="onSearch"
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
              @keyup.enter="onSearch"
            />
            <button class="btn btn-primary px-3" type="submit">검색</button>
          </form>
        </div>
      </div>
      <!-- 게시판 리스트 -->
      <div class="row">
        <div class="col">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <p class="text-muted">게시글을 불러오는 중입니다...</p>
          </div>

          <div v-else>
            <BoardTable :boardList="boardList" :isQna="false" />

            <div
              v-if="boardList.length === 0"
              class="text-center py-5 text-muted"
            >
              등록된 게시글이 없습니다.
            </div>
            <div class="d-flex justify-content-end mb-3">
              <a href="/board/register" class="btn btn-primary px-4">등록</a>
            </div>
            <!-- 페이지네이션: 우측 하단 정렬 -->
            <CommonPagination
              :currentPage="currentPage"
              :totalPages="totalPages"
              @update:currentPage="onPageChange($event)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
import BoardTable from '@/fo/components/community/BoardTable.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import { onMounted, ref, watch, computed } from 'vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/axios'

const route = useRoute()
const router = useRouter()

const isLoading = ref(false)

const alertStore = useAlertStore()

const boardList = ref([])

// 한 화면에 보일 박스 숫자 설정
const size = 10

const currentPage = ref(Math.max(1, Number(route.query.page) || 1))
if (route.query.page !== undefined && Number(route.query.page) !== currentPage.value) {
  router.replace({ query: { ...route.query, page: currentPage.value } })
}

const totalPages = ref(1)

// 필터
const searchType = ref(route.query.searchType || 'all')
const keyword = ref(route.query.keyword ?? null)
const sortType = ref(route.query.sort || 'latest')

const selectedTag = ref(route.query.tag || '')

// 게시글 리스트 불러오기
const getBoardList = async () => {
  isLoading.value = true
  try {
    // 키워드 필터 (인코딩 추가)
    const searchFilter =
      !keyword.value || keyword.value.trim() === ''
        ? ''
        : `&searchType=${searchType.value}&keyword=${encodeURIComponent(keyword.value.trim())}`

    // 태그 필터 (인코딩 추가)
    const tagFilter = selectedTag.value
      ? `&tag=${encodeURIComponent(selectedTag.value)}`
      : ''

    // API 호출 (현재 경로 기반)
    const res = await api.$get(
      `${route.path}?page=${currentPage.value}&size=${size}&sortType=${sortType.value}${searchFilter}${tagFilter}`,
    )

    if (res && res.output) {
      totalPages.value =
        res.output.totalElements === 0
          ? 1
          : Math.floor((res.output.totalElements + size - 1) / size)
      boardList.value = res.output.boards
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
        router.replace({ query: { ...route.query, page: currentPage.value } })
        return getBoardList()
      }
    }
  } catch (error) {
    alertStore.show('게시글을 불러올 수 없습니다.', 'danger')
  } finally {
    isLoading.value = false
  }
}

const updateQuery = (params) => {
  router.replace({ query: { ...route.query, ...params } })
}

const onSortChange = () => {
  currentPage.value = 1
  updateQuery({ page: 1, sort: sortType.value })
  getBoardList()
}

const onSearch = () => {
  currentPage.value = 1
  updateQuery({
    page: 1,
    sort: sortType.value,
    searchType: searchType.value,
    keyword: keyword.value?.trim() || undefined,
  })
  getBoardList()
}

const dynamicBreadcrumbs = computed(() => {
  // 태그 검색 중일 때: 'Home'을 빼고 '일반 게시판'을 최상위로
  if (selectedTag.value) {
    return [
      { text: '일반 게시판', link: '/board' },
      { text: `#${selectedTag.value}` },
    ]
  }

  // 기본 상태: 원래대로 Home > 일반 게시판
  return [{ text: 'Home', link: '/' }, { text: '일반 게시판' }]
})

// 헤더 굵은 텍스트 동적 계산
const dynamicStrongText = computed(() => {
  return selectedTag.value
    ? `일반 게시판 (#${selectedTag.value})`
    : '일반 게시판'
})

const onPageChange = (page) => {
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  getBoardList()
}
watch(
  () => ({ page: route.query.page, tag: route.query.tag }),
  (newQ, oldQ) => {
    const tagChanged = newQ.tag !== oldQ?.tag
    if (tagChanged) {
      selectedTag.value = newQ.tag || ''
      currentPage.value = 1
      getBoardList()
      return
    }
    const page = Math.max(1, Number(newQ.page) || 1)
    if (Number(newQ.page) !== page) {
      router.replace({ query: { ...route.query, page } })
    }
    if (page !== currentPage.value) {
      currentPage.value = page
      getBoardList()
    }
  },
)
onMounted(() => {
  getBoardList()
})
</script>
<style></style>
