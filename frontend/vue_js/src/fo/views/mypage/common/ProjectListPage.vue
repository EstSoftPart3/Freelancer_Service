<template>
  <div>
    <CommonPageHeader
      title=""
      strongText="프로젝트 목록"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '프로젝트' }]"
    />
    
    <!-- 탭을 필터 위로 이동 -->
    <div class="container">
      <ul class="nav nav-tabs mb-0 pt-3">
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'list' }"
            @click="activeTab = 'list'"
            style="cursor: pointer;"
          >
            <i class="bi bi-list-ul me-2"></i>리스트
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'map' }"
            @click="activeTab = 'map'"
            style="cursor: pointer;"
          >
            <i class="bi bi-map me-2"></i>지도
          </a>
        </li>
      </ul>
    </div>

    <div class="mb-3"></div>

    <!-- 리스트 탭일 때만 ProjectFilterBar 표시 -->
    <ProjectFilterBar
      v-if="activeTab === 'list'"
      :localFilters="['서울', '부산', '대구']"
      :careerFilters="['신입', '경력']"
      :jobTypeFilters="['백엔드', '프론트엔드', 'PM', '디자이너']"
      @update="updateFilters"
    />
    
    <div class="container py-4">
      <!-- 리스트 탭 내용 -->
      <div v-show="activeTab === 'list'">
        <div class="d-flex justify-content-end mb-3">
          <button class="btn btn-rounded btn-primary me-2" @click="fetchProjects">
            검색
          </button>
          <a
            v-if="userStore.userTypeCd === 'COMPANY'"
            href="/mypage/projectPostPage"
            class="btn btn-rounded btn-light"
            >등록하기</a
          >
        </div>
        <ProjectCardGroup :projects="projects" />
        <div v-if="projects.length === 0" class="text-center text-muted py-5">
          조건에 맞는 프로젝트가 없습니다.
        </div>
        <div>
          <CommonPagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            @update:currentPage="currentPage = $event"
          />
        </div>
      </div>

      <!-- 지도 탭 내용 -->
      <div v-show="activeTab === 'map'">
        <div class="row">
          <div class="col-12">
            <MapComponent 
              ref="mapComponentRef"
              :user-location="mapUserLocation"
              :projects="mapProjects"
              :map-image-url="mapImageUrl"
              :location-type="locationType"
              :current-filters="currentMapFilters"
              :temp-selected-location="tempSelectedLocation"
              @marker-click="handleMapMarkerClick"
              @zoom-change="handleMapZoomChange"
              @location-selected="handleMapLocationSelected"
              @update-map="handleMapUpdate"
              @filter-change="handleMapFilterChange"
              @open-location-modal="handleOpenLocationModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 프로젝트 리스트 모달 (여러 공고) -->
    <div v-if="showProjectListModal" class="modal-overlay" @click="showProjectListModal = false">
      <div class="modal-content" @click.stop style="max-width: 600px;">
        <div class="modal-header">
          <h5 class="modal-title text-color-dark">
            <i class="bi bi-building me-2"></i>
            {{ selectedCompanyProjects[0]?.companyName }} 프로젝트 목록
          </h5>
          <button @click="showProjectListModal = false" class="btn-close">×</button>
        </div>
        
        <div class="modal-body">
          <p class="text-muted mb-3">
            총 {{ selectedCompanyProjects.length }}개의 프로젝트가 있습니다. 원하는 프로젝트를 선택하세요.
          </p>
          
          <!-- 프로젝트 리스트 -->
          <div class="project-list">
            <div 
              v-for="project in selectedCompanyProjects" 
              :key="project.projectSq"
              class="project-item"
              @click="handleSelectProjectFromList(project)"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h6 class="mb-1 fw-bold">{{ project.projectTitle }}</h6>
                  <p class="text-muted mb-1 small">
                    <i class="bi bi-briefcase me-1"></i>{{ project.jobType }}
                  </p>
                  <p class="text-muted mb-0 small">
                    <i class="bi bi-calendar me-1"></i>
                    {{ formatDeadlineWithDate(project.recruitEndDt) }}
                  </p>
                </div>
                <div class="text-end">
                  <span class="badge bg-primary">
                    {{ project.distance }}km
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 지도 마커 클릭 모달 -->
    <div v-if="selectedMapProject" class="modal-overlay" @click="selectedMapProject = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title text-color-dark">
            프로젝트 정보
          </h5>
          <button @click="selectedMapProject = null" class="btn-close"></button>
        </div>
        
        <div class="modal-body">
          <div class="project-info">
            <h6 class="text-color-dark fw-bold">{{ selectedMapProject.projectTitle }}</h6>
            <p class="text-muted mb-1">
              <i class="bi bi-building me-2"></i>{{ selectedMapProject.companyName }}
            </p>
            <p class="text-muted mb-1">
              <i class="bi bi-briefcase me-2"></i>{{ selectedMapProject.jobType }}
            </p>
            <p class="text-muted mb-1">
              <i class="bi bi-geo-alt me-2"></i>{{ selectedMapProject.address }}{{ selectedMapProject.detailAddress ? ' ' + selectedMapProject.detailAddress : '' }}
            </p>
            <p class="text-muted mb-2">
              <i class="bi bi-arrow-right me-2"></i>{{ selectedMapProject.distance }}km
            </p>
            
            <!-- 추가 정보 -->
            <div class="border-top pt-3 mt-3">
              <div class="row">
                <div class="col-6">
                  <small class="text-muted">모집 마감일</small>
                  <div class="fw-bold">{{ formatDeadlineWithDate(selectedMapProject.recruitEndDt) }}</div>
                </div>
                <div class="col-6">
                  <small class="text-muted">급여</small>
                  <div class="fw-bold">{{ formatSalary(selectedMapProject.projectSalary) }}</div>
                </div>
              </div>
              <div class="row mt-2">
                <div class="col-12">
                  <small class="text-muted">작업 기간</small>
                  <div class="fw-bold">{{ getProjectDuration(selectedMapProject.projectStartDt || selectedMapProject.projectStartDate, selectedMapProject.projectEndDt || selectedMapProject.projectEndDate) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer d-flex gap-2 mt-3">
          <button @click="handleMapProjectClick(selectedMapProject)" class="btn btn-rounded btn-primary btn-sm flex-fill">
            <i class="bi bi-eye me-1"></i>상세보기
          </button>
          <button @click="handleMapRouteClick(selectedMapProject)" class="btn btn-rounded btn-primary btn-sm flex-fill">
            <i class="bi bi-route me-1"></i>경로 안내
          </button>
        </div>
      </div>
    </div>

    <!-- 위치 선택 모달 -->
    <LocationSelectModal
      v-if="showLocationModal"
      @close="showLocationModal = false"
      @location-selected="handleMapLocationSelected"
    />
  </div>
</template>
<script setup>
import ProjectFilterBar from '@/fo/components/common/ProjectFilterBar.vue'
import ProjectCardGroup from '@/fo/components/project/ProjectCardGroup.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import { useUserStore } from '@/fo/stores/userStore'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import MapComponent from '@/fo/components/map/MapComponent.vue'
import LocationSelectModal from '@/fo/components/map/LocationSelectModal.vue'
import { useRouter } from 'vue-router'

import { ref, watch, onMounted } from 'vue'
import { api } from '@/axios.js'
import qs from 'qs'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 탭 상태 추가
const activeTab = ref('list')

const filters = ref({
  addressCodeSq: [],
  projectDeveloperGradeCd: [],
  educationCd: [],
  jobRoleCd: [],
  sortBy: 'project_start_dt',
  sortOrder: 'desc',
  searchKeyword: '',
  searchType: '전체',
  size: 5,
  page: 1,
})

const currentPage = ref(1)
const totalPages = ref('')
const projects = ref([])

onMounted(async () => {
  // query parameter에서 tab 확인
  if (route.query.tab === 'map') {
    activeTab.value = 'map'
    // 지도 탭일 경우 지도 데이터 로드
    await initializeMapTab()
  } else {
    fetchProjects()
    console.log('fetchProjects')
  }
})

watch(currentPage, (newPage) => {
  filters.value.page = newPage
  fetchProjects()
})

const fetchProjects = async () => {
  try {
    const params = { ...filters.value }
    const queryString = qs.stringify(params, { arrayFormat: 'repeat' })
    const response = await api.$get(`/projects?${queryString}`)
    projects.value = response.output.projects

    const totalCount = response.output.totalCount ?? 0
    totalPages.value = Math.max(1, Math.ceil(totalCount / filters.value.size))
  } catch (e) {
    console.error('프로젝트 정보 불러오기 실패', e)
  }
}

const updateFilters = (updated) => {
  filters.value = { ...filters.value, ...updated }
  currentPage.value = 1 // 필터 바꾸면 1페이지부터
}

// ========== 지도 탭 관련 기능 ==========

// 지도 관련 상태
const mapUserLocation = ref({
  latitude: null,
  longitude: null,
  address: '위치 정보 로딩 중...'
})

const mapProjects = ref([])
const mapImageUrl = ref('')
const mapZoom = ref(13)
const locationType = ref('address')
const tempSelectedLocation = ref(null)
const currentMapFilters = ref({
  locationType: 'address',
  radius: '5',
  jobRole: '',
  keyword: ''
})
const selectedMapProject = ref(null)
const showLocationModal = ref(false)
const mapComponentRef = ref(null)
const showProjectListModal = ref(false)  // 다중 공고 리스트 모달
const selectedCompanyProjects = ref([])  // 선택된 기업의 프로젝트 목록

// 탭 전환 시 데이터 로드
watch(activeTab, async (newTab) => {
  if (newTab === 'map') {
    console.log('=== 지도 탭 활성화 ===')
    await initializeMapTab()
  } else if (newTab === 'list') {
    console.log('=== 리스트 탭 활성화 ===')
    // 리스트가 비어있으면 프로젝트 목록 로드
    if (projects.value.length === 0) {
      await fetchProjects()
    }
  }
})

// 지도 탭 초기화
const initializeMapTab = async () => {
  try {
    console.log('지도 초기화 시작...')
    const location = await getMapUserLocation()
    console.log('위치 조회 완료:', location)
    
    mapUserLocation.value = location
    
    // 초기 줌 레벨 설정 (기본 반경 5km 기준)
    mapZoom.value = calculateZoomLevel(currentMapFilters.value.radius || '5')
    console.log(`초기 줌 레벨: ${mapZoom.value}`)
    
    mapImageUrl.value = generateMapImageUrl()
    console.log('지도 URL 생성 완료:', mapImageUrl.value)
    
    await fetchMapProjects()
    console.log('프로젝트 조회 완료:', mapProjects.value.length, '개')
  } catch (error) {
    console.error('지도 초기화 실패:', error)
    alert('지도 초기화에 실패했습니다. 페이지를 새로고침해주세요.')
  }
}

// 좌표를 주소로 변환
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    console.log('=== 프론트엔드 좌표 검증 ===')
    console.log('입력된 좌표:', lat, lng)
    console.log('좌표 타입:', typeof lat, typeof lng)
    console.log('좌표 유효성:', !isNaN(lat), !isNaN(lng))
    console.log('=== 지오코딩 API 호출 ===')
    
    // 네이버 지오코딩 API 호출
    const response = await api.$get('/map/naver/geocoding', {
      params: {
        latitude: lat,
        longitude: lng
      }
    })
    
    console.log('=== 지오코딩 API 응답 분석 ===')
    console.log('전체 응답:', response)
    console.log('response.output:', response.output)
    console.log('response.address:', response.address)
    console.log('response.success:', response.success)
    console.log('응답 타입:', typeof response)
    console.log('응답 키들:', Object.keys(response))
    
    // 응답 구조 확인 (output 또는 직접 응답)
    if (response.output && response.output.address) {
      console.log('✅ output.address 사용:', response.output.address)
      console.log('=== 최종 주소 반환 ===')
      console.log('원본 좌표:', lat, lng)
      console.log('변환된 주소:', response.output.address)
      return response.output.address
    } else if (response.address) {
      console.log('✅ 직접 address 사용:', response.address)
      console.log('=== 최종 주소 반환 ===')
      console.log('원본 좌표:', lat, lng)
      console.log('변환된 주소:', response.address)
      return response.address
    } else {
      console.log('❌ 주소 정보 없음, 좌표 표시')
      console.log('=== 좌표 표시로 대체 ===')
      console.log('원본 좌표:', lat, lng)
      return `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`
    }
  } catch (error) {
    console.error('주소 변환 실패:', error)
    return `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`
  }
}

