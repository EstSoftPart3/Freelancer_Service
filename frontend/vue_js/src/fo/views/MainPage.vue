<template>
  <div class="mainPage">
    <section class="bannerCarouselSection">
      <div class="carouselWrapper">
        <button @click="prevSlide" class="carouselArrow leftArrow">
          <i class="bi bi-chevron-left"></i>
        </button>

        <div class="carouselTrack">
          <div
            class="carouselSlide"
            :class="{ active: currentSlide === 0 }"
            @click="goToCalendar"
          >
            <div class="centerTextArea text-center cursor-pointer">
              <h1 class="heroTitle">
                관심있는 프로젝트 공고 일정<br />달력에서 바로 확인하세요
              </h1>
              <p class="heroSubtitle">
                스크랩한 기업 프로젝트의 모집 일정 캘린더에서 한눈에 확인하세요
              </p>
            </div>
          </div>
          <div
            v-for="(banner, index) in banners"
            :key="banner.bannerSq"
            class="carouselSlide carouselSlide--banner"
            :class="{ active: currentSlide === index + 1 }"
            @click="goToBanner(banner)"
          >
            <div class="bannerImageWrap">
              <img
                v-if="banner.displayImageUrl"
                :src="banner.displayImageUrl"
                :alt="`배너 ${banner.bannerSq}`"
                class="bannerImage"
              />
            </div>
          </div>
        </div>

        <button @click="nextSlide" class="carouselArrow rightArrow">
          <i class="bi bi-chevron-right"></i>
        </button>

        <div class="carouselDots">
          <button
            v-for="n in totalSlides"
            :key="n"
            class="dot"
            :class="{ active: currentSlide === n - 1 }"
            @click="moveSlide(n - 1)"
          ></button>
        </div>
      </div>
    </section>

    <section class="popularProjectsSection">
      <div class="sectionInner">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="sectionHeaderLeft">
            <h2 class="mb-0">인기 프로젝트</h2>
            <p class="text-muted">
              많은 관심을 받고 있는 프로젝트들을 확인해보세요
            </p>
          </div>
          <div class="filter-tabs d-flex gap-2">
            <button
              class="btn btn-sm btnRounded"
              :class="
                currentSort === 'views'
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              "
              @click="fetchPopularProjects('views')"
            >
              조회순
            </button>
            <button
              class="btn btn-sm btnRounded"
              :class="
                currentSort === 'scraps'
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              "
              @click="fetchPopularProjects('scraps')"
            >
              스크랩순
            </button>
            <button
              class="btn btn-sm btnRounded"
              :class="
                currentSort === 'apps' ? 'btn-primary' : 'btn-outline-secondary'
              "
              @click="fetchPopularProjects('apps')"
            >
              지원순
            </button>
          </div>
        </div>

        <div class="projectGrid">
          <div
            v-for="project in projects"
            :key="project.projectSq"
            class="projectCard card h-100"
            @click="goToDetailPage(project.projectSq)"
          >
            <div class="card-body">
              <h5 class="card-title text-truncate">{{ project.projectTtl }}</h5>
              <p class="card-text text-muted mb-1">{{ project.companyNm }}</p>
              <p class="card-text small text-muted mb-2">
                {{ project.projectAddress }} / {{ project.projectExperience }}
              </p>

              <div class="projectPrice text-primary mb-3">
                {{ project.formattedSalary }}
              </div>

              <div class="skillSection mt-auto">
                <div
                  v-for="skillGroup in project.projectSkills"
                  :key="skillGroup"
                  class="mb-2"
                >
                  <div class="btn btn-rounded btn-3d btn-light btn-xs mb-2">
                    <div class="skillIconItem" v-tooltip="skillGroup">
                      <img
                        :src="getSkillIconUrl(skillGroup)"
                        :alt="skillGroup"
                        width="22"
                        height="22"
                      />
                      <span class="skillName ms-2">{{ skillGroup }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="faqSection">
      <div class="faqSectionInner">
        <div class="mb-4">
          <h2 class="font-weight-bold">FAQ</h2>
          <p class="text-muted">궁금한 점이 있으시면 FAQ를 확인해보세요</p>
        </div>

        <div class="toggle toggle-primary">
          <section class="toggle" :class="{ active: activeFaq === 0 }">
            <a class="toggle-title" @click.prevent="toggleFaq(0)">
              프로젝트 지원은 어떻게 하나요?
            </a>
            <div class="toggle-content-wrapper" v-show="activeFaq === 0">
              <div class="toggle-content">
                <p>
                  상세보기 페이지에서 지원하기 버튼을 클릭하여 포트폴리오와 함께
                  지원하실 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          <section class="toggle" :class="{ active: activeFaq === 1 }">
            <a class="toggle-title" @click.prevent="toggleFaq(1)">
              회원가입은 필수인가요?
            </a>
            <div class="toggle-content-wrapper" v-show="activeFaq === 1">
              <div class="toggle-content">
                <p>
                  공고 열람은 비회원도 가능하나, 프로젝트 지원 및 스크랩 기능을
                  이용하시려면 회원가입이 필요합니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
    <!-- <PopupModal /> -->
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useUserStore } from '../stores/userStore'
import { api, baseUrl } from '@/axios'
import skillIconMap from '@/assets/skillIconMap.js'
import { navigateByUserTypeAndProjectSq } from '../router/userTypeRouter'
import { useRouter } from 'vue-router'
// import PopupModal from '../components/common/PopupModal.vue'

