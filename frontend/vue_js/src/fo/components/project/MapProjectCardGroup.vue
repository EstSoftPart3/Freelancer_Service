<template>
  <div class="map-project-list">
    <div
      v-for="(project, index) in props.projects"
      :key="project.projectSq"
      class="card mb-2 position-relative border-0 border-bottom rounded-0 custom-hover-bg"
      @click="handleCardClick(index, project)"
      style="cursor: pointer"
    >
      <div class="card-body p-3">
        <div class="d-flex align-items-start mb-1">
          <span
            class="badge rounded-circle bg-primary me-2 flex-shrink-0 d-flex align-items-center justify-content-center"
            style="width: 20px; height: 20px; font-size: 11px; margin-top: 2px"
          >
            {{ index + 1 }}
          </span>

          <div class="flex-grow-1 min-width-0">
            <h5
              class="text-3 text-dark font-weight-bold mb-1 text-truncate pe-4"
            >
              {{ project.projectTtl }}
            </h5>
          </div>

          <div class="ms-2">
            <a @click.stop="clickScrap(project)" class="text-decoration-none">
              <i
                :class="[
                  'bi',
                  project.hasScrapped === 'Y'
                    ? 'bi-heart-fill text-danger'
                    : 'bi-heart text-muted',
                  'fs-6',
                ]"
              ></i>
            </a>
          </div>
        </div>

        <div class="ps-4">
          <p class="mb-1 text-2 text-muted font-weight-semibold">
            <i class="bi bi-buildings"></i> {{ project.companyNm }}
          </p>
          <div class="text-1 text-muted mb-2">
            {{ project.address }} | {{ project.devGradeNm }}
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <div class="projectPrice text-primary">
              {{ project.formattedSalary }}
            </div>

            <span
              :class="[
                'badge',
                getProjectStatus(project).status === '채용중'
                  ? 'bg-primary'
                  : 'bg-light text-dark',
                'text-1',
              ]"
            >
              {{ getProjectStatus(project).status }}
              {{
                getProjectStatus(project).dDay
                  ? ' ' + getProjectStatus(project).dDay
                  : ''
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useAlertStore } from '../../stores/alertStore.js'
// import { useUserStore } from '../../stores/userStore.js'
// import { navigateByUserTypeAndProjectSq } from '@/fo/router/userTypeRouter.js'
import { api } from '@/axios.js'

const props = defineProps({
  projects: { type: Array, required: true },
})

const emit = defineEmits(['focus-marker'])
const alertStore = useAlertStore()
// const userStore = useUserStore()
// const userType = userStore.getUserType

// 카드 클릭 시 지도 포커싱 이벤트 발생
const handleCardClick = (index, project) => {
  emit('focus-marker', { index, project })
}

// 기존 상세 이동 로직 (필요 시 더블클릭이나 상세 버튼으로 활용 가능)
// const goToProjectSpec = (project) => {
//   navigateByUserTypeAndProjectSq(userType, project.projectSq)
// }

const getProjectStatus = (project) => {
  const today = new Date()
  const start = new Date(project.recruitStartDt)
  const end = new Date(project.recruitEndDt)

  if (today < start) return { status: '채용예정' }
  if (today > end) return { status: '채용종료' }

  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
  return { status: '채용중', dDay: `D-${diff}` }
}

const clickScrap = async (project) => {
  try {
    const isScrapped = project.hasScrapped === 'Y'
    project.hasScrapped = isScrapped ? 'N' : 'Y'
    await api.$post(`/projects/${project.projectSq}/scraps`, {
      withCredentials: true,
      hasScrapped: isScrapped,
      target: '프로젝트',
    })
    alertStore.show(isScrapped ? '스크랩 해제 완료' : '스크랩 완료')
  } catch (error) {
    project.hasScrapped = project.hasScrapped === 'Y' ? 'N' : 'Y'
    alertStore.show('스크랩 실패', 'danger')
  }
}
</script>

<style scoped>
.custom-hover-bg:hover {
  background-color: #f0f7ff !important;
  transition: background-color 0.2s ease;
}
.min-width-0 {
  min-width: 0;
}
/* 사이드바 전용 폰트 크기 조정 */
.text-1 {
  font-size: 0.75rem !important;
}
.text-2 {
  font-size: 0.85rem !important;
}
.text-3 {
  font-size: 0.95rem !important;
}

.projectPrice {
  font-size: 1.15rem;
  font-weight: 800;
  background: #f0f7ff;
  padding: 5px 10px;
  border-radius: 6px;
  display: inline-block;
}

/* 모바일에서 사이드바 숨기기 (추가) */
@media (max-width: 767.98px) {
  .map-project-list {
    display: none !important;
  }
}

.custom-hover-bg:hover {
  background-color: #f0f7ff !important;
  transition: background-color 0.2s ease;
}
</style>
