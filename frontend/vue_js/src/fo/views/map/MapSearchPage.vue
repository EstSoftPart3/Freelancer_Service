<template>
  <div>
    <CommonPageHeader
      title=""
      strongText="내 주변 공고 찾기"
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
              <option value="데이터분석가">데이터분석가</option>
              <option value="UI/UX디자이너">UI/UX디자이너</option>
              <option value="기획자">기획자</option>
              <option value="마케터">마케터</option>
              <option value="DevOps">DevOps</option>
              <option value="QA">QA</option>
              <option value="PM">PM</option>
              <option value="데이터엔지니어">데이터엔지니어</option>
              <option value="AI개발자">AI개발자</option>
              <option value="모바일개발자">모바일개발자</option>
              <option value="게임개발자">게임개발자</option>
              <option value="시스템관리자">시스템관리자</option>
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
        
      </div>
      
      <div class="row">
        <!-- 좌측: 프로젝트 리스트 -->
        <div class="col-md-4">
          <div class="project-list-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-color-dark mb-0">
                <i class="bi bi-list-ul me-2"></i>프로젝트 리스트
              </h5>
              <!-- <span class="badge bg-primary">{{ projects.length }}개</span> -->
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
                  <h6 class="card-title mb-2 fw-bold text-color-dark">
                    {{ project.projectTitle }}
                  </h6>
                  
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
                  <p class="card-text text-muted mb-1">
                    <i class="bi bi-geo-alt me-2"></i>
                    {{ project.address }}{{ project.detailAddress ? ' ' + project.detailAddress : '' }}
                  </p>
                  
                  <!-- 거리 정보 -->
                  <p class="card-text text-muted mb-3">
                    <i class="bi bi-rulers me-2"></i>
                    {{ project.distance }}km
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
            
            <!-- 주소 표시 -->
            <div class="current-location mb-3 p-3 bg-light rounded">
              <div class="d-flex align-items-center">
                <!-- <i class="bi bi-geo-alt-fill text-primary me-2 fs-5"></i> -->
                <div>
                  <strong class="text-color-dark">{{ userLocation.address }}</strong>
                  <!-- <br> -->
                  <!-- <small class="text-muted">{{ userLocation.address }}</small> -->
                </div>
              </div>
            </div>
            
            <!-- 지도 영역 -->
            <div class="map-wrapper border rounded position-relative" style="height: 500px; overflow: hidden;">
              <!-- 네이버 지도 이미지 -->
              <img 
                :src="mapImageUrl"
                alt="지도"
                class="w-100 h-100"
                style="object-fit: cover;"
                @load="handleImageLoad"
                @error="handleImageError"
              />
              
              <!-- 줌 컨트롤 -->
              <div class="zoom-controls position-absolute top-0 end-0 m-3">
                <div class="btn-group-vertical" role="group">
                  <button 
                    @click="zoomIn" 
                    class="btn btn-light btn-sm border shadow-sm"
                    :disabled="mapZoom >= 18"
                    title="확대"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                  <button 
                    @click="zoomOut" 
                    class="btn btn-light btn-sm border shadow-sm"
                    :disabled="mapZoom <= 10"
                    title="축소"
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                </div>
              </div>
              
              <!-- 사용자 위치 마커 -->
              <div 
                v-if="userLocation.latitude && userLocation.longitude"
                class="user-marker position-absolute"
                :style="getUserMarkerStyle()"
                title="내 위치"
              >
                <i class="bi bi-geo-alt-fill text-primary fs-4"></i>
              </div>
              
              <!-- 프로젝트 마커들 -->
              <div 
                v-for="project in visibleProjects" 
                :key="project.projectSq"
                class="project-marker position-absolute"
                :style="getProjectMarkerStyle(project)"
                @click="handleMarkerClick(project)"
                :title="project.projectTitle"
              >
                <i class="bi bi-geo-alt-fill text-danger fs-5"></i>
              </div>
              
              <!-- 로딩 중 -->
              <div v-if="!mapImageUrl" class="map-placeholder d-flex justify-content-center align-items-center h-100 bg-light">
                <div class="text-center">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">로딩 중...</span>
                  </div>
                  <p class="mt-2 text-muted">지도 로딩 중...</p>
                </div>
              </div>
            </div>
            
            <!-- 범례 -->
            <div class="map-legend mt-3 p-3 bg-light rounded">
              <div class="d-flex gap-4">
                <div class="d-flex align-items-center">
                  <i class="bi bi-geo-alt-fill text-primary me-2"></i>
                  <small class="text-muted">내 주소</small>
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
        
        <div class="modal-footer d-flex gap-2">
          <button @click="handleProjectClick(selectedProject)" class="btn btn-rounded btn-primary btn-sm flex-fill">
            <i class="bi bi-eye me-1"></i>상세보기
          </button>
          <button @click="handleRouteClick(selectedProject)" class="btn btn-rounded btn-outline-primary btn-sm flex-fill">
            <i class="bi bi-route me-1"></i>경로 안내
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 지도 컨테이너 */
.map-wrapper {
  position: relative;
  background: #f8f9fa;
}

