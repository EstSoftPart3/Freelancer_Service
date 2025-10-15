<template>
  <div>
    <CommonPageHeader
      title=""
      strongText="내 주변 프로젝트 찾기"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '지도 검색' }]"
    />
    
    <div class="container py-5">
      <!-- 필터 영역 -->
      <div class="filter-section border rounded p-4 mb-4 bg-light">
        <h5 class="mb-3 text-color-dark">
          <i class="bi bi-funnel me-2"></i>검색 조건 설정
        </h5>
        
        <div class="row align-items-center">
          <!-- 반경 필터 -->
          <div class="col-md-2 mb-3">
            <label class="form-label text-color-dark fw-bold">반경</label>
            <select v-model="filters.radius" class="form-select">
              <option value="3">3km</option>
              <option value="5" selected>5km</option>
              <option value="10">10km</option>
              <option value="20">20km</option>
            </select>
          </div>
          
          <!-- 직무 필터 -->
          <div class="col-md-2 mb-3">
            <label class="form-label text-color-dark fw-bold">직무</label>
            <select v-model="filters.jobRole" class="form-select">
              <option value="">전체</option>
              <option value="프론트엔드">프론트엔드</option>
              <option value="백엔드">백엔드</option>
              <option value="DBA">DBA</option>
            </select>
          </div>
          
          <!-- 검색 입력 -->
          <div class="col-md-4 mb-3">
            <label class="form-label text-color-dark fw-bold">검색어</label>
            <input 
              v-model="filters.keyword"
              type="text" 
              class="form-control" 
              placeholder="프로젝트명, 기업명 검색"
            />
          </div>
          
          <!-- 버튼들 -->
          <div class="col-md-4 mb-3">
            <label class="form-label text-color-dark fw-bold">&nbsp;</label>
            <div class="d-flex gap-2">
              <button @click="resetFilters" class="btn btn-rounded btn-outline-secondary">
                <i class="bi bi-arrow-clockwise me-1"></i>초기화
              </button>
              <button @click="applyFilters" class="btn btn-rounded btn-primary">
                <i class="bi bi-search me-1"></i>검색
              </button>
            </div>
          </div>
        </div>
        
        <!-- 현재 설정 표시 -->
        <div class="mt-3">
          <small class="text-muted">
            <i class="bi bi-info-circle me-1"></i>
            현재 설정: 반경 {{ filters.radius }}km 
            <span v-if="filters.jobRole">| 직무: {{ filters.jobRole }}</span>
            <span v-if="filters.keyword">| 검색어: "{{ filters.keyword }}"</span>
          </small>
        </div>
      </div>
      
      <div class="row">
        <!-- 좌측: 프로젝트 리스트 -->
        <div class="col-md-4">
          <div class="project-list-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-color-dark mb-0">
                <i class="bi bi-list-ul me-2"></i>프로젝트 리스트
              </h5>
              <span class="badge bg-primary">{{ projects.length }}개</span>
            </div>
            
            <!-- 로딩 상태 -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="text-muted mt-2">프로젝트를 검색중입니다...</p>
            </div>
            
            <!-- 프로젝트 카드들 -->
            <div v-else class="project-cards" style="max-height: 600px; overflow-y: auto;">
              <div 
                v-for="project in projects" 
                :key="project.projectSq"
                class="card mb-3 shadow-sm"
                style="cursor: pointer; border-left: 3px solid #dee2e6;"
                @click="handleProjectClick(project)"
              >
                <div class="card-body p-3">
                  <!-- 프로젝트 제목 -->
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0 fw-bold text-color-dark">
                      {{ project.projectTitle }}
                    </h6>
                    <span class="badge bg-light text-dark border">
                      {{ project.distance }}km
                    </span>
                  </div>
                  
                  <!-- 회사명 -->
                  <p class="card-text text-muted mb-1">
                    <i class="bi bi-building me-2"></i>
                    {{ project.companyName }}
                  </p>
                  
                  <!-- 직무 -->
                  <p class="card-text text-muted mb-2">
                    <i class="bi bi-briefcase me-2"></i>
                    {{ project.jobType }}
                  </p>
                  
                  <!-- 주소 -->
                  <p class="card-text text-muted mb-3">
                    <i class="bi bi-geo-alt me-2"></i>
                    {{ project.address }}
                  </p>
                  
                  <!-- 버튼들 -->
                  <div class="d-flex gap-2">
                    <button 
                      @click.stop="handleProjectClick(project)"
                      class="btn btn-rounded btn-primary btn-sm flex-fill"
                    >
                      <i class="bi bi-eye me-1"></i>상세보기
                    </button>
                    <button 
                      @click.stop="handleRouteClick(project)"
                      class="btn btn-rounded btn-outline-primary btn-sm flex-fill"
                    >
                      <i class="bi bi-route me-1"></i>경로
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 빈 상태 -->
            <div v-if="!loading && projects.length === 0" class="text-center py-5">
              <i class="bi bi-inbox display-4 text-muted"></i>
              <p class="text-muted mt-2">검색 결과가 없습니다.</p>
              <small class="text-muted">다른 조건으로 검색해보세요.</small>
            </div>
          </div>
        </div>
        
        <!-- 우측: 지도 -->
        <div class="col-md-8">
          <div class="map-section">
            <h5 class="text-color-dark mb-3">
              <i class="bi bi-map me-2"></i>지도
            </h5>
            
            <!-- 현재 위치 표시 -->
            <div class="current-location mb-3 p-3 bg-light rounded">
              <div class="d-flex align-items-center">
                <i class="bi bi-geo-alt-fill text-primary me-2 fs-5"></i>
                <div>
                  <strong class="text-color-dark">현재 위치</strong>
                  <br>
                  <small class="text-muted">{{ userLocation.address }}</small>
                </div>
              </div>
            </div>
            
            <!-- 지도 영역 -->
            <div class="map-wrapper border rounded position-relative" style="height: 500px; overflow: hidden;">
              <!-- 목업 지도 이미지 -->
              <div class="map-placeholder d-flex justify-content-center align-items-center h-100 bg-light">
                <div class="text-center">
                  <i class="bi bi-map display-1 text-muted"></i>
                  <p class="text-muted mt-2">지도가 여기에 표시됩니다</p>
                  <small class="text-muted">(내일 API 연동 예정)</small>
                </div>
              </div>
              
              <!-- 목업 마커들 -->
              <div 
                v-for="(project, index) in projects" 
                :key="project.projectSq"
                class="marker position-absolute"
                :style="getMarkerPosition(index)"
                @click="handleMarkerClick(project)"
                :title="`${project.projectTitle} - ${project.distance}km`"
              >
                <i class="bi bi-geo-alt-fill text-danger fs-4" style="cursor: pointer; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));"></i>
              </div>
            </div>
            
            <!-- 범례 -->
            <div class="map-legend mt-3 p-3 bg-light rounded">
              <div class="d-flex gap-4">
                <div class="d-flex align-items-center">
                  <i class="bi bi-geo-alt-fill text-primary me-2"></i>
                  <small class="text-muted">현재 위치</small>
                </div>
                <div class="d-flex align-items-center">
                  <i class="bi bi-geo-alt-fill text-danger me-2"></i>
                  <small class="text-muted">프로젝트 위치</small>
                </div>
                <div class="d-flex align-items-center">
                  <small class="text-muted">총 {{ projects.length }}개 프로젝트</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 마커 클릭 모달 -->
    <div v-if="selectedProject" class="modal-overlay" @click="selectedProject = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title text-color-dark">
            <i class="bi bi-geo-alt-fill text-primary me-2"></i>
            프로젝트 정보
          </h5>
          <button @click="selectedProject = null" class="btn-close"></button>
        </div>
        
        <div class="modal-body">
          <div class="project-info">
            <h6 class="text-color-dark fw-bold">{{ selectedProject.projectTitle }}</h6>
            <p class="text-muted mb-1">
              <i class="bi bi-building me-2"></i>{{ selectedProject.companyName }}
            </p>
            <p class="text-muted mb-1">
              <i class="bi bi-briefcase me-2"></i>{{ selectedProject.jobType }}
            </p>
            <p class="text-muted mb-1">
              <i class="bi bi-geo-alt me-2"></i>{{ selectedProject.address }}
            </p>
            <p class="text-muted mb-2">
              <i class="bi bi-arrow-right me-2"></i>{{ selectedProject.distance }}km
            </p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="selectedProject = null" class="btn btn-rounded btn-secondary btn-sm">
            닫기
          </button>
          <button @click="handleRouteClick(selectedProject)" class="btn btn-rounded btn-primary btn-sm">
            <i class="bi bi-route me-1"></i>경로 안내
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { ref, onMounted } from 'vue'