// 사용자 위치 가져오기 (메인페이지와 동일)
const getMapUserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('이 브라우저는 위치 정보를 지원하지 않습니다.')
      resolve({
        latitude: 37.5665,
        longitude: 126.9780,
        address: '서울시 중구 (기본값)'
      })
      return
    }
    
    const userId = localStorage.getItem('userSq') || userStore.userSq || 0
    console.log('사용자 ID로 주소 조회:', userId)
    
    api.$get(`/map/user-address?userId=${userId}`)
      .then(response => {
        console.log('주소 API 응답:', response)
        const data = response.data || response.output || response
        const location = {
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address
        }
        console.log('사용자 등록 주소 사용:', location)
        resolve(location)
      })
      .catch(async (error) => {
        console.log('사용자 주소 정보 조회 실패:', error)
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            
            // 좌표를 주소로 변환
            const address = await getAddressFromCoordinates(lat, lng)
            
            const location = {
              latitude: lat,
              longitude: lng,
              address: address || '현재 위치'
            }
            console.log('현재 위치 사용:', location)
            resolve(location)
          },
          (error) => {
            console.log('위치 정보 획득 실패:', error.message)
            const defaultLocation = {
              latitude: 37.5665,
              longitude: 126.9780,
              address: '서울시 중구 (기본값)'
            }
            console.log('기본 위치 사용:', defaultLocation)
            resolve(defaultLocation)
          }
        )
      })
  })
}

