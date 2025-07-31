<template lang="">
  <CommonPageHeader
    title=""
    strongText="프로젝트 상세 정보"
    :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '프로젝트' }]"
  />
  <div class="container py-5 detail-list">
    <div class="row pt-4 mt-2 mb-5">
      <!-- 우측: 회사 정보 (고정된 카드) -->
      <div class="col-md-4 order-md-2" style="position: sticky; top: 100px">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <div class="me-4 flex-shrink-0">
                <img
                  src="img/blog/medium/blog-2.jpg"
                  alt="프로젝트 이미지"
                  class="rounded-circle"
                  style="width: 70px; height: 70px; object-fit: cover"
                />
              </div>
              <div>
                <h2 class="text-color-dark font-weight-normal text-5 mb-0">
                  {{ project.projectTtl }}
                </h2>
                <p class="text-muted mb-0">{{ project.companyNm }}</p>
              </div>
            </div>

            <p>{{ project.projectDetail }}</p>

            <div class="card-footer bg-white border-top-0 pt-4">
              <div class="text-start text-2">
                <p class="mb-1 text-color-primary">
                  <strong class="text-color-primary">모집 기간 :</strong>
                  {{ project.projectRecruitStartDt }} ~
                  {{ project.projectRecruitEndDt }}
                </p>
                <p class="mb-1 text-color-primary">
                  <strong class="text-color-primary">인터뷰 기간 :</strong>
                  {{ project.interviewStartDt }} ~ {{ project.interviewEndDt }}
                </p>
                <p class="mb-0 text-color-primary">
                  <strong class="text-color-primary">수행 기간 :</strong>
                  {{ project.projectStartDt }} ~ {{ project.projectEndDt }}
                </p>
              </div>
            </div>

            <hr class="solid my-4" />

            <div class="d-flex justify-content-center align-items-center gap-3">
              <a
                v-if="
                  (project.userRole === 'PERSONAL' ||
                    project.userRole === 'COMPANY_EXTERNAL') &&
                  project.isApplied === 0 &&
                  !isRecruitmentEnded
                "
                @click="openMemberModal"
                href="#"
                class="btn btn-lg btn-rounded btn-primary btn-lg"
              >
                지원하기
              </a>

              <span
                v-else-if="
                  (project.userRole === 'PERSONAL' ||
                    project.userRole === 'COMPANY_EXTERNAL') &&
                  project.isApplied === 1
                "
                class="btn btn-lg btn-rounded btn-primary btn-lg"
              >
                지원 완료
              </span>

              <span
                v-else-if="isRecruitmentEnded"
                class="btn btn-lg btn-rounded btn-light disabled"
              >
                지원 마감
              </span>
              <a
                v-if="project.userRole === 'COMPANY_EXTERNAL'"
                @click="clickScrap"
                href="#"
                class="btn btn-lg btn-rounded d-flex align-items-center gap-2 custom-scrap-btn"
                ><i
                  :class="[
                    'bi',
                    project.isScrap === 1
                      ? 'bi-heart-fill text-danger'
                      : 'bi-heart text-secondary',
                  ]"
                ></i>
                {{ project.isScrap === 1 ? '스크랩 해제' : '스크랩' }}
                {{ scrapCount }}
              </a>
              <a
                v-if="project.userRole === 'COMPANY_AUTHOR'"
                @click="goToProjectPost"
                href="#"
                class="btn btn-lg btn-rounded btn-primary btn-lg"
              >
                수정하기
              </a>
              <a
                v-if="project.userRole === 'COMPANY_AUTHOR'"
                @click="deleteProject"
                href="#"
                class="btn btn-lg btn-rounded btn-light btn-lg"
              >
                삭제하기
              </a>
            </div>
          </div>

          <!-- 조회수 텍스트 (우측 하단으로 배치) -->
          <div class="position-absolute top-0 end-0 p-2">
            <span class="text-grey" style="font-size: 0.8rem"
              >조회수: {{ project.projectViewCnt }}</span
            >
          </div>
        </div>
      </div>

      <!-- 좌측: 지원 자격 (스크롤 없애기) -->
      <div
        class="col-md-8 mb-4 mb-md-0 order-md-1"
        style="
          border: 1px solid #dee2e6;
          border-radius: 10px;
          padding: 24px 32px;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        "
      >
        <h2 class="text-color-dark font-weight-normal text-5 mb-2">
          지원 자격 / 근무 조건
        </h2>

        <ul>
          <li>
            <strong class="text-color-primary">필수 기술 </strong>
            <ul class="ps-4 mb-2">
              <li
                v-for="skillGroup in project.projectRequiredSkills"
                :key="skillGroup.parentSkillTagNm"
              >
                <strong class="text-dark">{{
                  skillGroup.parentSkillTagNm
                }}</strong>
                <ul class="child-skill-list mt-1 ps-3">
                  <li
                    v-for="skill in skillGroup.childSkillTagNms"
                    :key="skill"
                    class="d-flex align-items-center gap-2 mb-1"
                  >
                    <img
                      :src="getSkillIconUrl(skill)"
                      :alt="skill"
                      width="24"
                      height="24"
                      class="me-1"
                    />
                    <span>{{ skill }}</span>
                  </li>
                </ul>
              </li>
            </ul>
          </li>

          <li>
            <strong class="text-color-primary">우대 기술</strong>
            <ul class="ps-4 mb-2">
              <li
                v-for="skillGroup in project.projectPreferredSkills"
                :key="skillGroup.parentSkillTagNm"
                class="mb-2"
              >
                <strong class="text-dark">{{
                  skillGroup.parentSkillTagNm
                }}</strong>
                <ul class="child-skill-list mt-1 ps-3">
                  <li
                    v-for="skill in skillGroup.childSkillTagNms"
                    :key="skill"
                    class="d-flex align-items-center gap-2 mb-1"
                  >
                    <img
                      :src="getSkillIconUrl(skill)"
                      :alt="skill"
                      width="24"
                      height="24"
                      class="me-1"
                    />
                    <span>{{ skill }}</span>
                  </li>
                </ul>
              </li>
            </ul>
          </li>

          <!-- 우대 사항 -->
          <li>
            <strong class="text-color-primary">우대 사항 :</strong>
            {{ project.projectPreferredEtc }}
          </li>

          <!-- 근무 조건 -->
          <li>
            <strong class="text-color-primary">근무 형태 :</strong>
            <span>{{ project.projectWorkType?.join(' / ') }}</span>
          </li>
          <li>
            <strong class="text-color-primary">근무 지역 :</strong>
            {{ project.projectAddress }}
          </li>
          <li>
            <strong class="text-color-primary">단가 :</strong>
            {{ project.projectSalary }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import AffiliationMemberModal from '@/fo/components/company/AffiliationMemberModal.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { useModalStore } from '../../stores/modalStore.js'
import { useAlertStore } from '../../stores/alertStore.js'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import { useRouter, useRoute } from 'vue-router'
import skillIconMap from '@/assets/skillIconMap.js'

import { api } from '@/axios.js'
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()
const alertStore = useAlertStore()

const projectSq = route.params.project_sq

const project = ref([])

const scrapCount = ref('')

onMounted(async () => {
  try {
    // 스크롤 막기
    document.body.style.overflow = 'hidden'

    const projectSq = route.params.project_sq

    const token = getAccessTokenFromCookie()

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }

    const response = await api.$get(`/projects/${projectSq}/details`, config)
    project.value = response.output
    scrapCount.value = response.output.projectScrapCnt
    console.log(project.value)
  } catch (e) {
    console.error('❌ [catch 블록 진입]', e)

    console.error('프로젝트 상세 정보 불러오기 실패', e)

    // message fallback 처리
    let message = '프로젝트 정보를 불러오는 중 오류가 발생했습니다.'

    alertStore.show(message, 'danger')
    router.push({ name: 'ProjectListPage' })
  }
})

