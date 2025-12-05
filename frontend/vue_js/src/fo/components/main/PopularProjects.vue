<template>
  <section class="popular-projects-section">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="section-header-left">
          <h2>인기 프로젝트</h2>
          <p class="text-muted mb-0">현재 인기 프로젝트를 확인해보세요.</p>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="filter-tabs">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              :class="[
                'btn',
                'btn-sm',
                'me-2',
                activeFilter === tab.key
                  ? 'btn-primary'
                  : 'btn-outline-secondary',
              ]"
              @click="setActiveFilter(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
          <button
            class="btn btn-outline-primary btn-sm"
            @click="$emit('go-to-list')"
          >
            더보기 <i class="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>

      <div
        v-if="isLoadingProjects"
        class="text-center py-5"
        style="min-height: 300px"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩 중</span>
        </div>
      </div>

      <div
        v-else-if="popularProjects.length === 0"
        class="text-center py-5 empty-message"
        style="min-height: 300px"
      >
        <p class="text-muted">표시할 프로젝트가 없습니다.</p>
      </div>

      <div v-else class="row" style="min-height: 300px">
        <div
          v-for="project in displayedProjects"
          :key="project.projectSq"
          class="col mb-4"
        >
          <div
            class="project-card card h-100"
            @click="handleProjectCardClick(project)"
            style="cursor: pointer"
          >
            <div class="card-img-wrapper">
              <img
                :src="project.projectImageUrl || defaultProjectImage"
                class="card-img-top"
                alt="프로젝트 이미지"
              />
              <div class="view-count-overlay">
                <i class="bi bi-eye-fill me-1"></i>
                {{ formatNumber(project.projectViewCnt || 0) }}
              </div>
            </div>
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start mb-2"
              >
                <h5 class="card-title mb-0">{{ project.projectTtl }}</h5>
                <div class="d-flex align-items-center gap-2 flex-shrink-0">
                  <span class="days-left"
                    >D-{{ calculateDaysLeft(project.projectEndDt) }}</span
                  >
                  <button
                    class="btn-scrap"
                    @click.stop="toggleScrap(project)"
                    :class="{ active: project.hasScrapped }"
                  >
                    <i
                      class="bi"
                      :class="
                        project.hasScrapped ? 'bi-heart-fill' : 'bi-heart'
                      "
                    ></i>
                  </button>
                </div>
              </div>
              <p class="card-text text-muted">
                <i class="bi bi-buildings"></i>By
                <span class="company-name">{{ project.companyNm }}</span>
              </p>
              <p class="card-text small text-muted">
                {{ project.address }} / {{ project.devGradeNm }} /
                {{ project.requiredEduLv1 }}
              </p>
              <div class="d-flex gap-1 flex-wrap mt-2">
                <span
                  v-for="skill in project.reqSkills?.slice(0, 3)"
                  :key="skill"
                  class="badge bg-primary"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/fo/stores/userStore'
import { api } from '@/axios'
import defaultProjectImage from '@/assets/default-kard.png'

const router = useRouter()
const userStore = useUserStore()

defineEmits(['go-to-list'])

const filterTabs = [
  { key: 'views', label: '조회순' },
  { key: 'scraps', label: '스크랩순' },
  { key: 'applications', label: '지원순' },
]

const activeFilter = ref('views')
const popularProjects = ref([])
const allPopularProjectsData = ref({
  viewCount: [],
  scrapCount: [],
  applicantCount: [],
})

const isLoadingProjects = ref(false)

const displayedProjects = computed(() => {
  return popularProjects.value.slice(0, 4)
})