// 반경에 따른 적절한 줌 레벨 계산
const calculateZoomLevel = (radius) => {
  // 반경(km)에 따른 줌 레벨 매핑
  // 네이버 지도: 줌 레벨 10(멀리) ~ 18(가깝게)
  const radiusNum = parseFloat(radius)
  
  if (radiusNum <= 3) return 14      // 3km 이하 → 가까이
  if (radiusNum <= 5) return 13      // 5km → 중간
  if (radiusNum <= 10) return 12     // 10km → 조금 멀리
  if (radiusNum <= 20) return 11     // 20km → 멀리
  return 10                          // 20km 초과 → 매우 멀리
}

// 지도 이미지 URL 생성
const generateMapImageUrl = () => {
  if (!mapUserLocation.value.latitude || !mapUserLocation.value.longitude) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwN2JmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyekOyduO2UhOyngCDrqZTsl4zsnoE8L3RleHQ+PC9zdmc+'
  }
  
  const centerLat = mapUserLocation.value.latitude
  const centerLon = mapUserLocation.value.longitude
  const mapUrl = `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=800&height=500&level=${mapZoom.value}`
  
  return mapUrl
}

// 지도 프로젝트 검색
const fetchMapProjects = async () => {
  try {
    console.log('=== 프로젝트 조회 시작 ===')
    console.log('사용자 위치:', mapUserLocation.value)
    console.log('필터 조건:', currentMapFilters.value)
    
    const params = {
      userId: userStore.userSq || 0,
      latitude: mapUserLocation.value.latitude,
      longitude: mapUserLocation.value.longitude,
      radius: currentMapFilters.value.radius,
      jobType: currentMapFilters.value.jobRole || '',
      searchKeyword: currentMapFilters.value.keyword || '',
      page: 0,
      size: 20
    }
    console.log('API 요청 파라미터:', params)
    
    const response = await api.$get('/map/search', { params })
    console.log('API 응답:', response)
    console.log('response 구조:', Object.keys(response))
    
    // API 응답 구조 확인 후 적절하게 접근
    const projects = response.output?.projects || response.projects || []
    mapProjects.value = projects
    console.log('조회된 프로젝트 수:', mapProjects.value.length)
    console.log('프로젝트 데이터:', mapProjects.value)
    
    // 🔍 프로젝트 상세 정보 출력
    console.log('=== 조회된 프로젝트 상세 ===')
    mapProjects.value.forEach((p, i) => {
      console.log(`${i+1}. [${p.projectSq}] ${p.companyName} - ${p.projectTitle}`)
    })
  } catch (error) {
    console.error('지도 프로젝트 조회 실패:', error)
    console.error('에러 상세:', error.response || error.message)
    mapProjects.value = []
  }
}

