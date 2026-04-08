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
              placeholder="공지사항 검색"
              @keyup.enter="onSearch"
            />
            <button class="btn btn-primary px-3" type="submit">검색</button>
          </form>
        </div>
      </div>
      <div v-if="hasSelectedTags" class="row mb-3">
        <div class="col d-flex align-items-center gap-2 flex-wrap">
          <span class="text-muted small">적용 태그</span>
          <button
            v-for="tag in selectedSkillTags"
            :key="`skill-${tag.skillTagSq}`"
            type="button"
            class="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 active-tag-chip"
            @click="removeSkillTag(tag.skillTagSq)"
          >
            <img
              :src="generateIconUrl(tag.skillTagNm)"
              width="14"
              height="14"
              :alt="tag.skillTagNm"
            />
            <span>{{ tag.skillTagNm }}</span>
            <span aria-hidden="true">&times;</span>
          </button>
          <button
            v-for="tag in selectedNormalTags"
            :key="`normal-${tag}`"
            type="button"
            class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 active-tag-chip"
            @click="removeNormalTag(tag)"
          >
            <span>#{{ tag }}</span>
            <span aria-hidden="true">&times;</span>
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            @click="clearTagFilters"
          >
            초기화
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <p class="text-muted">공지사항을 불러오는 중입니다...</p>
          </div>

          <div v-else>
            <BoardTable
              :boardList="noticeList"
              :isNotice="true"
              @click-tag="toggleTagFilter"
            />

            <div
              v-if="noticeList.length === 0"
              class="text-center py-5 text-muted"
            >
              등록된 공지사항이 없습니다.
            </div>

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
import skillIconMap from '@/assets/skillIconMap.js'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const alertStore = useAlertStore()
const noticeList = ref([])

const size = 10
const currentPage = ref(Math.max(1, Number(route.query.page) || 1))
const totalPages = ref(1)

const searchType = ref(route.query.searchType || 'all')
const keyword = ref(route.query.keyword ?? null)
const sortType = ref(route.query.sort || 'latest')
const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

const selectedSkillTagSqs = ref(toArray(route.query.skillTags).map(String))
const selectedNormalTags = ref([
  ...toArray(route.query.normalTags).map(String),
  ...toArray(route.query.tag).map(String),
])
const skillTagMap = ref({})

const selectedSkillTags = computed(() =>
  selectedSkillTagSqs.value.map((sq) => ({
    skillTagSq: sq,
    skillTagNm: skillTagMap.value[sq] || sq,
  })),
)
const hasSelectedTags = computed(
  () =>
    selectedSkillTagSqs.value.length > 0 || selectedNormalTags.value.length > 0,
)

const generateIconUrl = (name) => {
  const key = String(name)
    .toLowerCase()
    .replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const loadSkillTagMap = async () => {
  if (Object.keys(skillTagMap.value).length > 0) return
  const res = await api.$get('/board/skill-tags')
  if (res?.output) {
    skillTagMap.value = res.output.reduce((acc, tag) => {
      acc[String(tag.skillTagSq)] = tag.skillTagNm
      return acc
    }, {})
  }
}

const buildQueryParams = () => {
  const params = new URLSearchParams()
  params.set('page', currentPage.value)
  params.set('size', size)
  params.set('sortType', sortType.value)
  if (keyword.value?.trim()) {
    params.set('searchType', searchType.value)
    params.set('keyword', keyword.value.trim())
  }
  selectedSkillTagSqs.value.forEach((tagSq) =>
    params.append('skillTags', tagSq),
  )
  selectedNormalTags.value.forEach((tag) => params.append('normalTags', tag))
  return params.toString()
}

const buildTagQuery = () => ({
  skillTags: selectedSkillTagSqs.value.length
    ? selectedSkillTagSqs.value
    : undefined,
  normalTags: selectedNormalTags.value.length
    ? selectedNormalTags.value
    : undefined,
  tag: undefined,
})

const getNoticeList = async () => {
  isLoading.value = true
  try {
    // 현재 경로(/notice) 기반으로 호출
    // 백엔드 컨트롤러에서 /notice 경로가 boardTypeCd=1403L을 처리하도록 설정되어 있어야 합니다.
    const res = await api.$get(`${route.path}?${buildQueryParams()}`)

    if (res && res.output) {
      totalPages.value =
        res.output.totalElements === 0
          ? 1
          : Math.ceil(res.output.totalElements / size)
      noticeList.value = res.output.boards
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
      }
    }
  } catch (error) {
    alertStore.show('공지사항을 불러올 수 없습니다.', 'danger')
  } finally {
    isLoading.value = false
  }
}

