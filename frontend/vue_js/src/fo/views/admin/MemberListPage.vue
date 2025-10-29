<template>
  <CommonHeader />
  <section>
    <CommonPageHeader
      title="관리자"
      strongText="회원 관리"
      :breadcrumbs="[{ text: 'Home', link: '/admin' }, { text: '회원 관리' }]"
    />
    
    <div class="container py-5 mt-3">
      <!-- 검색 및 필터 영역 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="mb-3">회원 정보</h5>
              <div class="row g-3">
                <!-- 검색어 입력 -->
                <div class="col-md-4">
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control"
                    placeholder="아이디, 이름, 이메일 입력"
                    @keyup.enter="handleSearch"
                  />
                </div>

                <!-- 계정 상태 필터 -->
                <div class="col-md-3">
                  <select v-model="filters.accountStatus" class="form-select">
                    <option value="">계정 상태</option>
                    <option value="Y">활성화</option>
                    <option value="N">비활성화</option>
                  </select>
                </div>

                <!-- 계정 구분 필터 -->
                <div class="col-md-3">
                  <select v-model="filters.accountType" class="form-select">
                    <option value="">계정 구분</option>
                    <option value="301">개인</option>
                    <option value="302">기업</option>
                    <option value="303">관리자</option>
                  </select>
                </div>

                <!-- 검색 버튼 -->
                <div class="col-md-2">
                  <button class="btn btn-primary w-100" @click="handleSearch">
                    검색
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 회원 목록 테이블 -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>아이디</th>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>계정 상태</th>
                      <th>계정 구분</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loading">
                      <td colspan="5" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else-if="members.length === 0">
                      <td colspan="5" class="text-center py-5 text-muted">
                        등록된 회원이 없습니다.
                      </td>
                    </tr>
                    <tr
                      v-else
                      v-for="member in members"
                      :key="member.userSq"
                      style="cursor: pointer"
                      @click="goToMemberDetail(member.userSq)"
                    >
                      <td>
                        <span class="text-primary fw-medium">{{ member.userId }}</span>
                      </td>
                      <td>{{ member.userNm }}</td>
                      <td>{{ member.userEmail }}</td>
                      <td>
                        {{ member.userIsActivateYn === 'Y' ? '활성화' : '비활성화' }}
                      </td>
                      <td>
                        {{ member.userTypeCdNm }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 페이지네이션 -->
              <CommonPagination
                v-if="!loading && totalPages > 0"
                :currentPage="currentPage"
                :totalPages="totalPages"
                @update:currentPage="currentPage = $event"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/axios'
import CommonHeader from '@/fo/components/common/CommonHeader.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import { useAlertStore } from '@/fo/stores/alertStore'

const router = useRouter()
const alertStore = useAlertStore()

// 검색 및 필터
const searchQuery = ref('')
const filters = ref({
  accountStatus: '', // '', 'Y'(활성), 'N'(비활성)
  accountType: '', // '', '1100'(개인), '1200'(기업)
})

// 회원 목록
const members = ref([])
const loading = ref(false)

// 페이지네이션
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)
const totalPages = ref(0)

// 회원 목록 조회
const fetchMembers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value - 1, // 백엔드는 0부터 시작
      size: pageSize.value,
    }

    // 검색어
    if (searchQuery.value && searchQuery.value.trim() !== '') {
      params.searchQuery = searchQuery.value.trim()
    }

    // 계정 상태 필터
    if (filters.value.accountStatus) {
      params.userIsActivateYn = filters.value.accountStatus
    }

    // 계정 구분 필터
    if (filters.value.accountType) {
      params.userTypeCd = Number(filters.value.accountType)
    }

    const response = await api.$get('/admin/members', { params })

    if (response && response.output) {
      members.value = response.output.content || []
      totalElements.value = response.output.totalElements || 0
      totalPages.value = response.output.totalPages || 0
    }
  } catch (error) {
    console.error('회원 목록 조회 실패:', error)
    alertStore.show('회원 목록을 불러오는데 실패했습니다.', 'danger')
  } finally {
    loading.value = false
  }
}

// 검색 실행
const handleSearch = () => {
  currentPage.value = 1 // 검색 시 첫 페이지로
  fetchMembers()
}

// 회원 상세 페이지로 이동
const goToMemberDetail = (userSq) => {
  router.push({
    name: 'AdminMemberDetail',
    params: { userSq },
  })
}

// 페이지 변경 시 자동 조회
watch(currentPage, () => {
  fetchMembers()
})

// 초기 로드
onMounted(() => {
  fetchMembers()
})
</script>

<style scoped>
.table tbody tr:hover {
  background-color: #f8f9fa;
}

.card {
  transition: box-shadow 0.3s ease;
}

.fw-medium {
  font-weight: 500;
}
</style>