// 필터 변경 핸들러
const handleMapFilterChange = async (filters) => {
  try {
    console.log('필터 변경:', filters)
    
    // 현재 필터 상태 저장 (필터 유지용)
    currentMapFilters.value = { ...filters }
    
    // locationType 상태 동기화
    locationType.value = filters.locationType
    
    // 🎯 반경에 따라 줌 레벨 자동 조정
    mapZoom.value = calculateZoomLevel(filters.radius)
    console.log(`📍 반경 ${filters.radius}km → 줌 레벨 ${mapZoom.value}로 자동 조정`)
    
    let searchLat, searchLng
    
    if (filters.locationType === 'address') {
      // 사용자의 등록된 주소로 다시 업데이트
      console.log('=== 내 주소로 변경 ===')
      const userAddress = await getMapUserLocation()
      console.log('사용자 등록 주소 재조회:', userAddress)
      
      mapUserLocation.value = userAddress
      searchLat = userAddress.latitude
      searchLng = userAddress.longitude
      
      // 지도 이미지 업데이트
      mapImageUrl.value = generateMapImageUrl()
      console.log('=== 내 주소로 변경 완료 ===')
    } else if (filters.locationType === 'current') {
      console.log('=== 현재 위치 선택 시작 ===')
      const currentPos = await getCurrentPosition()
      console.log('현재 위치 좌표:', currentPos)
      
      // 좌표를 주소로 변환
      console.log('지오코딩 API 호출 시작...')
      const address = await getAddressFromCoordinates(currentPos.latitude, currentPos.longitude)
      console.log('지오코딩 결과 주소:', address)
      
      // 현재 위치로 mapUserLocation 업데이트
      mapUserLocation.value = {
        latitude: currentPos.latitude,
        longitude: currentPos.longitude,
        address: address
      }
      console.log('mapUserLocation 업데이트:', mapUserLocation.value)
      
      searchLat = currentPos.latitude
      searchLng = currentPos.longitude
      // 지도 이미지 업데이트
      mapImageUrl.value = generateMapImageUrl()
      console.log('=== 현재 위치 선택 완료 ===')
    } else if (filters.locationType === 'custom') {
      // ✅ 임시 저장된 위치가 있으면 이제 실제로 mapUserLocation 업데이트 + 검색
      console.log('=== 위치 선택 모드 ===')
      console.log('tempSelectedLocation.value:', tempSelectedLocation.value)
      
      if (tempSelectedLocation.value) {
        // ✅ 이 시점에 처음으로 mapUserLocation 업데이트 (지도 반영)
        mapUserLocation.value = {
          latitude: tempSelectedLocation.value.latitude,
          longitude: tempSelectedLocation.value.longitude,
          address: tempSelectedLocation.value.address
        }
        
        searchLat = tempSelectedLocation.value.latitude
        searchLng = tempSelectedLocation.value.longitude
        console.log('✅ 선택된 위치로 검색:', tempSelectedLocation.value.address)
        console.log('✅ 검색 좌표 - 위도:', searchLat, '경도:', searchLng)
        
        // 지도 이미지 업데이트
        mapImageUrl.value = generateMapImageUrl()
      } else {
        // ⚠️ 위치가 아직 선택 안 됐으면 검색 안 함
        console.log('⚠️ 위치를 먼저 선택해주세요')
        alert('위치를 먼저 선택해주세요.')
        return
      }
    }
    
    // 백엔드 API 호출
    console.log('=== API 호출 전 검증 ===')
    console.log('필터 타입:', filters.locationType)
    console.log('검색 좌표 - searchLat:', searchLat, 'searchLng:', searchLng)
    console.log('mapUserLocation:', mapUserLocation.value)
    
    const params = {
      userId: userStore.userSq || 0,
      latitude: searchLat,
      longitude: searchLng,
      radius: parseFloat(filters.radius),
      jobType: filters.jobRole || '',
      searchKeyword: filters.keyword || '',
      page: 0,
      size: 20
    }
    console.log('=== 최종 API 요청 파라미터 ===')
    console.log('params:', params)
    console.log('위도:', params.latitude, '경도:', params.longitude, '반경:', params.radius, 'km')
    
    const response = await api.$get('/map/search', { params })
    console.log('=== API 응답 분석 ===')
    console.log('전체 응답:', response)
    
    // 응답 데이터 저장
    const projects = response.output?.projects || response.projects || []
    mapProjects.value = projects
    console.log('조회된 프로젝트 수:', mapProjects.value.length)
    
    // 🔍 프로젝트 상세 정보 출력
    console.log('=== 필터링된 프로젝트 목록 ===')
    mapProjects.value.forEach((p, i) => {
      console.log(`${i+1}. [${p.projectSq}] ${p.companyName} - ${p.projectTitle}`)
    })
    
    // 각 프로젝트의 좌표와 거리 확인
    if (mapProjects.value.length > 0) {
      console.log('=== 프로젝트 좌표 검증 ===')
      mapProjects.value.forEach((proj, idx) => {
        console.log(`프로젝트 ${idx + 1}: ${proj.projectTitle}`)
        console.log(`  - 주소: ${proj.address}`)
        console.log(`  - 좌표: 위도 ${proj.latitude}, 경도 ${proj.longitude}`)
        console.log(`  - 백엔드 계산 거리: ${proj.distance}km`)
        
        // 프론트엔드에서 직접 거리 계산 (검증용)
        const distance = calculateDistance(searchLat, searchLng, proj.latitude, proj.longitude)
        console.log(`  - 프론트 계산 거리: ${distance.toFixed(2)}km`)
        
        if (Math.abs(distance - proj.distance) > 1) {
          console.warn(`  ⚠️ 거리 불일치! 백엔드: ${proj.distance}km, 프론트: ${distance.toFixed(2)}km`)
        }
      })
    }
    
    // 지도 이미지 URL 생성
    mapImageUrl.value = generateMapImageUrl()
    
  } catch (error) {
    console.error('지도 프로젝트 조회 실패:', error)
    console.error('에러 상세:', error.response || error.message)
    mapProjects.value = []
  }
}

