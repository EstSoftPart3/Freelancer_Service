<template>
  <div class="row mb-4 position-relative">
    <div class="col">
      <div
        v-for="scout in props.scouts"
        :key="scout.id || scout.userSq"
        class="card position-relative p-4 shadow-sm mb-3"
      >
        <!-- 스크랩 아이콘 (카드 우측 상단 고정) -->
        <div class="position-absolute top-0 end-0 m-3">
          <a
            @click.stop="clickScrap(scout)"
            class="text-decoration-none"
            style="cursor: pointer"
          >
            <i
              :class="[
                'bi',
                scout.hasScrapped === 'Y'
                  ? 'bi-heart-fill text-danger'
                  : 'bi-heart text-muted',
                'fs-4',
              ]"
            ></i>
          </a>
        </div>

        <!-- 카드 본문 -->
        <div class="d-flex flex-row align-items-center">
          <!-- 프로필 이미지 -->
          <div
            class="me-4 flex-shrink-0"
            @click="goToScoutSpec(scout)"
            style="cursor: pointer"
          >
            <img
              :src="scout.userProfileUrl || '/img/avatars/default_avatar.png'"
              alt="프로필 이미지"
              class="rounded-circle"
              style="
                width: 70px;
                height: 70px;
                object-fit: cover;
                background-color: #f8f9fa;
              "
            />
          </div>

          <!-- 텍스트 정보 -->
          <div class="flex-grow-1">
            <!-- 이름 및 구직 상태 뱃지 -->
            <div class="d-flex align-items-center mb-1">
              <h4 class="mb-0 fw-bold me-2">
                <a
                  href="#"
                  @click.prevent="goToScoutSpec(scout)"
                  class="text-dark text-decoration-none"
                >
                  {{ scout.userName || scout.name }}
                </a>
              </h4>
              <span class="badge bg-primary px-2 py-1 fs-6 fw-normal">
                {{ scout.jobStatusNm || '구직중' }}
              </span>
            </div>

            <!-- 경력 정보 -->
            <div class="text-muted fs-6 mb-1">
              <span>경력 : {{ scout.careerYearNm || scout.career || '신입' }}</span>
            </div>

            <!-- 위치 정보 -->
            <div class="text-muted fs-6 mb-2">
              <span class="d-flex align-items-center">
                <i class="bi bi-geo-alt me-1 text-primary"></i>
                {{ scout.address || scout.detailedAddress || '지역 정보 없음' }}
              </span>
            </div>

            <!-- 보유 기술 태그 -->
            <div class="d-flex flex-wrap gap-2 mt-2">
              <button
                v-for="skill in scout.skills"
                :key="typeof skill === 'object' ? skill.id : skill"
                :class="[
                  'btn btn-rounded btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1',
                  props.selectedSkillTags.includes(skill)
                    ? 'btn-primary text-white'
                    : 'btn-light text-dark',
                ]"
                style="border-radius: 20px;"
                @click.stop="emit('click-skill-tag', skill)"
              >
                <img
                  :src="generateIconUrl(typeof skill === 'object' ? skill.name : skill)"
                  width="16"
                  height="16"
                  :alt="typeof skill === 'object' ? skill.name : skill"
                />
                {{ typeof skill === 'object' ? skill.name : skill }}
              </button>
            </div>

            <!-- 하단 우측 조회수 -->
            <div class="text-muted text-end fs-6">
              조회수: {{ scout.viewCnt || 0 }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useAlertStore } from '../../stores/alertStore.js'
import { useRouter } from 'vue-router'
import { api } from '@/axios.js'
import skillIconMap from '@/assets/skillIconMap.js'

const alertStore = useAlertStore()
const router = useRouter()

const props = defineProps({
  scouts: {
    type: Array,
    required: true,
  },
  selectedSkillTags: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['click-skill-tag'])

const goToScoutSpec = (scout) => {
  const userSq = scout.userSq || scout.id
  if (!userSq) return
  router.push(`/scout/${userSq}`)
}

const generateIconUrl = (name) => {
  if (!name) return skillIconMap.default
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const clickScrap = async (scout) => {
  try {
    const isScrapped = scout.hasScrapped === 'Y'
    scout.hasScrapped = isScrapped ? 'N' : 'Y'

    const targetId = scout.userSq || scout.id
    await api.$post(`/scouts/${targetId}/scraps`, {
      withCredentials: true,
      hasScrapped: isScrapped,
      target: '인재',
    })

    alertStore.show(
      isScrapped ? '스크랩 해제에 성공하였습니다.' : '스크랩에 성공하였습니다.',
    )
  } catch (error) {
    scout.hasScrapped = scout.hasScrapped === 'Y' ? 'N' : 'Y'
    console.error(error)
    alertStore.show('스크랩에 실패했습니다.', 'danger')
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.card:hover {
  border-color: #0d6efd;
}
</style>