// 필터 상태
const filters = ref({
  radius: '5',
  jobRole: '',
  keyword: ''
})

// UI 상태
const loading = ref(false)
const selectedProject = ref(null)

// 사용자 위치 (목업)
const userLocation = ref({
  latitude: 37.5665,
  longitude: 126.9780,
  address: '서울시 중구 (목업 데이터)'
})

// 목업 프로젝트 데이터
const projects = ref([
  {
    projectSq: 1,
    projectTitle: '웹 개발 프로젝트',
    companyName: 'ABC 회사',
    jobType: '프론트엔드',
    address: '서울시 강남구',
    distance: 2.3,
    latitude: 37.5665,
    longitude: 126.9780
  },
  {
    projectSq: 2,
    projectTitle: '모바일 앱 개발',
    companyName: 'XYZ 스타트업',
    jobType: '백엔드',
    address: '서울시 서초구',
    distance: 4.1,
    latitude: 37.5665,
    longitude: 126.9780
  },
  {
    projectSq: 3,
    projectTitle: '데이터베이스 관리',
    companyName: 'DEF 기업',
    jobType: 'DBA',
    address: '서울시 영등포구',
    distance: 5.8,
    latitude: 37.5665,
    longitude: 126.9780
  },
  {
    projectSq: 4,
    projectTitle: 'AI 서비스 개발',
    companyName: 'GHI 테크',
    jobType: '프론트엔드',
    address: '서울시 마포구',
    distance: 3.2,
    latitude: 37.5665,
    longitude: 126.9780
  },
  {
    projectSq: 5,
    projectTitle: '클라우드 인프라 구축',
    companyName: 'JKL 솔루션',
    jobType: '백엔드',
    address: '서울시 송파구',
    distance: 6.5,
    latitude: 37.5665,
    longitude: 126.9780
  }
])

