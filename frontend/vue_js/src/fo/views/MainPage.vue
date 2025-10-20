<template>
  <div class="main-page">
    <!-- 상단 히어로 섹션 -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="hero-content">
              <h1 class="hero-title">채용사이트 MVC</h1>
              <p class="hero-description">
                프리랜서와 기업을 연결하는 스마트한 플랫폼<br>
                전문적인 프리랜서 서비스를 찾거나, 우수한 인재를 발굴하세요.<br>
                간편한 매칭으로 프로젝트를 성공으로 이끕니다.
              </p>
              <div class="hero-buttons">
                <router-link to="/projectListPage" class="btn btn-primary btn-lg me-3">
                  프로젝트 탐색
                </router-link>
                <router-link to="/map/search" class="btn btn-outline-primary btn-lg me-3">
                  내 주변 공고
                </router-link>
                <router-link 
                  v-if="userStore.userTypeCd === 'C'" 
                  to="/project/post" 
                  class="btn btn-outline-secondary btn-lg"
                >
                  공고 등록
                </router-link>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="프리랜서 작업 이미지" 
                class="img-fluid rounded hero-img"
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 기능 소개 섹션 -->
    <section class="features-section">
      <div class="container">
        <div class="row">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="bi bi-phone"></i>
              </div>
              <h4>전문 프리랜서</h4>
              <p>다양한 분야의 검증된 전문가들이 대기중입니다.</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="bi bi-file-earmark-check"></i>
              </div>
              <h4>검증된 프로필</h4>
              <p>실명 인증과 포트폴리오 검증을 통해 신뢰할 수 있는 프리랜서인 등록됩니다.</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="bi bi-search"></i>
              </div>
              <h4>내 주변 프로젝트</h4>
              <p>진행 중이거나 완료된 프로젝트를 한 눈에 확인하세요.</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="bi bi-calendar-check"></i>
              </div>
              <h4>개인 캘린더</h4>
              <p>스크랩 프로젝트, 지원 프로젝트, 면접 일정을 한눈에 관리할 수 있는 통합 캘린더를 제공합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 인기 프로젝트 섹션 -->
    <section class="popular-projects-section">
      <div class="container">
        <div class="section-header text-center mb-5">
          <h2>인기 프로젝트</h2>
          <p class="text-muted">많은 관심을 받고 있는 프로젝트들을 확인해보세요</p>
        </div>
        
        <!-- 필터 탭 -->
        <div class="filter-tabs mb-4">
          <div class="d-flex justify-content-center">
            <button 
              v-for="tab in filterTabs" 
              :key="tab.key"
              :class="['btn', 'me-2', activeFilter === tab.key ? 'btn-primary' : 'btn-outline-secondary']"
              @click="setActiveFilter(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- 프로젝트 카드 -->
        <div class="row">
          <div 
            v-for="project in popularProjects" 
            :key="project.id" 
            class="col-lg-4 col-md-6 mb-4"
          >
            <div class="project-card card h-100">
              <div class="project-image">
                <img 
                  :src="project.image" 
                  :alt="project.title"
                  class="card-img-top"
                >
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ project.title }}</h5>
                <p class="card-text text-muted">By {{ project.company }}</p>
                <p class="card-text small text-muted">
                  {{ project.location }} / {{ project.experience }} / {{ project.education }} / {{ project.skill }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination-container text-center">
          <nav>
            <ul class="pagination justify-content-center">
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li class="page-item active">
                <a class="page-link" href="#">1</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#">2</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#">3</a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>

    <!-- FAQ 섹션 -->
    <section class="faq-section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="faq-header text-center mb-5">
              <h2>자주 묻는 질문</h2>
              <p class="text-muted">궁금한 점이 있으시면 FAQ를 확인해보세요</p>
            </div>
            
            <div class="accordion" id="faqAccordion">
              <div 
                v-for="(faq, index) in faqList" 
                :key="index"
                class="accordion-item"
              >
                <h2 class="accordion-header" :id="`heading${index}`">
                  <button 
                    class="accordion-button" 
                    :class="{ collapsed: activeFaq !== index }"
                    type="button" 
                    :data-bs-target="`#collapse${index}`"
                    :aria-controls="`collapse${index}`"
                    :aria-expanded="activeFaq === index"
                    @click="toggleFaq(index)"
                  >
                    {{ faq.question }}
                  </button>
                </h2>
                <div 
                  :id="`collapse${index}`"
                  class="accordion-collapse collapse"
                  :class="{ show: activeFaq === index }"
                  :aria-labelledby="`heading${index}`"
                  data-bs-parent="#faqAccordion"
                >
                  <div class="accordion-body">
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
    </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/fo/stores/userStore'

const userStore = useUserStore()

// 필터 탭 데이터
const filterTabs = [
  { key: 'views', label: '조회순' },
  { key: 'scraps', label: '스크랩순' },
  { key: 'applications', label: '지원순' }
]

const activeFilter = ref('views')

// 인기 프로젝트 데이터 (임시)
const popularProjects = ref([
  {
    id: 1,
    title: '회사사이트 리뉴얼 프로젝트 D-5',
    company: 'EST Soft',
    location: '서울',
    experience: '신입',
    education: '학력무관',
    skill: 'JAVA',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    title: '모바일 웹 UI/UX 디자인 D-9',
    company: 'EST Soft',
    location: '서울',
    experience: '경력 2년',
    education: '학력무관',
    skill: 'Figma',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    title: '브랜드 아이덴티티 디자인 D-12',
    company: 'EST Soft',
    location: '서울',
    experience: '신입',
    education: '학력무관',
    skill: 'Illustrator',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
])

// FAQ 데이터
const faqList = ref([
  {
    question: '프리랜서로 등록하려면 어떻게 해야 하나요?',
    answer: '회원가입 후 프로필을 작성하고 포트폴리오를 등록하시면 됩니다. 검증 과정을 거쳐 승인되면 프리랜서로 활동할 수 있습니다.'
  },
  {
    question: '프로젝트 등록 비용이 있나요?',
    answer: '프로젝트 등록은 무료입니다. 성공적인 매칭 후에만 수수료가 발생합니다.'
  },
  {
    question: '거래는 어떻게 진행되나요?',
    answer: '안전한 거래를 위해 에스크로 시스템을 제공합니다. 프로젝트 완료 후 결제가 진행됩니다.'
  },
  {
    question: '분쟁이 발생하면 어떻게 해결하나요?',
    answer: '전담 고객지원팀이 중재하여 공정하게 해결해드립니다.'
  },
  {
    question: '수수료는 얼마인가요?',
    answer: '프로젝트 성공 시 거래 금액의 5% 수수료가 발생합니다.'
  }
])

const activeFaq = ref(0)

const setActiveFilter = (filter) => {
  activeFilter.value = filter
}

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? -1 : index
}
</script>

<style scoped>
.main-page {
  background-color: #f8f9fa;
}

/* 히어로 섹션 */
.hero-section {
  background: #f8f9fa;
  color: #333;
  padding: 80px 0;
  margin-top: -20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  color: #2c3e50;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #6c757d;
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-image img {
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 1px solid #e9ecef;
}

.hero-img {
  max-width: 400px;
  max-height: 300px;
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* 기능 섹션 */
.features-section {
  padding: 80px 0;
  background: white;
  border-top: 1px solid #e9ecef;
}

.feature-card {
  padding: 2rem 1rem;
  height: 100%;
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
  border: 1px solid #e9ecef;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 1rem;
}

.feature-card h4 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* 인기 프로젝트 섹션 */
.popular-projects-section {
  padding: 80px 0;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.filter-tabs .btn {
  border-radius: 25px;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
}

.project-card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.project-image img {
  height: 200px;
  object-fit: cover;
  width: 100%;
}

.project-card .card-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.project-card .card-text {
  margin-bottom: 0.5rem;
}

/* FAQ 섹션 */
.faq-section {
  padding: 80px 0;
  background: white;
  border-top: 1px solid #e9ecef;
}

.faq-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.accordion-item {
  border: 1px solid #e9ecef;
  border-radius: 10px !important;
  margin-bottom: 1rem;
  overflow: hidden;
}

.accordion-button {
  background: white;
  border: none;
  font-weight: 500;
  color: #333;
  padding: 1.25rem;
}

.accordion-button:not(.collapsed) {
  background: #e3f2fd;
  color: #1976d2;
  box-shadow: none;
}

.accordion-button:focus {
  box-shadow: none;
  border: none;
}

.accordion-body {
  padding: 1.25rem;
  background: #f8f9fa;
  color: #666;
  line-height: 1.6;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .hero-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .faq-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 60px 0;
  }
  
  .features-section,
  .popular-projects-section,
  .faq-section {
    padding: 60px 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
}
</style>