/* 줌 컨트롤 */
.zoom-controls .btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.zoom-controls .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 사용자 마커 */
.user-marker {
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -100%) scale(1); }
  50% { transform: translate(-50%, -100%) scale(1.1); }
  100% { transform: translate(-50%, -100%) scale(1); }
}

/* 프로젝트 마커 */
.project-marker {
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  transition: all 0.2s ease;
}

.project-marker:hover {
  transform: translate(-50%, -100%) scale(1.2);
  z-index: 1001;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.btn-close:hover {
  color: #000;
}

/* 프로젝트 카드 호버 효과 */
.project-cards .card {
  transition: all 0.2s ease;
}

.project-cards .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  /* 인턴 추가 작업: 호버 시 파란 선 제거 */
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .map-wrapper {
    height: 300px !important;
  }
  
  .zoom-controls {
    top: 10px !important;
    right: 10px !important;
  }
  
  .zoom-controls .btn {
    width: 35px;
    height: 35px;
  }
}
</style>

<script setup>
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import { api } from '@/axios.js'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/fo/stores/userStore'
import { navigateByUserTypeAndProjectSq } from '@/fo/router/userTypeRouter.js'

const userStore = useUserStore()
const userType = userStore.getUserType

// 필터 상태
const filters = ref({
  radius: '5',
  jobRole: '',
  keyword: ''
})

// UI 상태
const loading = ref(false)

// 사용자 위치
const userLocation = ref({
  latitude: 37.5665,
  longitude: 126.9780,
  address: '위치 정보를 가져오는 중...'
})

// 사용자 위치 가져오기 함수
const getUserLocation = () => {
  return new Promise((resolve) => {
    // 브라우저가 위치 정보를 지원하지 않는 경우
    if (!navigator.geolocation) {
      console.log('이 브라우저는 위치 정보를 지원하지 않습니다.')
      resolve({
        latitude: 37.5665,
        longitude: 126.9780,
        address: '서울시 중구 (기본값)'
      })
      return
    }
    
    // 사용자 등록 주소 정보 API 호출
    console.log('userStore.userSq:', userStore.userSq)
    console.log('localStorage userSq:', localStorage.getItem('userSq'))
    
    const userId = localStorage.getItem('userSq') || userStore.userSq || 0
    console.log('최종 사용자 ID:', userId, '타입:', typeof userId)
    api.$get(`/map/user-address?userId=${userId}`)
      .then(response => {
        console.log('사용자 주소 정보 조회 성공:', response)
        console.log('response.data:', response.data)
        console.log('response.output:', response.output)
        
        const data = response.data || response.output || response
        
        resolve({
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address
        })
      })
      .catch(error => {
        console.log('사용자 주소 정보 조회 실패:', error)
        // 실패 시 브라우저 위치 정보 사용
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('위치 정보 획득 성공')
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: '현재 위치'
            })
          },
          (error) => {
            console.log('위치 정보 획득 실패:', error.message)
            console.log('기본 위치(서울시청)를 사용합니다.')
            resolve({
              latitude: 37.5665,
              longitude: 126.9780,
              address: '서울시 중구 (기본값)'
            })
          }
        )
      })
  })
}

// 프로젝트 데이터
const projects = ref([])

// 지도 관련 상태
const mapImageUrl = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwN2JmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyekOyduO2UhOyngCDrqZTsl4zsnoE8L3RleHQ+PC9zdmc+')
const mapZoom = ref(13) // 지도 줌 레벨 (10-18) - 5km 반경을 보기 위해 13으로 조정

// 마커 관련 상태
const visibleProjects = ref([]) // 화면에 표시될 프로젝트들
const selectedProject = ref(null) // 선택된 프로젝트

