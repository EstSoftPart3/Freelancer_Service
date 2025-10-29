<template>
  <div class="map-section">
    <!-- 주소 표시 + 필터 버튼 -->
    <div v-if="showControls" class="current-location mb-3 p-3 bg-light rounded">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <strong class="text-color-dark">{{ userLocation.address }}</strong>
        </div>
        <!-- 필터 버튼 -->
        <button 
          @click="showFilterModal = true" 
          class="btn btn-rounded btn-primary btn-sm d-flex align-items-center"
        >
          <i class="bi bi-funnel me-1"></i>필터
        </button>
      </div>
    </div>
    
    <!-- 지도 영역 -->
    <div class="map-wrapper border rounded position-relative" :style="{ height: mapHeight + 'px', overflow: 'hidden' }">
      <!-- 네이버 지도 이미지 -->
      <img 
        :src="mapImageUrl"
        alt="지도"
        class="w-100 h-100"
        style="object-fit: cover;"
        @load="handleImageLoad"
        @error="handleImageError"
        @click="handleMapClick"
      />
      
      <!-- 줌 컨트롤 -->
      <div v-if="showControls" class="zoom-controls position-absolute top-0 end-0 m-3">
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
        <i class="bi bi-geo-alt-fill text-primary" style="font-size: 10pt;"></i>
      </div>
      
      <!-- 프로젝트 마커들 -->
      <div 
        v-for="project in visibleProjects" 
        :key="project.projectSq"
        class="project-marker-container position-absolute"
        :style="getProjectMarkerStyle(project)"
        @click="handleMarkerClick(project)"
        :title="project.projectTitle"
      >
        <!-- 마커 아이콘 -->
        <i class="bi bi-geo-alt-fill text-danger" style="font-size: 9pt;"></i>
        
           <!-- 줌 레벨 13 이상일 때만 라벨 표시 (5km부터) -->
           <div v-if="mapZoom >= 13" class="marker-label">
             {{ project.projectTitle }}
           </div>
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
    <div v-if="showControls" class="map-legend mt-3 p-4 bg-light rounded">
      <div class="d-flex gap-5">
        <div class="d-flex align-items-center">
          <i class="bi bi-geo-alt-fill text-primary me-2 fs-5"></i>
          <span class="text-muted fw-bold">내 주소</span>
        </div>
        <div class="d-flex align-items-center">
          <i class="bi bi-geo-alt-fill text-danger me-2" style="font-size: 1.1rem;"></i>
          <span class="text-muted fw-bold">프로젝트 위치</span>
        </div>
        <div class="d-flex align-items-center">
          <span class="text-muted fw-bold">{{ showRadiusText ? '주소 5km 내 ' : '' }}총 {{ projects.length }}개 프로젝트</span>
        </div>
      </div>
    </div>

    <!-- 필터 모달 -->
    <div v-if="showFilterModal && showControls" class="modal-overlay" @click="showFilterModal = false">
      <div class="modal-content-large" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title text-color-dark">
            <i class="bi bi-funnel me-2"></i>검색 필터
          </h5>
          <button @click="showFilterModal = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <!-- 필터 컴포넌트를 모달 안에 넣기 -->
          <MapFilterComponent 
            :current-filters="currentFilters"
            :user-location="userLocation"
            :temp-selected-location="tempSelectedLocation"
            @filter-change="handleFilterChange"
            @open-location-modal="handleOpenLocationModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, defineExpose } from 'vue'
import MapFilterComponent from './MapFilterComponent.vue'