const userStore = useUserStore()
const userType = userStore.getUserType
const router = useRouter()

const goToCalendar = () => {
  router.push({ name: 'ScheduleCalendar' })
}

const currentSlide = ref(0)
const banners = ref([])
const bannerObjectUrls = ref([])

const totalSlides = computed(() => banners.value.length + 1)

const toApiPath = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.startsWith(baseUrl) ? url.slice(baseUrl.length) : url
  }
  return url.startsWith('/') ? url : `/${url}`
}

const revokeBannerObjectUrls = () => {
  bannerObjectUrls.value.forEach((url) => URL.revokeObjectURL(url))
  bannerObjectUrls.value = []
}

const loadBannerImages = async (list) => {
  revokeBannerObjectUrls()
  const loaded = await Promise.all(
    list.map(async (banner) => {
      const path = toApiPath(banner.bannerImageUrl)
      if (!path) return { ...banner, displayImageUrl: '' }

      try {
        const blob = await api.$getBlob(path)
        const objectUrl = URL.createObjectURL(blob)
        bannerObjectUrls.value.push(objectUrl)
        return { ...banner, displayImageUrl: objectUrl }
      } catch (error) {
        console.error(`배너 이미지 로드 실패 (${banner.bannerSq}):`, error)
        return { ...banner, displayImageUrl: '' }
      }
    }),
  )
  banners.value = loaded
}

const nextSlide = () => {
  const total = totalSlides.value
  if (total <= 1) return
  currentSlide.value = (currentSlide.value + 1) % total
}
const prevSlide = () => {
  const total = totalSlides.value
  if (total <= 1) return
  currentSlide.value = (currentSlide.value - 1 + total) % total
}
const moveSlide = (index) => {
  currentSlide.value = index
}

const incrementBannerClick = async (bannerSq) => {
  try {
    await api.$patch(`/banners/${bannerSq}/increment-click`)
  } catch (error) {
    console.error('배너 클릭 수 반영 실패:', error)
  }
}

const goToBanner = (banner) => {
  void incrementBannerClick(banner.bannerSq)

  const url = banner.bannerLinkUrl
  if (!url || url === '#') return

  if (banner.linkTargetBlankYn === 'Y') {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.location.href = url
    return
  }
  router.push(url.startsWith('/') ? url : `/${url}`)
}

const fetchBannerData = async () => {
  try {
    const res = await api.$get('/banners/active')
    const list = Array.isArray(res.output) ? res.output : []
    await loadBannerImages(list)
    currentSlide.value = 0
  } catch (error) {
    console.error('배너 로드 실패:', error)
    revokeBannerObjectUrls()
    banners.value = []
    currentSlide.value = 0
  }
}

const projects = ref([])
const currentSort = ref('views')

