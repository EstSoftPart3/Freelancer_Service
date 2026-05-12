<template>
  <div>
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">인터뷰 요청 현황</h4>
      </div>
    </div>

    <!-- 필터 버튼 + 검색 -->
    <div class="row align-items-center mt-3 mb-2">
      <!-- 좌측 토글 버튼 -->
      <div class="col-md-6 d-flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter.type"
          class="btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2 fs-6"
          style="white-space: nowrap"
          :class="{ active: statusType === filter.type }"
          @click="setFilter(filter.type)"
        >
          {{ filter.label }}
          <span class="badge bg-white text-primary fw-bold px-2 py-1">
            {{ filter.count }}
          </span>
        </button>
      </div>

      <!-- 우측 검색 -->
      <div class="col-md-6 d-flex justify-content-end gap-2">
        <input
          v-model="keyword"
          type="text"
          class="form-control form-control-sm w-auto"
          placeholder="검색어 입력"
          @keyup.enter="applyFilter"
        />
        <button class="btn btn-primary btn-sm" @click="applyFilter">
          검색
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col pt-2 mt-1">
        <hr class="my-2" />
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">목록을 불러오는 중입니다...</p>
    </div>

    <template v-else>
      <!-- 데이터 없음 -->
      <div
        v-if="filteredList.length === 0"
        class="text-center py-5 border rounded bg-light"
      >
        <p class="text-muted mb-0">인터뷰 요청 내역이 없습니다.</p>
      </div>

      <div class="row" v-else>
        <div class="col">
          <ul class="simple-post-list m-0 position-relative">
            <li
              v-for="interview in filteredList"
              :key="interview.interviewSq"
              style="border-bottom: 1px rgb(230, 230, 230) solid"
            >
              <div class="post-info position-relative">
                <!-- 회사명 + 수락/거절 버튼 -->
                <div
                  class="d-flex justify-content-between align-items-center gap-2"
                >
                  <div>
                    <span class="text-primary" style="font-size: 1.3rem">
                      {{
                        userStore.userType === 'COMPANY'
                          ? interview.userNm
                          : interview.companyNm
                      }}
                    </span>
                  </div>
                  <div class="d-flex gap-2">
                    <template
                      v-if="
                        userStore.userType === 'PERSONAL' &&
                        interview.interviewStatus === 'W'
                      "
                    >
                      <button
                        class="btn btn-primary btn-sm"
                        @click="updateStatus(interview.interviewSq, 'A')"
                      >
                        수락
                      </button>
                      <button
                        class="btn btn-outline-danger btn-sm"
                        @click="updateStatus(interview.interviewSq, 'R')"
                      >
                        거절
                      </button>
                    </template>
                    <template v-else>
                      <span
                        class="btn btn-sm"
                        :class="{
                          'btn-warning': interview.interviewStatus === 'W',
                          'btn-primary': interview.interviewStatus === 'A',
                          'btn-danger': interview.interviewStatus === 'R',
                        }"
                      >
                        {{ statusLabel(interview.interviewStatus) }}
                      </span>
                    </template>
                  </div>
                </div>

                <!-- 요청일자 + 상태 -->
                <div
                  class="d-flex justify-content-between align-items-center mt-2"
                >
                  <div class="post-meta text-4">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >요청일자</span
                    >
                    | {{ formatDate(interview.interviewCreatedAt) }}
                  </div>
                  <div class="post-meta text-4">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >상태</span
                    >
                    | {{ statusLabel(interview.interviewStatus) }}
                  </div>
                </div>

                <!-- 요청글 -->
                <div class="d-flex align-items-center mt-2 mb-3">
                  <div class="post-meta text-4">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >요청글</span
                    >
                    | {{ interview.interviewRequestTxt }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/axios'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'

const userStore = useUserStore()
const alertStore = useAlertStore()

const isLoading = ref(false)
const interviewList = ref([])
const statusType = ref('all')
const keyword = ref('')

// 필터 카운트
const totalCount = computed(() => interviewList.value.length)
const waitCount = computed(
  () => interviewList.value.filter((i) => i.interviewStatus === 'W').length,
)
const acceptCount = computed(
  () => interviewList.value.filter((i) => i.interviewStatus === 'A').length,
)
const rejectCount = computed(
  () => interviewList.value.filter((i) => i.interviewStatus === 'R').length,
)

const filters = computed(() => [
  { type: 'all', label: '전체', count: totalCount.value },
  { type: 'W', label: '대기', count: waitCount.value },
  { type: 'A', label: '수락', count: acceptCount.value },
  { type: 'R', label: '거절', count: rejectCount.value },
])

// 필터링된 목록
const filteredList = computed(() => {
  let list = interviewList.value

  // 상태 필터
  if (statusType.value !== 'all') {
    list = list.filter((i) => i.interviewStatus === statusType.value)
  }

  // 검색어 필터
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter(
      (i) =>
        i.companyNm?.toLowerCase().includes(kw) ||
        i.interviewRequestTxt?.toLowerCase().includes(kw),
    )
  }

  return list
})

const setFilter = (type) => {
  statusType.value = type
}

const applyFilter = () => {
  statusType.value = 'all'
}

const formatDate = (datetime) => {
  if (!datetime) return '-'
  const date = new Date(datetime)
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day
  return `${year}.${month}.${day}`
}

const statusLabel = (status) => {
  if (status === 'W') return '대기중'
  if (status === 'A') return '수락'
  if (status === 'R') return '거절'
  return '-'
}

const fetchInterviewList = async () => {
  isLoading.value = true
  try {
    const response = await api.$get('/interview', {
      params: {
        userSq: userStore.userSq,
        userType: userStore.userType,
      },
    })
    interviewList.value = response.output
  } catch (error) {
    console.log('인터뷰 목록 조회 에러:', error)
    alertStore.show('인터뷰 목록 조회에 실패했습니다.', 'danger')
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (interviewSq, status) => {
  try {
    await api.$patch(
      `/interview?interviewSq=${interviewSq}&interviewStatus=${status}`,
    )
    alertStore.show(
      status === 'A' ? '수락했습니다.' : '거절했습니다.',
      'success',
    )
    await fetchInterviewList()
  } catch (error) {
    console.log('상태 변경 에러:', error)
    alertStore.show('상태 변경에 실패했습니다.', 'danger')
  }
}

onMounted(() => {
  fetchInterviewList()
})
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding: 0;
}
</style>