// 현재 위치 가져오기
const getCurrentPosition = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      () => {
        alert('위치 정보를 가져올 수 없습니다.')
      }
    )
  })
}

// 위치 선택 모달 핸들러
const handleOpenLocationModal = () => {
  showLocationModal.value = true
}

const handleMapLocationSelected = async (location) => {
  console.log('위치 선택됨:', location)
  
  // 좌표 유효성 검사
  if (!location || isNaN(location.latitude) || isNaN(location.longitude)) {
    alert('유효하지 않은 좌표입니다. 주소를 다시 선택해주세요.')
    return
  }
  
  // ✅ 임시 변수에만 저장! mapUserLocation은 검색 버튼 클릭 시에만 업데이트
  tempSelectedLocation.value = {
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.address
  }
  
  // 현재 필터의 locationType을 'custom'으로 업데이트
  currentMapFilters.value.locationType = 'custom'
  
  // 위치 선택 모달 닫기
  showLocationModal.value = false
  
  console.log('✅ 위치가 임시 저장되었습니다. 검색 버튼을 눌러주세요.')
  
  // 잠시 후 필터 모달 자동으로 열기 (부드러운 전환을 위해 300ms 딜레이)
  setTimeout(() => {
    if (mapComponentRef.value) {
      mapComponentRef.value.openFilterModal()
      console.log('💡 필터를 조정하고 검색 버튼을 클릭하세요!')
    }
  }, 300)
}

