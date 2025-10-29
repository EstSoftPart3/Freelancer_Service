<template>
  <CommonHeader />
  <section>
    <CommonPageHeader
      title="관리자"
      strongText="회원 상세"
      :breadcrumbs="[
        { text: 'Home', link: '/admin' },
        { text: '회원 관리', link: '/admin/members' },
        { text: '회원 상세' },
      ]"
    />

    <div class="container py-5 mt-3">
      <!-- 뒤로가기 버튼 -->
      <div class="row mb-3">
        <div class="col-12">
          <button class="btn btn-outline-secondary" @click="goBack">
            <i class="fas fa-arrow-left me-2"></i>목록으로
          </button>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- 회원 상세 정보 -->
      <div v-else-if="member" class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light">
              <h4 class="mb-0">
                <i class="fas fa-user-circle me-2"></i>회원 상세 정보
              </h4>
            </div>
            <div class="card-body">
              <div class="row mb-3 pb-3 border-bottom">
                <div class="col-md-4">
                  <strong class="text-muted">아이디</strong>
                </div>
                <div class="col-md-8">{{ member.userId }}</div>
              </div>

              <div class="row mb-3 pb-3 border-bottom">
                <div class="col-md-4">
                  <strong class="text-muted">이름</strong>
                </div>
                <div class="col-md-8">{{ member.userNm }}</div>
              </div>

              <div class="row mb-3 pb-3 border-bottom">
                <div class="col-md-4">
                  <strong class="text-muted">이메일</strong>
                </div>
                <div class="col-md-8">{{ member.userEmail }}</div>
              </div>

              <div class="row mb-3 pb-3 border-bottom">
                <div class="col-md-4">
                  <strong class="text-muted">전화번호</strong>
                </div>
                <div class="col-md-8">{{ member.userPhoneNum || '-' }}</div>
              </div>

              <div class="row mb-3 pb-3 border-bottom">
                <div class="col-md-4">
                  <strong class="text-muted">생년월일</strong>
                </div>
                <div class="col-md-8">{{ member.userBirthDt || '-' }}</div>
              </div>

              <div class="row mb-3 pb-3 border-bottom">
                <div class="col-md-4">
                  <strong class="text-muted">계정 구분</strong>
                </div>
                <div class="col-md-8">{{ member.userTypeCdNm }}</div>
              </div>

              <div class="row mb-3 pb-3 border-bottom">
                <div class="col-md-4">
                  <strong class="text-muted">계정 상태</strong>
                </div>
                <div class="col-md-8">
                  {{ member.userIsActivateYn === 'Y' ? '활성화' : '비활성화' }}
                </div>
              </div>

              <!-- 기업인 경우 추가 정보 -->
              <template v-if="member.companyNm">
                <div class="row mb-3 pb-3 border-bottom">
                  <div class="col-md-4">
                    <strong class="text-muted">기업명</strong>
                  </div>
                  <div class="col-md-8">{{ member.companyNm }}</div>
                </div>

                <div class="row mb-3 pb-3 border-bottom">
                  <div class="col-md-4">
                    <strong class="text-muted">대표자명</strong>
                  </div>
                  <div class="col-md-8">{{ member.companyCeoNm || '-' }}</div>
                </div>

                <div class="row mb-3 pb-3 border-bottom">
                  <div class="col-md-4">
                    <strong class="text-muted">사업자등록번호</strong>
                  </div>
                  <div class="col-md-8">{{ member.companyBizNum || '-' }}</div>
                </div>
              </template>

              <div class="row mb-3 pb-3 border-bottom">
                <div class="col-md-4">
                  <strong class="text-muted">가입일</strong>
                </div>
                <div class="col-md-8">{{ formatDate(member.createdAt) }}</div>
              </div>

              <div class="row mb-3">
                <div class="col-md-4">
                  <strong class="text-muted">마지막 수정일</strong>
                </div>
                <div class="col-md-8">{{ formatDate(member.updatedAt) }}</div>
              </div>

              <!-- 관리자 액션 버튼 -->
              <div class="mt-4 pt-3 border-top">
                <button
                  class="btn"
                  :class="
                    member.userIsActivateYn === 'Y'
                      ? 'btn-warning'
                      : 'btn-success'
                  "
                  @click="toggleAccountStatus"
                  :disabled="updating"
                >
                  <i
                    class="fas me-2"
                    :class="
                      member.userIsActivateYn === 'Y' ? 'fa-ban' : 'fa-check'
                    "
                  ></i>
                  {{
                    member.userIsActivateYn === 'Y'
                      ? '계정 비활성화'
                      : '계정 활성화'
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 에러 상태 -->
      <div v-else class="row">
        <div class="col-12">
          <div class="alert alert-danger">회원 정보를 불러올 수 없습니다.</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/axios'
import CommonHeader from '@/fo/components/common/CommonHeader.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { useAlertStore } from '@/fo/stores/alertStore'

const router = useRouter()
const route = useRoute()
const alertStore = useAlertStore()

const member = ref(null)
const loading = ref(false)
const updating = ref(false)

// 회원 상세 정보 조회
const fetchMemberDetail = async () => {
  loading.value = true
  try {
    const userSq = route.params.userSq
    const response = await api.$get(`/admin/members/${userSq}`)

    if (response && response.output) {
      member.value = response.output
    }
  } catch (error) {
    console.error('회원 정보 조회 실패:', error)
    alertStore.show('회원 정보를 불러오는데 실패했습니다.', 'danger')
  } finally {
    loading.value = false
  }
}

// 계정 상태 토글 (활성화/비활성화)
const toggleAccountStatus = async () => {
  const newStatus = member.value.userIsActivateYn === 'Y' ? 'N' : 'Y'
  const confirmMessage = `정말 이 계정을 ${newStatus === 'Y' ? '활성화' : '비활성화'}하시겠습니까?`

  if (!confirm(confirmMessage)) {
    return
  }

  updating.value = true
  try {
    await api.$patch(`/admin/members/${member.value.userSq}/status`, {
      userIsActivateYn: newStatus,
    })

    alertStore.show('계정 상태가 변경되었습니다.', 'success')
    await fetchMemberDetail() // 새로고침
  } catch (error) {
    console.error('계정 상태 변경 실패:', error)
    alertStore.show('계정 상태 변경에 실패했습니다.', 'danger')
  } finally {
    updating.value = false
  }
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 뒤로가기
const goBack = () => {
  router.push({ name: 'AdminMemberList' })
}

// 초기 로드
onMounted(() => {
  fetchMemberDetail()
})
</script>

<style scoped>
.card-header {
  border-bottom: 2px solid #dee2e6;
}

.border-bottom:last-child {
  border-bottom: none !important;
}
</style>