// 필터 함수들
const resetFilters = () => {
  filters.value = {
    radius: '5',
    jobRole: '',
    keyword: ''
  }
  applyFilters()
}

const applyFilters = async () => {
  loading.value = true
  
  try {
    console.log('API 호출 시작')
    
    // 백엔드 API 호출 (사용자 ID 사용)
    const response = await api.$get('/map/search', {
      params: {
        userId: localStorage.getItem('userSq') || userStore.userSq || 0,
        radius: parseFloat(filters.value.radius),
        jobType: filters.value.jobRole || null,
        keyword: filters.value.keyword || null,
        page: 0,
        size: 20
      }
    })
    
    console.log('API 응답 성공')
    console.log('전체 응답 데이터:', response)
    
    // 응답 데이터 저장
    if (response.output) {
      console.log('response.output 있음:', response.output)
      // 백엔드에서 이미 거리 계산된 데이터 그대로 사용
      projects.value = response.output.projects || []
      console.log('프로젝트 개수:', projects.value.length)
      
    } else {
      console.log('response.output 없음, 전체 응답 확인')
      // response.output이 없는 경우 직접 projects 배열 확인
      projects.value = response.projects || []
      console.log('프로젝트 개수 (직접):', projects.value.length)
    }
    
    // 지도 이미지 URL 생성 (무조건 실행)
    console.log('지도 URL 생성 시작')
    const mapUrl = generateMapImageUrl()
    console.log('생성된 지도 URL:', mapUrl)
    mapImageUrl.value = mapUrl
    console.log('mapImageUrl.value 설정 완료:', mapImageUrl.value)
    
    // 화면에 표시될 프로젝트들 업데이트 (필터링 적용)
    updateVisibleProjects()
    
  } catch (error) {
    console.error('API 호출 실패:', error)
    
    // 에러 메시지 표시
    if (error.response) {
      console.error('서버 응답 오류:', error.response.status)
    } else if (error.request) {
      console.error('네트워크 오류: 백엔드 서버를 확인해주세요.')
    } else {
      console.error('요청 설정 오류:', error.message)
    }
    
    // 에러 시 빈 배열
    projects.value = []
    
  } finally {
    loading.value = false
  }
}

// 줌 컨트롤 함수들
const zoomIn = () => {
  if (mapZoom.value < 18) {
    mapZoom.value++
    updateMapImage()
  }
}

const zoomOut = () => {
  if (mapZoom.value > 10) {
    mapZoom.value--
    updateMapImage()
  }
}

// 지도 이미지 업데이트
const updateMapImage = () => {
  mapImageUrl.value = generateMapImageUrl()
}

// 화면에 표시될 프로젝트들 업데이트
const updateVisibleProjects = () => {
  // 현재 필터 조건에 맞는 프로젝트들만 표시
  visibleProjects.value = projects.value.filter(project => {
    // 직무 필터
    if (filters.value.jobRole && project.jobType !== filters.value.jobRole) {
      return false
    }
    
    // 검색어 필터
    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      const titleMatch = project.projectTitle.toLowerCase().includes(keyword)
      const companyMatch = project.companyName.toLowerCase().includes(keyword)
      if (!titleMatch && !companyMatch) {
        return false
      }
    }
    
    return true
  })
  
  console.log('화면에 표시될 프로젝트 개수:', visibleProjects.value.length)
}

// 사용자 마커 스타일 계산
const getUserMarkerStyle = () => {
  if (!userLocation.value.latitude || !userLocation.value.longitude) return {}
  
  // 지도 중심을 기준으로 마커 위치 계산
  return {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -100%)',
    zIndex: 1000
  }
}

