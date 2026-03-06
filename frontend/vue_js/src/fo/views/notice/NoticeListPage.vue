<template>
  <section>
    <CommonPageHeader
      title=""
      :strongText="dynamicStrongText"
      :breadcrumbs="dynamicBreadcrumbs"
    />
    <div class="container py-5 mt-3">
      <div
        class="row align-items-center justify-content-between py-3 border-bottom mb-3"
      >
        <div class="col-md-6 mb-3 mb-md-0">
          <select
            class="form-select w-auto d-inline-block"
            v-model="sortType"
            @change="getNoticeList"
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
            @submit.prevent="getNoticeList"
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
              placeholder="공지사항 검색"
              @keyup.enter="getNoticeList"
            />
            <button class="btn btn-primary px-3" type="submit">검색</button>
          </form>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <p class="text-muted">공지사항을 불러오는 중입니다...</p>
          </div>

          <div v-else>
            <BoardTable :boardList="noticeList" :isNotice="true" />

            <div
              v-if="noticeList.length === 0"
              class="text-center py-5 text-muted"
            >
              등록된 공지사항이 없습니다.
            </div>

            <CommonPagination
              :currentPage="currentPage"
              :totalPages="totalPages"
              @update:currentPage="currentPage = $event"
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
import { useRoute } from 'vue-router'
import { api } from '@/axios'

const route = useRoute()
const isLoading = ref(false)
const alertStore = useAlertStore()
const noticeList = ref([])

const size = 10
const currentPage = ref(1)
const totalPages = ref(1)

const searchType = ref('all')
const keyword = ref(null)
const sortType = ref('latest')
const selectedTag = ref(route.query.tag || '')

const getNoticeList = async () => {
  isLoading.value = true
  try {
    const searchFilter =
      !keyword.value || keyword.value.trim() === ''
        ? ''
        : `&searchType=${searchType.value}&keyword=${encodeURIComponent(keyword.value.trim())}`

    const tagFilter = selectedTag.value
      ? `&tag=${encodeURIComponent(selectedTag.value)}`
      : ''

    // 현재 경로(/notice) 기반으로 호출
    // 백엔드 컨트롤러에서 /notice 경로가 boardTypeCd=1403L을 처리하도록 설정되어 있어야 합니다.
    const res = await api.$get(
      `${route.path}?page=${currentPage.value}&size=${size}&sortType=${sortType.value}${searchFilter}${tagFilter}`,
    )

    if (res && res.output) {
      totalPages.value =
        res.output.totalElements === 0
          ? 1
          : Math.ceil(res.output.totalElements / size)
      noticeList.value = res.output.boards
    }
  } catch (error) {
    alertStore.show('공지사항을 불러올 수 없습니다.', 'danger')
  } finally {
    isLoading.value = false
  }
}

const dynamicBreadcrumbs = computed(() => {
  if (selectedTag.value) {
    return [
      { text: '공지사항', link: '/notice' },
      { text: `#${selectedTag.value}` },
    ]
  }
  return [{ text: 'Home', link: '/' }, { text: '공지사항' }]
})

const dynamicStrongText = computed(() => {
  return selectedTag.value ? `공지사항 (#${selectedTag.value})` : '공지사항'
})

watch(currentPage, () => {
  getNoticeList()
})

watch(
  () => route.query.tag,
  (newTag) => {
    selectedTag.value = newTag || ''
    currentPage.value = 1
    getNoticeList()
  },
)

onMounted(() => {
  getNoticeList()
})
</script>