const loadPopularProjects = async () => {
  try {
    isLoadingProjects.value = true
    const response = await api.$get('/projects/top')

    if (response.output) {
      // 각 배열의 프로젝트에 hasScrapped 설정
      // API에서 hasScrapped가 null이면 false로 설정
      allPopularProjectsData.value = {
        viewCount: (response.output.viewCount || []).map((p) => ({
          ...p,
          hasScrapped: p.hasScrapped === true || p.hasScrapped === 'Y',
        })),
        scrapCount: (response.output.scrapCount || []).map((p) => ({
          ...p,
          hasScrapped: p.hasScrapped === true || p.hasScrapped === 'Y',
        })),
        applicantCount: (response.output.applicantCount || []).map((p) => ({
          ...p,
          hasScrapped: p.hasScrapped === true || p.hasScrapped === 'Y',
        })),
      }
    }

    updatePopularProjects('views')

    // 로그인한 경우 스크랩 상태 동기화
    if (userStore.isLoggedIn) {
      await syncScrapStatus()
    }
  } catch (error) {
    console.error('인기 프로젝트 로드 실패: ', error)
    popularProjects.value = []
  } finally {
    isLoadingProjects.value = false
  }
}

// 스크랩 상태 동기화 함수
const syncScrapStatus = async () => {
  try {
    console.log('스크랩 상태 동기화 시작...')
    const response = await api.$get('/mypage/projectScrapIds')

    const scrappedProjectIds = response.output || []

    console.log('스크랩된 프로젝트 id :', scrappedProjectIds)
    ;['viewCount', 'scrapCount', 'applicantCount'].forEach((key) => {
      if (allPopularProjectsData.value[key]) {
        allPopularProjectsData.value[key].forEach((project) => {
          project.hasScrapped = scrappedProjectIds.includes(project.projectSq)
        })
      }
    })

    //현재 표시 중인 프로젝트 목록도 업데이트
    popularProjects.value.forEach((project) => {
      project.hasScrapped = scrappedProjectIds.includes(project.projectSq)
    })
    console.log('✅ 스크랩 상태 동기화 완료')
  } catch (error) {
    console.error('스크랩 상태 동기화 실패:', error)
  }
}

const updatePopularProjects = (filter) => {
  switch (filter) {
    case 'views':
      popularProjects.value = allPopularProjectsData.value.viewCount || []
      break
    case 'scraps':
      popularProjects.value = allPopularProjectsData.value.scrapCount || []
      break
    case 'applications':
      popularProjects.value = allPopularProjectsData.value.applicantCount || []
      break
    default:
      popularProjects.value = allPopularProjectsData.value.viewCount || []
  }
}

const setActiveFilter = (filter) => {
  activeFilter.value = filter
  updatePopularProjects(filter)
}

const handleProjectCardClick = (project) => {
  const userType = userStore.getUserType
  if (userType === 'PERSONAL') {
    router.push(`/project/spec/user/${project.projectSq}`)
  } else if (userType === 'COMPANY') {
    router.push(`/project/spec/company/${project.projectSq}`)
  } else {
    router.push(`/project/spec/user/${project.projectSq}`)
  }
}

