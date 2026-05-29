<template>
  <div class="card position-relative p-4 shadow-sm mb-3 h-100">
    <!-- 스크랩 아이콘 (카드 우측 상단 고정) -->
    <div class="position-absolute top-0 end-0 m-3">
      <a
        @click="clickScrap"
        class="text-decoration-none"
        style="cursor: pointer"
      >
        <i
          :class="[
            'bi',
            hasScrapped === 'Y'
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
        @click="goToProjectSpec"
        style="cursor: pointer"
      >
        <img
          :src="project.companyImageUrl || '/img/logos/Company_logo.png'"
          alt="프로젝트 이미지"
          class="rounded-circle"
          style="
            width: 70px;
            height: 70px;
            object-fit: contain;
            background-color: #f8f9fa;
          "
        />
      </div>

      <!-- 텍스트 정보 -->
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-center">
          <h4 class="mb-0 fw-bold d-flex align-items-center">
            <a
              href="#"
              @click.prevent="goToProjectSpec"
              class="text-dark text-decoration-none"
            >
              {{ project.projectTtl }}
            </a>
            <span
              :class="[
                'btn',
                projectStatus.status === '채용중' ? 'btn-primary' : 'btn-light',
                'btn-sm',
                'ms-3',
              ]"
            >
              {{ projectStatus.status }}
              <span
                v-if="projectStatus.status === '채용중'"
                class="badge bg-white text-primary fw-bold px-2 py-1 ms-2"
              >
                {{ projectStatus.dDay }}
              </span>
            </span>
          </h4>
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <p class="mb-2 text-muted fs-6">
            <i class="bi bi-building text-primary"></i>
            {{ project.companyNm }}
          </p>
        </div>

        <div class="d-flex flex-column text-muted fs-6">
          <div class="d-flex align-items-center flex-wrap gap-2">
            <span
              v-if="project.addressTypeCd === 2701"
              class="d-flex align-items-center"
            >
              <i class="bi bi-geo-alt me-1 text-primary"></i>
              {{ project.detailedAddress }}
              {{ project.detailedAddressDetail }}
            </span>
            <span
              v-else-if="project.addressTypeCd === 2702"
              class="d-flex align-items-center"
            >
              <i class="bi bi-train-front me-1 text-primary"></i>
              {{ project.subwayAddress }}
            </span>

            <span class="text-light-grey">|</span>
            <span>{{ project.devGradeNm }}</span>
            <span class="text-light-grey">|</span>
            <span>{{ project.requiredEduLvl }}</span>
          </div>

          <div class="d-flex align-items-center mt-2">
            <div class="projectPrice text-primary">
              {{ project.formattedSalary }}
            </div>
            <span
              v-if="project.salaryNegotiableYn === 'Y'"
              class="badge badge-outline badge-primary text-1 px-2 py-1"
              style="border-radius: 4px"
            >
              단가협의 가능
            </span>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-3">
          <button
            v-for="skill in project.reqSkills"
            :key="skill"
            :class="[
              'btn btn-rounded btn-3d btn-sm',
              selectedSkillTags.includes(skill) ? 'btn-primary' : 'btn-light',
            ]"
            @click.stop="emit('click-skill-tag', skill)"
          >
            <img
              :src="generateIconUrl(skill)"
              width="16"
              height="16"
              :alt="skill"
            />
            {{ skill }}
          </button>
        </div>
        <div class="text-muted text-end">조회수: {{ project.viewCnt }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref, watch } from 'vue'
import { useAlertStore } from '../../stores/alertStore.js'
import { useUserStore } from '../../stores/userStore.js'
import { navigateByUserTypeAndProjectSq } from '@/fo/router/userTypeRouter.js'
import { api } from '@/axios.js'
import skillIconMap from '@/assets/skillIconMap.js'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  selectedSkillTags: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['click-skill-tag'])

const alertStore = useAlertStore()
const userStore = useUserStore()
const userType = userStore.getUserType

const hasScrapped = ref(props.project.hasScrapped)

watch(
  () => props.project.hasScrapped,
  (value) => {
    hasScrapped.value = value
  },
)

const projectStatus = computed(() => {
  const today = new Date()
  const start = new Date(props.project.recruitStartDt)
  const end = new Date(props.project.recruitEndDt)

  if (today < start) {
    return { status: '채용예정' }
  } else if (today > end) {
    return { status: '채용종료' }
  }

  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
  return { status: '채용중', dDay: `D-${diff}` }
})

const goToProjectSpec = () => {
  navigateByUserTypeAndProjectSq(userType, props.project.projectSq)
}

const generateIconUrl = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const clickScrap = async () => {
  try {
    const isScrapped = hasScrapped.value === 'Y'

    hasScrapped.value = isScrapped ? 'N' : 'Y'

    await api.$post(`/projects/${props.project.projectSq}/scraps`, {
      withCredentials: true,
      hasScrapped: isScrapped,
      target: '프로젝트',
    })

    alertStore.show(
      isScrapped ? '스크랩 해제에 성공하였습니다.' : '스크랩에 성공하였습니다.',
    )
  } catch (error) {
    hasScrapped.value = hasScrapped.value === 'Y' ? 'N' : 'Y'
    console.error(error)
    alertStore.show('스크랩에 실패했습니다.', 'danger')
  }
}
</script>

<style scoped>
.projectPrice {
  font-size: 1.15rem;
  font-weight: 800;
  background: #f0f7ff;
  padding: 5px 10px;
  border-radius: 6px;
  display: inline-block;
}
</style>