const fetchPopularProjects = async (sortType) => {
  currentSort.value = sortType
  try {
    const response = await api.$get('/projects/popular', {
      params: { sortType },
    })
    // console.log(response)
    projects.value = response
    // console.log(projects.value)
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  }
}

const goToDetailPage = (projectSq) => {
  navigateByUserTypeAndProjectSq(userType, projectSq)
}

// --- 기술 아이콘 로직 ---
const getSkillIconUrl = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

// 3. FAQ 토글 로직
const activeFaq = ref(null) // 기본값 null (모두 닫힘)
const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

onMounted(() => {
  fetchBannerData()
  fetchPopularProjects('views')
})

onUnmounted(() => {
  revokeBannerObjectUrls()
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* 전달해주신 CSS를 표준 클래스로 변환하여 적용 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Pretendard', sans-serif;
}
.mainPage {
  background-color: #f8f9fa;
}

/* 캐러셀 배너 섹션 */
.bannerCarouselSection {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.carouselWrapper {
  position: relative;
  width: 100%;
  height: 64vh;
  overflow: hidden;
}
.carouselTrack {
  position: relative;
  width: 100%;
  height: 100%;
}
.carouselSlide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.6s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 140px;
  background-color: white;
}
.carouselSlide.active {
  opacity: 1;
  visibility: visible;
  z-index: 1;
}

.carouselSlide--banner {
  padding: 0;
  align-items: stretch;
  justify-content: stretch;
  cursor: pointer;
}

.bannerImageWrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bannerImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.heroTitle {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}
.heroSubtitle {
  font-size: 1.1rem;
  color: #6c757d;
  line-height: 1.6;
}

.mapSlideWhite {
  gap: 40px;
}
.leftTextArea {
  flex: 0 0 38%;
  z-index: 5;
}
.miniMapWrapper {
  flex: 1;
  max-width: 1100px;
  background: #e9ecef;
  height: 580px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.carouselArrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}
.leftArrow {
  left: 30px;
}
.rightArrow {
  right: 30px;
}

.carouselDots {
  position: absolute;
  bottom: 30px;
  right: 50px;
  z-index: 10;
  display: flex;
  gap: 12px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #6c757d;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.dot.active {
  background: #6c757d;
  width: 32px;
  border-radius: 6px;
}

.cursor-pointer {
  cursor: pointer;
}

/* 인기 프로젝트 섹션 */
.popularProjectsSection {
  padding: 45px 0 35px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}
.sectionInner {
  padding: 0 140px;
  max-width: 100%;
}
.projectGrid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}
.projectCard {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;
}
.projectCard:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.projectPrice {
  font-size: 1.15rem;
  font-weight: 800;
  background: #f0f7ff;
  padding: 5px 10px;
  border-radius: 6px;
  display: inline-block;
}

.btnRounded {
  border-radius: 50px;
  padding: 0.4rem 1.2rem;
  font-weight: 500;
}

.filter-tabs {
  display: flex;
  gap: 10px; /* 버튼 사이 간격 */
}

.card-title {
  font-weight: 700;
  font-size: 1.1rem;
}
.faqSection {
  padding: 50px 0 40px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.faqSectionInner {
  padding: 0 140px;
}

/* FAQ 섹션 */
/* 
.faqSectionInner {
  padding: 0 140px;
}
.faqItem {
  background: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.faqQuestion {
  width: 100%;
  border: none;
  background: white;
  padding: 1.2rem 1.5rem;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
.faqAnswer {
  padding: 1rem 1.5rem 1.5rem;
  color: #666;
  border-top: 1px solid #f8f9fa;
  line-height: 1.8;
  background-color: #fafafa;
} */

/* 모달 (기본적으로 숨김) */
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modalContent {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
}

@media (max-width: 1200px) {
  .sectionInner,
  .faqSectionInner,
  .carouselSlide {
    padding: 0 40px;
  }
  .projectGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .projectGrid {
    grid-template-columns: repeat(1, 1fr);
  }
  .miniMapWrapper {
    display: none;
  }
  .carouselSlide {
    flex-direction: column;
    text-align: center;
  }
}
</style>