// 줌 변경 핸들러
const handleMapZoomChange = (zoom) => {
  mapZoom.value = zoom
  mapImageUrl.value = generateMapImageUrl()
}

// 지도 업데이트 핸들러
const handleMapUpdate = (newLocation) => {
  mapUserLocation.value = newLocation
  mapImageUrl.value = generateMapImageUrl()
}

// 마커 클릭 핸들러
const handleMapMarkerClick = (project) => {
  console.log('=== 마커 클릭 이벤트 ===')
  console.log('클릭한 프로젝트:', project)
  console.log('프로젝트 제목:', project.projectTitle)
  console.log('기업명:', project.companyName)
  console.log('전체 프로젝트 수:', mapProjects.value.length)
  
  // 같은 기업의 프로젝트들 찾기
  const companyProjects = mapProjects.value.filter(
    p => p.companyName === project.companyName
  )
  
  console.log(`${project.companyName} 프로젝트 개수:`, companyProjects.length)
  console.log('같은 기업 프로젝트들:', companyProjects.map(p => p.projectTitle))
  
  if (companyProjects.length === 1) {
    console.log('→ 1개 프로젝트 → 상세 모달 표시')
    // 1개면 바로 상세 모달
    selectedMapProject.value = project
  } else {
    console.log('→ 2개+ 프로젝트 → 리스트 모달 표시')
    // 2개 이상이면 리스트 모달
    selectedCompanyProjects.value = companyProjects
    showProjectListModal.value = true
    console.log('showProjectListModal:', showProjectListModal.value)
    console.log('selectedCompanyProjects:', selectedCompanyProjects.value)
  }
}