// 프로젝트 마커 스타일 계산 (간단하고 정확한 버전)
const getProjectMarkerStyle = (project) => {
  if (!project.latitude || !project.longitude) return {}
  
  const userLat = userLocation.value.latitude
  const userLng = userLocation.value.longitude
  const projectLat = project.latitude
  const projectLng = project.longitude
  
  // 위도/경도 차이 계산
  const latDiff = projectLat - userLat
  const lngDiff = projectLng - userLng
  
  // 간단하고 정확한 픽셀 변환 (실제 테스트 기반)
  const mapWidth = 800
  const mapHeight = 500
  
  // 줌 레벨에 따른 스케일 (실제 네이버 지도 기준)
  const zoomScale = Math.pow(2, mapZoom.value - 16)
  
  // 1도당 픽셀 수 (대폭 증가 - 실제 지도에 맞게 조정)
  const pixelsPerDegree = 50000 * zoomScale
  
  // 지도 중심(50%, 50%) 기준으로 계산
  const x = 50 + (lngDiff * pixelsPerDegree / mapWidth * 100)
  const y = 50 - (latDiff * pixelsPerDegree / mapHeight * 100)
  
  // 디버깅 로그
  console.log(`프로젝트 ${project.projectTitle}:`, {
    userLat, userLng,
    projectLat, projectLng,
    latDiff, lngDiff,
    zoomScale,
    pixelsPerDegree,
    x, y
  })
  
  return {
    left: `${Math.max(5, Math.min(95, x))}%`,
    top: `${Math.max(5, Math.min(95, y))}%`,
    transform: 'translate(-50%, -100%)',
    zIndex: 999
  }
}

// 마커 클릭 핸들러
const handleMarkerClick = (project) => {
  console.log('마커 클릭:', project)
  selectedProject.value = project
}

// 이벤트 핸들러들
const handleProjectClick = (project) => {
  console.log('프로젝트 클릭:', project)
  console.log('userType:', userType)
  console.log('projectSq:', project.projectSq)
  // 사용자 타입에 따라 올바른 상세 페이지로 이동
  navigateByUserTypeAndProjectSq(userType, project.projectSq)
}

const handleRouteClick = (project) => {
  console.log('경로 클릭:', project)
  
  // 네이버 지도 경로 안내 URL 생성
  const naverMapUrl = `https://map.naver.com/index.nhn?slng=${userLocation.value.longitude}&slat=${userLocation.value.latitude}&stext=내위치&elng=${project.longitude}&elat=${project.latitude}&etext=${encodeURIComponent(project.companyName)}&menu=route&pathType=1`
  
  // 새 창으로 열기
  window.open(naverMapUrl, '_blank')
}


// 네이버 지도 URL 생성 (마커 포함)
const generateMapImageUrl = () => {
  console.log('네이버 지도 URL 생성 시작')
  console.log('사용자 위치:', userLocation.value)
  console.log('프로젝트 개수:', projects.value.length)
  
  // 사용자 위치가 없으면 기본 이미지 반환
  if (!userLocation.value.latitude || !userLocation.value.longitude) {
    console.log('사용자 위치 정보 없음')
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwN2JmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyekOyduO2UhOyngCDrqZTsl4zsnoE8L3RleHQ+PC9zdmc+'
  }
  
  const centerLat = userLocation.value.latitude
  const centerLon = userLocation.value.longitude
  
  // 네이버 Static Map API
  const mapUrl = `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=800&height=500&level=${mapZoom.value}`
  
  console.log('네이버 지도 URL:', mapUrl)
  return mapUrl
}


// 중복 호출 방지 플래그
let isInitialized = false

// 이미지 로드 성공 처리
const handleImageLoad = (event) => {
  console.log('✅ 지도 이미지 로드 성공!', event.target.src)
}

// 이미지 오류 처리
const handleImageError = (event) => {
  console.error('❌ 지도 이미지 로드 실패:', event.target.src)
  console.error('오류 상세:', event)
  
  // 오류 시 로컬 SVG로 대체
  const errorSvg = `
    <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#dc3545"/>
      <text x="400" y="250" font-family="Arial" font-size="24" fill="white" text-anchor="middle">❌ 지도 로딩 실패</text>
    </svg>
  `
  event.target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(errorSvg)))}`
}

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  if (isInitialized) {
    console.log('이미 초기화됨, 중복 호출 방지')
    return
  }
  
  console.log('컴포넌트 마운트됨')
  isInitialized = true
  
  // 0. localStorage에서 userSq 복원 (새로고침 대응)
  const storedUserSq = localStorage.getItem('userSq')
  console.log('🔄 localStorage userSq 복원:', storedUserSq)
  if (storedUserSq && !userStore.userSq) {
    console.log('⚠️ userStore가 비어있음, localStorage에서 복원 시도')
    userStore.userSq = storedUserSq
    console.log('✅ userStore.userSq 복원 완료:', userStore.userSq)
  }
  
  // 1. 사용자 위치 가져오기
  userLocation.value = await getUserLocation()
  console.log('사용자 위치:', userLocation.value)
  
  // 2. 첫 검색 실행
  applyFilters()
})
</script>