// 필터 함수들
const resetFilters = () => {
  filters.value = {
    radius: '5',
    jobRole: '',
    keyword: ''
  }
  applyFilters()
}

const applyFilters = () => {
  loading.value = true
  
  // 필터링 로직 (목업)
  setTimeout(() => {
    let filteredProjects = [...projects.value]
    
    // 직무 필터
    if (filters.value.jobRole) {
      filteredProjects = filteredProjects.filter(p => p.jobType === filters.value.jobRole)
    }
    
    // 키워드 필터
    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      filteredProjects = filteredProjects.filter(p => 
        p.projectTitle.toLowerCase().includes(keyword) ||
        p.companyName.toLowerCase().includes(keyword)
      )
    }
    
    // 반경 필터 (목업)
    const radius = parseFloat(filters.value.radius)
    filteredProjects = filteredProjects.filter(p => p.distance <= radius)
    
    projects.value = filteredProjects
    loading.value = false
  }, 800)
}

// 이벤트 핸들러들
const handleProjectClick = (project) => {
  console.log('프로젝트 클릭:', project)
  alert(`프로젝트 상세: ${project.projectTitle}\n회사: ${project.companyName}`)
}

const handleRouteClick = (project) => {
  console.log('경로 클릭:', project)
  alert(`네이버 지도에서 경로를 확인하세요!\n목적지: ${project.address}`)
}

const handleMarkerClick = (project) => {
  console.log('마커 클릭:', project)
  selectedProject.value = project
}

// 마커 위치 계산 (목업)
const getMarkerPosition = (index) => {
  const positions = [
    { top: '25%', left: '35%' },
    { top: '45%', left: '65%' },
    { top: '65%', left: '30%' },
    { top: '35%', left: '25%' },
    { top: '55%', left: '75%' }
  ]
  
  const position = positions[index % positions.length]
  return {
    top: position.top,
    left: position.left,
    transform: 'translate(-50%, -50%)',
    zIndex: 10
  }
}

// 컴포넌트 마운트 시 기본 검색 실행
onMounted(() => {
  applyFilters()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.project-info p {
  margin-bottom: 0.25rem;
}

.marker {
  transition: transform 0.2s ease;
}

.marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* 기존 프로젝트 스타일과 일치 */
.text-color-dark {
  color: #2c3e50;
}

.text-color-primary {
  color: #007bff;
}
</style>