const props = defineProps({
  userLocation: {
    type: Object,
    required: true
  },
  projects: {
    type: Array,
    default: () => []
  },
  mapImageUrl: {
    type: String,
    default: ''
  },
  locationType: {
    type: String,
    default: 'address'
  },
  currentFilters: {
    type: Object,
    default: () => ({
      locationType: 'address',
      radius: '5',
      jobRole: '',
      keyword: ''
    })
  },
  tempSelectedLocation: {
    type: Object,
    default: null
  },
  initialZoom: {
    type: Number,
    default: 13
  },
  mapWidth: {
    type: Number,
    default: 800
  },
  mapHeight: {
    type: Number,
    default: 600
  },
  showControls: {
    type: Boolean,
    default: true
  },
  showRadiusText: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['marker-click', 'location-selected', 'update-map', 'filter-change', 'open-location-modal'])

// 필터 모달 상태
const showFilterModal = ref(false)

// 외부에서 필터 모달을 열 수 있도록 메서드 노출
const openFilterModal = () => {
  showFilterModal.value = true
}

// 위치 선택 모달 열기 핸들러
const handleOpenLocationModal = () => {
  showFilterModal.value = false // 필터 모달 먼저 닫기
  emit('open-location-modal') // 부모에게 위치 선택 모달 열기 요청
}

// 부모 컴포넌트에서 접근 가능하도록 expose
defineExpose({
  openFilterModal
})

// 지도 관련 상태
const mapZoom = ref(props.initialZoom) // props에서 초기 줌 레벨 받기

// 마커 관련 상태
const visibleProjects = ref([]) // 화면에 표시될 프로젝트들

// 프로젝트 변경 감지
watch(() => props.projects, (newProjects) => {
  console.log('프로젝트 변경 감지:', newProjects)
  visibleProjects.value = newProjects || []
}, { immediate: true, deep: true })

// 사용자 위치 변경 감지
watch(() => props.userLocation, (newLocation) => {
  if (newLocation) {
    console.log('사용자 위치 변경:', newLocation)
    emit('update-map', newLocation)
  }
}, { deep: true })

// 줌 컨트롤 함수들
const zoomIn = () => {
  if (mapZoom.value < 18) {
    mapZoom.value++
    emit('zoom-change', mapZoom.value)
  }
}

const zoomOut = () => {
  if (mapZoom.value > 10) {
    mapZoom.value--
    emit('zoom-change', mapZoom.value)
  }
}

// 사용자 마커 스타일 계산
const getUserMarkerStyle = () => {
  if (!props.userLocation.latitude || !props.userLocation.longitude) return {}
  
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
  
  const userLat = props.userLocation.latitude
  const userLng = props.userLocation.longitude
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
  
  return {
    left: `${Math.max(5, Math.min(95, x))}%`,
    top: `${Math.max(5, Math.min(95, y))}%`,
    transform: 'translate(-50%, -100%)',
    zIndex: 999
  }
}

// 마커 클릭 핸들러
const handleMarkerClick = (project) => {
  emit('marker-click', project)
}

// 필터 변경 핸들러
const handleFilterChange = (filters) => {
  console.log('필터 변경 (MapComponent):', filters)
  emit('filter-change', filters)
  showFilterModal.value = false // 검색 후 모달 닫기
}

// 이미지 로드 성공 처리
const handleImageLoad = (event) => {
  console.log('✅ 지도 이미지 로드 성공!', event.target.src)
}

// 이미지 오류 처리
const handleImageError = (event) => {
  console.error('❌ 지도 이미지 로드 실패:', event.target.src)
  
  // 오류 시 회색 배경의 로딩 중 SVG로 대체
  const errorSvg = `
    <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e9ecef"/>
      <text x="400" y="250" font-family="Arial" font-size="18" fill="#6c757d" text-anchor="middle">지도를 불러오는 중입니다...</text>
    </svg>
  `
  event.target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(errorSvg)))}`
}

// 지도 클릭 핸들러 (위치 선택은 모달 사용)
const handleMapClick = () => {
  // 위치 선택은 모달을 통해 처리
}
</script>

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

/* 프로젝트 마커 컨테이너 */
.project-marker-container {
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.project-marker-container i {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.project-marker-container:hover i {
  transform: scale(1.2);
}

/* 마커 라벨 */
.marker-label {
  margin-top: 2px;
  padding: 0;
  background: transparent;
  color: #000;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  /* max-width, overflow, ellipsis 제거하여 전체 텍스트 표시 */
  pointer-events: none; /* 라벨은 클릭 이벤트 통과 */
}

/* 호버 시 라벨 강조 */
.project-marker-container:hover .marker-label {
  max-width: none; /* 호버 시 전체 텍스트 보이기 */
  font-weight: 900; /* 호버 시 더 진하게 */
}

.text-color-dark {
  color: #333;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content-large {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 900px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #dee2e6;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
}

.modal-body {
  padding: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6c757d;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  color: #000;
  background: #f8f9fa;
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

  .modal-content-large {
    width: 95%;
    max-height: 90vh;
    padding: 16px;
  }

  .current-location {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 10px;
  }

  .current-location .btn {
    width: 100%;
  }
}
</style>