const dynamicBreadcrumbs = computed(() => {
  if (hasSelectedTags.value) {
    return [{ text: '공지사항', link: '/notice' }, { text: '태그 검색' }]
  }
  return [{ text: 'Home', link: '/' }, { text: '공지사항' }]
})

const dynamicStrongText = computed(() => '공지사항')

const updateQuery = (params) => {
  router.replace({ query: { ...route.query, ...params } })
}

const onSortChange = () => {
  currentPage.value = 1
  updateQuery({ page: 1, sort: sortType.value })
  getNoticeList()
}

const onSearch = () => {
  currentPage.value = 1
  updateQuery({
    page: 1,
    sort: sortType.value,
    searchType: searchType.value,
    keyword: keyword.value?.trim() || undefined,
  })
  getNoticeList()
}

const clearTagFilters = () => {
  selectedSkillTagSqs.value = []
  selectedNormalTags.value = []
  currentPage.value = 1
  updateQuery({
    page: 1,
    ...buildTagQuery(),
  })
  getNoticeList()
}

const removeSkillTag = (tagSq) => {
  selectedSkillTagSqs.value = selectedSkillTagSqs.value.filter(
    (sq) => sq !== String(tagSq),
  )
  currentPage.value = 1
  updateQuery({ page: 1, ...buildTagQuery() })
  getNoticeList()
}

const removeNormalTag = (tag) => {
  selectedNormalTags.value = selectedNormalTags.value.filter((t) => t !== tag)
  currentPage.value = 1
  updateQuery({ page: 1, ...buildTagQuery() })
  getNoticeList()
}

const toggleTagFilter = (tag) => {
  if (tag.type === 'skill' && tag.skillTagSq) {
    const tagSq = String(tag.skillTagSq)
    if (selectedSkillTagSqs.value.includes(tagSq)) removeSkillTag(tagSq)
    else {
      selectedSkillTagSqs.value = [...selectedSkillTagSqs.value, tagSq]
      skillTagMap.value = { ...skillTagMap.value, [tagSq]: tag.name }
      currentPage.value = 1
      updateQuery({ page: 1, ...buildTagQuery() })
      getNoticeList()
    }
    return
  }

  if (selectedNormalTags.value.includes(tag.name)) removeNormalTag(tag.name)
  else {
    selectedNormalTags.value = [...selectedNormalTags.value, tag.name]
    currentPage.value = 1
    updateQuery({ page: 1, ...buildTagQuery() })
    getNoticeList()
  }
}

const onPageChange = (page) => {
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  getNoticeList()
}
watch(
  () => ({
    page: route.query.page,
    tag: route.query.tag,
    normalTags: route.query.normalTags,
    skillTags: route.query.skillTags,
  }),
  (newQ, oldQ) => {
    const tagChanged =
      newQ.tag !== oldQ?.tag ||
      newQ.normalTags !== oldQ?.normalTags ||
      newQ.skillTags !== oldQ?.skillTags
    if (tagChanged) {
      selectedSkillTagSqs.value = toArray(newQ.skillTags).map(String)
      selectedNormalTags.value = [
        ...toArray(newQ.normalTags).map(String),
        ...toArray(newQ.tag).map(String),
      ]
      currentPage.value = 1
      getNoticeList()
      return
    }
    const page = Math.max(1, Number(newQ.page) || 1)
    if (page !== currentPage.value) {
      currentPage.value = page
      getNoticeList()
    }
  },
)

onMounted(async () => {
  await loadSkillTagMap()
  getNoticeList()
})
</script>
<style scoped>
.active-tag-chip {
  border-radius: 999px;
  border: 1px solid #d9dee8;
  color: #495057;
}
</style>