const calculateDaysLeft = (endDate) => {
  if (!endDate) return '∞'
  const today = new Date()
  const end = new Date(endDate)
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const toggleScrap = async (project) => {
  // 로그인 체크
  if (!userStore.isLoggedIn) {
    alert('로그인이 필요한 기능입니다.')
    router.push('/login')
    return
  }
  try {
    const isScrapped = project.hasScrapped

    // 즉시 UI 업데이트 (낙관적 업데이트)
    project.hasScrapped = !isScrapped

    console.log('스크랩 토글:', {
      projectSq: project.projectSq,
      이전상태: isScrapped,
      새상태: project.hasScrapped,
      API전송값: isScrapped,
    })
    const response = await api.$post(`/projects/${project.projectSq}/scraps`, {
      hasScrapped: isScrapped,
      target: '프로젝트',
    })
    console.log('API 응답 전체:', response)
    console.log('응답 output:', response.output)

    if (response.status === 'OK') {
      console.log(
        `스크랩 ${project.hasScrapped ? '추가' : '취소'} 성공! 현재 스크랩 수: ${response.output}`,
      )

      // Vue의 반응성을 위해 명시적으로 업데이트
      const index = popularProjects.value.findIndex(
        (p) => p.projectSq === project.projectSq,
      )
      if (index !== -1) {
        popularProjects.value[index].hasScrapped = project.hasScrapped
        if (response.output) {
          popularProjects.value[index].scrapCount = response.output
        }
      }
    }
  } catch (error) {
    console.error('스크랩 처리 실패:', error)

    // 실패 시 원래 상태로 복구
    project.hasScrapped = !project.hasScrapped
    const index = popularProjects.value.findIndex(
      (p) => p.projectSq === project.projectSq,
    )
    if (index !== -1) {
      popularProjects.value[index].hasScrapped = project.hasScrapped
    }

    if (error.response?.status === 401) {
      alert('로그인이 만료되었습니다.')
      router.push('/login')
    } else {
      alert('스크랩 처리 중 오류가 발생했습니다.')
    }
  }
}

onMounted(() => {
  loadPopularProjects()
})
</script>

<style scoped>
.popular-projects-section {
  padding: 84px 0;
  margin-bottom: 140px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.section-header-left h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.section-header-left p {
  font-size: 1rem;
}

.section-header-left p.text-muted {
  color: #6c757d !important;
}

.filter-tabs .btn {
  border-radius: 25px;
  padding: 0.4rem 1.2rem;
  font-weight: 500;
  white-space: nowrap;
}

.empty-message p {
  padding-top: 10%;
  font-size: 1.4rem;
  font-weight: 500;
}

.popular-projects-section .container {
  max-width: 1600px;
}

.popular-projects-section .row {
  display: grid;
  grid-template-columns: repeat(4, minmax(280px, 1fr));
  gap: 2rem;
}

.popular-projects-section .col {
  padding: 0;
}

.project-card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  background: white;
}

.card-img-wrapper {
  position: relative;
  overflow: hidden;
}

.card-img-wrapper img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-card:hover .card-img-wrapper img {
  transform: scale(1.05);
}

.view-count-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .view-count-overlay {
  opacity: 1;
}

.project-card .card-body {
  padding: 1.5rem;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.project-card .card-title {
  font-size: 1.15rem;
  font-weight: bold;
  color: #0088cc;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.days-left {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ff6b6b;
  white-space: nowrap;
}

.btn-scrap {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 1.2rem;
  color: #ddd;
  transition: all 0.2s ease;
  line-height: 1;
}

.btn-scrap:hover {
  color: #ff6b6b;
  transform: scale(1.1);
}

.btn-scrap.active {
  color: #ff6b6b;
}

.btn-scrap.active i {
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.card-title {
  color: #0088cc;
}

.project-card .card-text {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;

  color: #6c757d !important;
}
.project-card p.card-text.text-muted {
  color: #6c757d !important;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.project-card p.card-text.text-muted i {
  color: #6c757d;
  margin-right: 4px;
}
.popular-projects-section .text-muted {
  color: #0088cc !important;
}

.project-card .card-text.small.text-muted {
  color: #6c757d !important;
}
.project-card .company-name {
  color: #0088cc;
  font-weight: 500;
}

@media (max-width: 1400px) {
  .popular-projects-section .row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .popular-projects-section .row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section-header-left h2 {
    font-size: 2rem;
  }

  .empty-message p {
    padding-top: 10%;
    font-size: 1.3rem;
  }

  .popular-projects-section .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }

  .popular-projects-section .row {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .card-img-wrapper img {
    height: 180px;
  }
}

@media (max-width: 576px) {
  .popular-projects-section {
    padding: 63px 0;
    margin-bottom: 90px;
  }

  .empty-message p {
    padding-top: 10%;
    font-size: 1.3rem;
  }

  .popular-projects-section .row {
    grid-template-columns: 1fr;
  }

  .card-img-wrapper img {
    height: 200px;
  }
}
</style>
