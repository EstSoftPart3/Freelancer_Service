<template>
  <div class="row mb-4 position-relative">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">불러오는 중...</span>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="col-12 text-center py-5 text-muted">
      추천 프로젝트를 불러오지 못했습니다.
      <button class="btn btn-sm btn-link" @click="fetchRecommendations">
        다시 시도
      </button>
    </div>

    <!-- 데이터 없음 -->
    <div
      v-else-if="recommendations.length === 0"
      class="col-12 text-center py-5 text-muted"
    >
      <div
        class="card position-relative p-4 shadow-sm h-100 bg-color-light align-items-center"
      >
        <button
          class="btn btn-3d btn-md btn-primary"
          style="width: 200px"
          @click="goToResumeList"
        >
          대표 이력서 설정
        </button>
        <span class="text-muted mt-2"
          >대표이력서를 설정하시면 적합한 프로젝트를 추천해 드릴 수
          있습니다.</span
        >
      </div>
    </div>

    <!-- 정상 데이터 -->
    <div
      class="col-md-6 col-lg-3 my-2"
      v-for="item in recommendations"
      :key="item.projectSq"
    >
      <div
        class="card position-relative p-4 shadow-sm h-100 bg-color-light anim-hover-translate-top-10px transition-3ms"
      >
        <div class="d-flex flex-row align-items-center">
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h4 class="mb-0 fw-bold d-flex align-items-center">
                <a
                  href="#"
                  @click.prevent="goToProjectSpec(item)"
                  class="text-dark text-decoration-none"
                >
                  {{ item.projectTtl }}
                </a>
              </h4>
              <button
                class="btn btn-rounded btn-3d btn-light px-2 py-1 text-primary"
              >
                매칭률 {{ item.matchScore }}%
              </button>
            </div>
            <div class="d-flex flex-column text-muted fs-6">
              <div
                class="d-flex justify-content-between align-items-center flex-wrap gap-2"
              >
                <span class="text-muted fs-6">{{ item.companyNm }}</span>
                <span class="d-flex align-items-center">{{
                  item.addressNm
                }}</span>
              </div>
              <div class="d-flex align-items-center mt-2">
                <div class="projectPrice text-primary">
                  {{ formatUnitPrice(item.projectSalary) }}
                </div>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <button
                v-for="skill in item.requiredSkillList"
                :key="skill"
                class="btn btn-rounded btn-3d btn-sm btn-light"
              >
                {{ skill }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/axios'
import { navigateByUserTypeAndProjectSq } from '@/fo/router/userTypeRouter.js'
import { useUserStore } from '../../stores/userStore.js'

const recommendations = ref([])
const loading = ref(false)
const error = ref(false)
const userStore = useUserStore()
const userType = userStore.getUserType
const router = useRouter()
const formatUnitPrice = (price, negotiable) => {
  if (negotiable === 'Y') return '협의가능'
  if (price == null) return '-'
  return `월 ${(Number(price) / 10000).toLocaleString()}만원`
}
const goToProjectSpec = (project) => {
  navigateByUserTypeAndProjectSq(userType, project.projectSq)
}
const goToResumeList = () => {
  router.push('/mypage/resumeList')
}
const fetchRecommendations = async () => {
  loading.value = true
  error.value = false

  try {
    const response = await api.$get('/projects/recommendations')

    console.log(response)

    // ApiResponse 구조라면
    recommendations.value = response.output
    // 또는 프로젝트에 맞게 response.data / response.result 등으로 변경
  } catch (e) {
    console.error('추천 프로젝트 조회 실패', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchRecommendations)
</script>