// 리스트에서 프로젝트 선택 시
const handleSelectProjectFromList = (project) => {
  showProjectListModal.value = false  // 리스트 모달 닫기
  selectedMapProject.value = project  // 상세 모달 열기
}

// 프로젝트 상세보기
const handleMapProjectClick = (project) => {
  const userType = userStore.userTypeCd === 'COMPANY' ? 'company' : 'user'
  router.push(`/project/spec/${userType}/${project.projectSq}`)
  selectedMapProject.value = null
}

// 경로 안내
const handleMapRouteClick = (project) => {
  console.log('=== 경로 안내 클릭 ===')
  console.log('프로젝트:', project)
  console.log('네이버 맵 URL:', project.naverMapUrl)
  
  if (project.naverMapUrl) {
    console.log('✅ URL 존재 - 새 창 열기:', project.naverMapUrl)
    window.open(project.naverMapUrl, '_blank')
  } else {
    console.error('❌ naverMapUrl이 없습니다!')
  }
  selectedMapProject.value = null
}

// 거리 계산 함수 (Haversine 공식)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 날짜 포맷팅 함수들
const formatDeadlineWithDate = (deadline) => {
  if (!deadline) return '미정'
  const today = new Date()
  const endDate = new Date(deadline)
  const diffTime = endDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const dateStr = endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  
  if (diffDays < 0) return `${dateStr} (마감)`
  if (diffDays === 0) return `${dateStr} (D-0)`
  return `${dateStr} (D-${diffDays})`
}

const formatSalary = (salary) => {
  if (!salary) return '미정'
  return `${salary.toLocaleString()}원`
}

const getProjectDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '미정'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMonths = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30))
  
  const startStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const endStr = end.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  
  return `${startStr} ~ ${endStr} (${diffMonths}개월)`
}
</script>
<style scoped>
/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.project-info h6 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.project-info p {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

/* 프로젝트 리스트 아이템 */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.project-item {
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.project-item:hover {
  border-color: #0d6efd;
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.project-item h6 {
  color: #333;
}

.project-item .badge {
  font-size: 0.85rem;
  padding: 4px 8px;
}
</style>
