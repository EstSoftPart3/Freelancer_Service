<template>
  <section>
    <CommonPageHeader
      title=""
      strongText="소속 상세 정보"
      :breadcrumbs="[
        { text: 'Home', link: '/' },
        { text: '소속', link: '/affiliation' },
        { text: afltnInfo.companyNm || '상세 정보' },
      ]"
    />
    <div class="container py-4 detail-page">
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">소속 정보를 불러오는 중입니다...</p>
      </div>

      <template v-else>
        <div class="row pt-4 mt-2 mb-5">
          <!-- 우측: 기업 정보 카드 (고정) -->
          <div
            class="col-md-4 order-md-2 mb-4 mb-md-0"
            style="position: sticky; top: 100px; align-self: flex-start"
          >
            <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
              <!-- 기업 이미지 배너 -->
              <div
                class="company-banner d-flex align-items-center justify-content-center"
                style="
                  height: 160px;
                  background: linear-gradient(135deg, #e8f0fe 0%, #f3e8fd 100%);
                "
              >
                <img
                  :src="afltnInfo.profileImg || '/img/logos/Company_logo.png'"
                  @error="$event.target.src = '/img/logos/Company_logo.png'"
                  class="img-fluid"
                  style="max-height: 130px; max-width: 80%; object-fit: contain"
                  alt="기업 이미지"
                />
              </div>

              <div class="card-body p-4">
                <!-- 기업명 + 조회수 -->
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h2 class="fw-bold text-dark mb-0" style="font-size: 1.3rem">
                    {{ afltnInfo.companyNm }}
                  </h2>
                  <span class="text-muted" style="font-size: 0.8rem">
                    <i class="bi bi-eye me-1"></i
                    >{{ afltnInfo.companyViewCnt || 0 }}
                  </span>
                </div>

                <!-- 인사말 추가 -->
                <p
                  class="text-muted mb-3"
                  style="font-size: 0.85rem; line-height: 1.5"
                >
                  {{
                    afltnInfo.companyGreetingTxt &&
                    afltnInfo.companyGreetingTxt.trim() !== ''
                      ? afltnInfo.companyGreetingTxt
                      : '등록된 소개 문구가 없습니다.'
                  }}
                </p>

                <hr class="my-3" />

                <!-- 소속 신청 버튼 -->
                <div class="d-grid">
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="
                      afltnInfo.member || afltnInfo.apply
                        ? 'btn-light disabled'
                        : 'btn-outline-primary'
                    "
                    @click="clickApplication"
                  >
                    {{
                      afltnInfo.member
                        ? '소속 중'
                        : afltnInfo.apply
                          ? '신청 중'
                          : '소속 신청하기'
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 좌측: 상세 정보 + 진행 중인 프로젝트 -->
          <div class="col-md-8 order-md-1">
            <!-- 상세 정보 카드 -->
            <div
              class="card border-0 shadow-sm rounded-4 p-4 mb-4"
              style="background-color: #ffffff"
            >
              <h2
                class="fw-bold mb-4 pb-2 border-bottom"
                style="font-size: 1.1rem; color: #333"
              >
                <i class="bi bi-building me-2 text-primary"></i>상세 정보
              </h2>

              <ul class="list-unstyled detail-info-list mb-0">
                <li class="d-flex align-items-start py-2 border-bottom">
                  <span
                    class="detail-label text-color-primary fw-semibold me-3"
                  >
                    <i class="bi bi-building me-1"></i>기업명
                  </span>
                  <span class="text-dark">{{
                    afltnInfo.companyNm || '-'
                  }}</span>
                </li>
                <li class="d-flex align-items-start py-2 border-bottom">
                  <span
                    class="detail-label text-color-primary fw-semibold me-3"
                  >
                    <i class="bi bi-person me-1"></i>대표자명
                  </span>
                  <span class="text-dark">{{
                    afltnInfo.companyCeoNm || '-'
                  }}</span>
                </li>
                <li class="d-flex align-items-start py-2 border-bottom">
                  <span
                    class="detail-label text-color-primary fw-semibold me-3"
                  >
                    <i class="bi bi-geo-alt me-1"></i>기업 주소
                  </span>
                  <span class="text-dark">{{
                    afltnInfo.address + ' ' + afltnInfo.detailAddress || '-'
                  }}</span>
                </li>
                <li class="d-flex align-items-start py-2 border-bottom">
                  <span
                    class="detail-label text-color-primary fw-semibold me-3"
                  >
                    <i class="bi bi-calendar me-1"></i>개업일자
                  </span>
                  <span class="text-dark">{{
                    afltnInfo.companyOpenDt || '-'
                  }}</span>
                </li>

                <li class="d-flex align-items-start py-2 border-bottom">
                  <span
                    class="detail-label text-color-primary fw-semibold me-3"
                  >
                    <i class="bi bi-card-text me-1"></i>사업자등록번호
                  </span>
                  <span class="text-dark">
                    {{ formatBizNum(afltnInfo.companyBizNum) }}
                  </span>
                </li>
                <li class="d-flex align-items-start py-2 border-bottom">
                  <span
                    class="detail-label text-color-primary fw-semibold me-3"
                  >
                    <i class="bi bi-person-check me-1"></i>모집여부
                  </span>
                  <span class="text-dark">
                    {{ formatRecruitingYn(afltnInfo.companyIsRecruitingYn) }}
                  </span>
                </li>

                <li class="d-flex align-items-start py-2">
                  <span
                    class="detail-label text-color-primary fw-semibold me-3"
                  >
                    <i class="bi bi-link-45deg me-1"></i>기업 URL
                  </span>
                  <a
                    v-if="afltnInfo.companyUrl"
                    :href="afltnInfo.companyUrl"
                    target="_blank"
                    class="text-primary text-decoration-none"
                  >
                    {{ afltnInfo.companyUrl }}
                  </a>
                  <span v-else class="text-dark">-</span>
                </li>
              </ul>
            </div>

            <!-- 진행 중인 프로젝트 카드 -->
            <div
              class="card border-0 shadow-sm rounded-4 p-4"
              style="background-color: #ffffff"
            >
              <h2
                class="fw-bold mb-4 pb-2 border-bottom"
                style="font-size: 1.1rem; color: #333"
              >
                <i class="bi bi-kanban me-2 text-primary"></i>진행 중인 프로젝트
              </h2>

              <!-- 프로젝트 있는 경우 -->
              <div v-if="projectList && projectList.length > 0">
                <div
                  v-for="project in projectList"
                  :key="project.sq"
                  class="project-item p-3 mb-3 rounded-3 border"
                  style="cursor: pointer; transition: all 0.2s ease"
                  @click="goToProject(project)"
                  @mouseenter="
                    $event.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(0,0,0,0.1)'
                  "
                  @mouseleave="$event.currentTarget.style.boxShadow = 'none'"
                >
                  <div
                    class="d-flex justify-content-between align-items-start mb-1"
                  >
                    <h3
                      class="fw-semibold mb-0 text-dark"
                      style="font-size: 0.95rem"
                    >
                      {{ project.projectTtl }}
                    </h3>
                    <span
                      class="badge bg-primary bg-opacity-10 text-white"
                      style="font-size: 0.9rem"
                    >
                      진행 중
                    </span>
                  </div>
                  <p class="text-muted mb-2" style="font-size: 0.82rem">
                    {{
                      project.projectDescriptionTxt ||
                      '프로젝트 설명이 없습니다.'
                    }}
                  </p>
                  <div
                    class="d-flex gap-3 text-muted"
                    style="font-size: 0.78rem"
                  >
                    <span>
                      <i class="bi bi-calendar3 me-1"></i>
                      {{ project.projectStartDt }} ~ {{ project.projectEndDt }}
                    </span>
                    <span v-if="project.projectPreferenceTxt">
                      <i>우대사항 : </i>
                      {{ project.projectPreferenceTxt }}
                    </span>
                    <span v-if="project.projectCandidateCnt != null">
                      <i>지원자 수 : {{ project.projectCandidateCnt }}</i>
                    </span>
                  </div>
                </div>
              </div>

              <!-- 프로젝트 없는 경우 -->
              <div v-else class="text-center py-4">
                <i class="bi bi-inbox text-muted fs-1 mb-2 d-block"></i>
                <p class="text-muted mb-0">진행 중인 프로젝트가 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/axios'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import AffiliationRecruit from '@/fo/components/company/AffiliationRecruit.vue'
import { useModalStore } from '@/fo/stores/modalStore'

const route = useRoute()
const router = useRouter()
const modalStore = useModalStore()

const isLoading = ref(false)
const afltnInfo = ref({})
const projectList = ref([])

const companySq = route.params.company_sq
console.log('companySq:', companySq)

// 더미데이터
const dummyData = {
  affiliation: {
    sq: 15,
    companyNm: '이에스티소프트',
    ceoNm: '홍길동',
    companyAddress: '서울특별시 강남구 테헤란로 123 4층',
    openingDt: '2015-03-01',
    companyUrl: 'https://www.estsoft.ai',
    profileImg: '',
    tags: ['IT', 'AI', '스타트업'],
    greeting: '함께 성장하는 IT 기업입니다.',
    isScrap: false,
    isApply: false,
    viewCnt: 151,
  },
  projects: [
    {
      sq: 1,
      projectTtl: 'AI 기반 고객 서비스 플랫폼 개발',
      projectDetail: '자연어 처리 기술을 활용한 고객 응대 자동화 시스템 구축',
      projectStartDt: '2026-04-01',
      projectEndDt: '2026-09-30',
      projectWorkType: ['재택', '정규직'],
    },
    {
      sq: 2,
      projectTtl: '사내 ERP 시스템 고도화',
      projectDetail: '기존 ERP 시스템의 UI/UX 개선 및 신규 모듈 개발',
      projectStartDt: '2026-03-15',
      projectEndDt: '2026-08-15',
      projectWorkType: ['상주', '계약직'],
    },
  ],
  viewerSq: 1,
}

// 소속 상세 정보 불러오기
const getAfltnDetail = async () => {
  isLoading.value = true
  try {
    const res = await api.$get(`/affiliation/detail/${companySq}`)
    if (res && res.status === 'OK') {
      afltnInfo.value = res.output
      projectList.value = res.output.projects || []
    }
  } catch (error) {
    console.warn('API 호출 실패, 더미데이터 사용:', error)
    afltnInfo.value = dummyData.affiliation
    projectList.value = dummyData.projects
  } finally {
    isLoading.value = false
  }
}

// 사업자등록번호 - 추가
const formatBizNum = (bizNum) => {
  if (!bizNum) return '-'
  const num = bizNum.replace(/[^0-9]/g, '')
  return num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')
}

// 모집여부 한글 변환
const formatRecruitingYn = (yn) => {
  return yn === 'Y' ? '모집 중' : '모집 마감'
}

// 소속 신청하기 모달
const clickApplication = async () => {
  try {
    await api.$patch(`/affiliation/${companySq}/increment-view`)
  } catch (e) {
    // 더미 환경에서는 무시
  }
  modalStore.openModal(AffiliationRecruit, {
    afltnInfo: {
      sq: afltnInfo.value.companySq,
      companyNm: afltnInfo.value.companyNm,
      ceoNm: afltnInfo.value.companyCeoNm,
      openYear: calculateOpenYear(afltnInfo.value.companyOpenDt),
      address: afltnInfo.value.address + ' ' + afltnInfo.value.detailAddress,
      greeting: afltnInfo.value.companyGreetingTxt,
      isApply: afltnInfo.value.isApply,
      tags: afltnInfo.value.tags || [],
    },
    onConfirm: getAfltnDetail,
  })
}

// 개업년수 계산
const calculateOpenYear = (openDt) => {
  if (!openDt) return '-'
  const open = new Date(openDt)
  const now = new Date()
  return Math.floor((now - open) / (1000 * 60 * 60 * 24 * 365))
}

// 프로젝트 상세 이동
const goToProject = (project) => {
  router.push({
    name: 'UserProjectSpec',
    params: { project_sq: project.projectSq },
  })
}

onMounted(() => {
  getAfltnDetail()
})
</script>

<style scoped>
.detail-info-list li {
  line-height: 1.7;
}

.detail-label {
  min-width: 110px;
  flex-shrink: 0;
  font-size: 0.88rem;
}

.bi.bi-heart-fill {
  color: lightgray;
}
.bi.bi-heart-fill.active {
  color: red;
}

.project-item:hover {
  background-color: #f8faff;
}
</style>