const isRecruitmentEnded = computed(() => {
  if (!project.value.projectRecruitEndDt) return false

  const endDate = new Date(project.value.projectRecruitEndDt + 'T23:59:59')
  const now = new Date()

  return endDate < now
})

function getAccessTokenFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

const openMemberModal = () => {
  modalStore.openModal(AffiliationMemberModal, {
    size: 'modal-xl',
  })
}

onBeforeUnmount(() => {
  // 모달 닫히면 스크롤 복구
  document.body.style.overflow = ''
})

const goToProjectPost = (project) => {
  router.push({
    name: 'ProjectPostPageWithId',
    params: {
      project_sq: project.id,
    },
  })
}

const deleteProject = () => {
  modalStore.openModal(CommonConfirmModal, {
    title: '프로젝트 삭제',
    message: '한 번 삭제한 프로젝트는 복구할 수 없습니다. 삭제하시겠습니까?',
    onConfirm: async () => {
      try {
        console.log('삭제 확정됨')
        const res = await api.$delete(`/projects/${projectSq}`, {
          withCredentials: true,
        })
        alertStore.show(res.message || '삭제되었습니다.')
        modalStore.closeModal()
        router.push({ name: 'ProjectListPage' }) // 삭제 후 이동 (예시)
      } catch (error) {
        console.error('삭제 실패:', error)
        alertStore.show('삭제 중 오류가 발생했습니다.', 'danger')
      }
    },
  })
}

const getSkillIconUrl = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const clickScrap = async () => {
  try {
    const hasScrapped = project.value.isScrap === 1
    const response = await api.$post(`/projects/${projectSq}/scraps`, {
      hasScrapped,
      target: '프로젝트',
    })

    if (hasScrapped) {
      alertStore.show('스크랩 해제에 성공하였습니다.')
    } else {
      alertStore.show('스크랩에 성공하였습니다.')
    }

    // 상태를 바꿔줘야 버튼 표시도 바뀜
    project.value.isScrap = hasScrapped ? 0 : 1
    scrapCount.value = response.output
  } catch (error) {
    console.error(error)
    alertStore.show('스크랩에 실패했습니다.', 'danger')
  }
}
</script>
<style scoped>
.child-skill-list {
  list-style: none;
  padding-left: 1rem;
  margin: 0;
}
.child-skill-list li {
  margin-left: 0.5rem; /* 더 명확한 들여쓰기 */
}
.detail-list li {
  margin-bottom: 12px; /* 또는 16px */
  line-height: 1.6; /* 줄 간 여유 */
}
.custom-scrap-btn {
  background-color: #ffffff !important;
  border: 1px solid #dee2e6;
  color: #333;
  transition: none;
}

.custom-scrap-btn:hover,
.custom-scrap-btn:focus,
.custom-scrap-btn:active {
  background-color: #ffffff !important;
  color: #333;
  box-shadow: none;
}
</style>
