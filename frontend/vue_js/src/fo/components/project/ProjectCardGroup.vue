<template>
  <div class="row mb-4 position-relative">
    <div class="col">
      <div
        v-for="project in props.projects"
        :key="project.id"
        class="card position-relative p-4 shadow-sm"
      >
        <!-- 스크랩 아이콘 (카드 우측 상단 고정) -->
        <div class="position-absolute top-0 end-0 m-3">
          <a
            @click="clickScrap(project)"
            class="text-decoration-none"
            style="cursor: pointer"
          >
            <i
              :class="[
                'bi',
                project.hasScrapped === 'Y'
                  ? 'bi-heart-fill text-danger'
                  : 'bi-heart text-muted',
                'fs-4',
              ]"
            ></i>
          </a>
        </div>

        <!-- 카드 본문 -->
        <div class="d-flex flex-row align-items-center">
          <!-- 썸네일 이미지 -->
          <div
            class="me-4 flex-shrink-0"
            @click="goToProjectSpec(project)"
            style="cursor: pointer"
          >
            <img
              :src="
                project.companyImageUrl ||
                'https://freelancer-service.s3.ap-northeast-2.amazonaws.com/12461_3.png'
              "
              alt="프로젝트 이미지"
              class="rounded-circle"
              style="width: 70px; height: 70px; object-fit: cover"
            />
          </div>

          <!-- 텍스트 정보 -->
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h4 class="mb-0 fw-bold d-flex align-items-center">
                <a
                  href="#"
                  @click.prevent="goToProjectSpec(project)"
                  class="text-dark text-decoration-none"
                >
                  {{ project.projectTtl }}
                </a>
                <span
                  :class="[
                    'btn',
                    getProjectStatus(project).status === '채용중'
                      ? 'btn-primary'
                      : 'btn-light',
                    'btn-sm',
                    'ms-3', // 간격 확보
                  ]"
                >
                  {{ getProjectStatus(project).status }}
                  <span
                    v-if="getProjectStatus(project).status === '채용중'"
                    class="badge bg-white text-primary fw-bold px-2 py-1 ms-2"
                  >
                    {{ getProjectStatus(project).dDay }}
                  </span>
                </span>
              </h4>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-2">
              <p class="mb-2 text-muted fs-6">
                <i class="bi bi-buildings"></i> {{ project.companyNm }}
              </p>
            </div>

            <div
              class="d-flex justify-content-between align-items-center text-muted fs-6"
            >
              <div>
                {{ project.address }} / {{ project.devGradeNm }} /
                {{ project.requiredEduLvl }} / {{ project.salary }}원
              </div>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <button
                v-for="skill in project.reqSkills"
                :key="skill.id"
                class="btn btn-rounded btn-3d btn-light btn-sm"
              >
                <img
                  :src="generateIconUrl(skill)"
                  width="16"
                  height="16"
                  :alt="skill.name"
                />
                {{ skill }}
              </button>
            </div>
            <div class="text-muted text-end">조회수: {{ project.viewCnt }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useAlertStore } from '../../stores/alertStore.js'
import { useUserStore } from '../../stores/userStore.js'
import { navigateByUserTypeAndProjectSq } from '@/fo/router/userTypeRouter.js'
import { api } from '@/axios.js'
import skillIconMap from '@/assets/skillIconMap.js'

const alertStore = useAlertStore()
const userStore = useUserStore()
const userType = userStore.getUserType

const goToProjectSpec = (project) => {
  navigateByUserTypeAndProjectSq(userType, project.projectSq)
}

const generateIconUrl = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
})

const getProjectStatus = (project) => {
  const today = new Date()
  const start = new Date(project.recruitStartDt)
  const end = new Date(project.recruitEndDt)

  if (today < start) {
    return { status: '채용예정' }
  } else if (today > end) {
    return { status: '채용종료' }
  } else {
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
    return { status: '채용중', dDay: `D-${diff}` }
  }
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

    alertStore.show(
      isScrapped ? '스크랩 해제에 성공하였습니다.' : '스크랩에 성공하였습니다.',
    )
  } catch (error) {
    project.hasScrapped = project.hasScrapped === 'Y' ? 'N' : 'Y'
    console.error(error)
    alertStore.show('스크랩에 실패했습니다.', 'danger')
  }
}

console.log('project: ', props)
</script>
