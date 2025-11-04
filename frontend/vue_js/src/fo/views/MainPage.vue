<template>
  <div class="main-page">
    <!-- 광고 배너 캐러셀 -->
    <section class="banner-carousel-section">
      <div class="carousel-wrapper">
        
        <!-- 좌측 화살표 -->
        <button class="carousel-arrow left-arrow" @click="goToPrevSlide" aria-label="이전 배너">
          <i class="bi bi-chevron-left"></i>
        </button>
        
        <!-- 슬라이드 영역 -->
        <div class="carousel-track">
          
          <!-- 슬라이드 1: 캘린더 배너 이미지 -->
          <div class="carousel-slide" :class="{ 'active': currentSlideIndex === 0 }">
            <img 
              src="@/assets/banners/main-calendar.png" 
              alt="캘린더 배너" 
              class="banner-image"
            >
          </div>
          
          <!-- 슬라이드 2: 히어로 배너 이미지 + 지도 축소판 -->
          <div class="carousel-slide map-slide-white" :class="{ 'active': currentSlideIndex === 1 }">
            <!-- 좌측 텍스트 영역 -->
            <div class="left-text-area">
              <h1 class="hero-title">
                나와 가까운 일자리,<br>
                지금 바로 찾아드릴게요
              </h1>
              <p class="hero-subtitle">내 위치 반경을 설정해 빠르게 찾기</p>
              <button class="btn btn-rounded btn-primary btn-lg" @click="scrollToMap">
                내 주변 공고
              </button>
            </div>
            
            <!-- 우측에 지도 (항상 표시, 로그인 시 주소/범례 추가) -->
            <div class="mini-map-wrapper">
              <MapComponent 
                :user-location="userLocation"
                :projects="miniMapProjects"
                :map-image-url="miniMapImageUrl"
                :location-type="'address'"
                :current-filters="{ locationType: 'address', radius: '5', jobRole: '', keyword: '' }"
                :temp-selected-location="null"
                :initial-zoom="13"
                :map-width="600"
                :map-height="500"
                :show-controls="isLoggedIn"
                :show-radius-text="isLoggedIn"
                @marker-click="handleMarkerClick"
                @zoom-change="() => {}"
                @location-selected="() => {}"
                @update-map="() => {}"
                @filter-change="() => {}"
                @open-location-modal="() => {}"
              />
            </div>
          </div>
          
        </div>
        
        <!-- 우측 화살표 -->
        <button class="carousel-arrow right-arrow" @click="goToNextSlide" aria-label="다음 배너">
          <i class="bi bi-chevron-right"></i>
        </button>
        
        <!-- 인디케이터 점 -->
        <div class="carousel-dots">
          <button class="dot" :class="{ 'active': currentSlideIndex === 0 }" @click="jumpToSlide(0)"></button>
          <button class="dot" :class="{ 'active': currentSlideIndex === 1 }" @click="jumpToSlide(1)"></button>
        </div>
      </div>
    </section>
    

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
              <i class="bi bi-geo-alt me-2"></i>{{ selectedProject.address }}{{ selectedProject.detailAddress ? ' ' + selectedProject.detailAddress : '' }}
            </p>
            <p class="text-muted mb-2">
              <i class="bi bi-arrow-right me-2"></i>{{ selectedProject.distance }}km
            </p>
            
            <!-- 추가 정보 (깔끔하게) -->
            <div class="border-top pt-3 mt-3">
              <div class="row">
                <div class="col-6">
                  <small class="text-muted">모집 마감일</small>
                  <div class="fw-bold">{{ formatDeadlineWithDate(selectedProject.recruitEndDt) }}</div>
                </div>
                <div class="col-6">
                  <small class="text-muted">급여</small>
                  <div class="fw-bold">{{ formatSalary(selectedProject.projectSalary) }}</div>
                </div>
              </div>
              <div class="row mt-2">
                <div class="col-12">
                  <small class="text-muted">작업 기간</small>
                  <div class="fw-bold">{{ getProjectDuration(selectedProject.projectStartDt || selectedProject.projectStartDate, selectedProject.projectEndDt || selectedProject.projectEndDate) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer d-flex gap-2 mt-3">
          <button @click="handleProjectClick(selectedProject)" class="btn btn-rounded btn-primary btn-sm flex-fill">
            <i class="bi bi-eye me-1"></i>상세보기
          </button>
          <button @click="handleRouteClick(selectedProject)" class="btn btn-rounded btn-outline-primary btn-sm flex-fill">
            <i class="bi bi-route me-1"></i>경로 안내
          </button>
        </div>
      </div>
    </div>

    <!-- 위치 선택 모달 -->
    <LocationSelectModal 
      v-if="showLocationModal"
      @close="showLocationModal = false"
      @location-selected="handleLocationSelected"
    />

    <!-- 인기 프로젝트 섹션 -->
    <section class="popular-projects-section">
      <div class="container">
        <!-- 헤더와 필터를 같은 줄에 배치 -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <!-- 왼쪽: 제목과 소개글 -->
          <div class="section-header-left">
            <h2>인기 프로젝트</h2>
            <p class="text-muted mb-0">많은 관심을 받고 있는 프로젝트들을 확인해보세요</p>
          </div>
          
          <!-- 우측: 필터 탭과 더보기 버튼 -->
          <div class="d-flex align-items-center gap-3">
            <div class="filter-tabs">
              <button 
                v-for="tab in filterTabs" 
                :key="tab.key"
                :class="['btn', 'btn-sm', 'me-2', activeFilter === tab.key ? 'btn-primary' : 'btn-outline-secondary']"
                @click="setActiveFilter(tab.key)"
              >
                {{ tab.label }}
              </button>
            </div>
            <button class="btn btn-outline-primary btn-sm" @click="goToProjectList">
              더보기 <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>

        <!-- 프로젝트 카드 -->
        <div v-if="isLoadingProjects" class="text-center py-5" style="min-height: 300px;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
        </div>
        <div v-else-if="popularProjects.length === 0" class="text-center py-5" style="min-height: 300px;">
          <p class="text-muted">표시할 프로젝트가 없습니다.</p>
        </div>
        <div v-else class="row" style="min-height: 300px;">
          <div 
            v-for="project in displayedProjects" 
            :key="project.projectSq" 
            class="col mb-4"
          >
            <div class="project-card card h-100" @click="handleProjectCardClick(project)" style="cursor: pointer;">
              <div class="card-body">
                <h5 class="card-title">{{ project.projectTtl }}</h5>
                <p class="card-text text-muted">{{ project.companyNm }}</p>
                <p class="card-text small text-muted">
                  {{ project.address }} / {{ project.devGradeNm }} / {{ project.requiredEduLvl }}
                </p>
                <div class="d-flex gap-1 flex-wrap mt-2">
                  <span 
                    v-for="skill in project.reqSkills?.slice(0, 3)" 
                    :key="skill"
                    class="badge bg-primary"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { api } from '@/axios'
import MapComponent from '@/fo/components/map/MapComponent.vue'
import LocationSelectModal from '@/fo/components/map/LocationSelectModal.vue'
import defaultProjectImage from '@/assets/basicProject.png'

const userStore = useUserStore()
const alertStore = useAlertStore()
const router = useRouter()

// MapComponent에 대한 ref (필터 모달 제어용)
const mapComponentRef = ref(null)

// 로그인 여부 확인
const isLoggedIn = computed(() => {
  return userStore.isLoggedIn || !!localStorage.getItem('userSq')
})

// 캐러셀 상태
const currentSlideIndex = ref(0)

// 캐러셀 함수들
const goToNextSlide = () => {
  if (currentSlideIndex.value === 0) {
    currentSlideIndex.value = 1
  } else {
    currentSlideIndex.value = 0
  }
}

const goToPrevSlide = () => {
  if (currentSlideIndex.value === 0) {
    currentSlideIndex.value = 1
  } else {
    currentSlideIndex.value = 0
  }
}

const jumpToSlide = (index) => {
  currentSlideIndex.value = index
}

// 지도 관련 상태
const userLocation = ref({
  latitude: 37.5665,
  longitude: 126.9780,
  address: '위치 정보를 가져오는 중...'
})

const projects = ref([])
const mapImageUrl = ref('')
const mapZoom = ref(13)

// 마커 관련 상태
const selectedProject = ref(null) // 선택된 프로젝트

// 위치 기준 상태
const locationType = ref('address')
const customLocation = ref(null)
const showLocationModal = ref(false)

// 임시로 선택된 위치 (검색 전까지는 지도에 반영 안 함)
const tempSelectedLocation = ref(null)

// 현재 필터 상태 저장 (필터 유지를 위해)
const currentFilters = ref({
  locationType: 'address',
  radius: '5',
  jobRole: '',
  keyword: ''
})

// 미니 지도 관련 상태 (배너용 - 메인 지도와 동일한 위치 사용)
const miniMapProjects = ref([])
const miniMapImageUrl = ref('')

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
    const userId = localStorage.getItem('userSq') || userStore.userSq || 0
    api.$get(`/map/user-address?userId=${userId}`)
      .then(response => {
        const data = response.data || response.output || response
        resolve({
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address
        })
      })
      .catch(async (error) => {
        console.log('사용자 주소 정보 조회 실패:', error)
        // 실패 시 브라우저 위치 정보 사용
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            
            // 좌표를 주소로 변환
            const address = await getAddressFromCoordinates(lat, lng)
            
            resolve({
              latitude: lat,
              longitude: lng,
              address: address || '현재 위치'
            })
          },
          (error) => {
            console.log('위치 정보 획득 실패:', error.message)
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

// 네이버 지도 URL 생성
const generateMapImageUrl = () => {
  if (!userLocation.value.latitude || !userLocation.value.longitude) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwN2JmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyekOyduO2UhOyngCDrqZTsl4zsnoE8L3RleHQ+PC9zdmc+'
  }
  
  const centerLat = userLocation.value.latitude
  const centerLon = userLocation.value.longitude
  
  // 네이버 Static Map API
  const mapUrl = `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=800&height=500&level=${mapZoom.value}`
  
  return mapUrl
}

// 현재 위치 가져오기
const getCurrentPosition = () => {
  return new Promise((resolve) => {
    console.log('=== getCurrentPosition 시작 ===')
    if (!navigator.geolocation) {
      console.log('❌ 브라우저가 위치 정보를 지원하지 않음')
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.')
      return
    }
    
    console.log('📍 위치 정보 요청 중...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ 위치 정보 획득 성공:', position.coords)
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        console.log('반환할 좌표:', coords)
        resolve(coords)
      },
      (error) => {
        console.log('❌ 위치 정보 획득 실패:', error)
        alert('위치 정보를 가져올 수 없습니다.')
      }
    )
  })
}

// 필터 변경 핸들러
const handleFilterChange = async (filters) => {
  try {
    console.log('필터 변경:', filters)
    
    // 현재 필터 상태 저장 (필터 유지용)
    currentFilters.value = { ...filters }
    
    // locationType 상태 동기화
    locationType.value = filters.locationType
    
    let searchLat, searchLng
    
    if (filters.locationType === 'address') {
      searchLat = userLocation.value.latitude
      searchLng = userLocation.value.longitude
    } else if (filters.locationType === 'current') {
      console.log('=== 현재 위치 선택 시작 ===')
      const currentPos = await getCurrentPosition()
      console.log('현재 위치 좌표:', currentPos)
      
      // 좌표를 주소로 변환
      console.log('지오코딩 API 호출 시작...')
      const address = await getAddressFromCoordinates(currentPos.latitude, currentPos.longitude)
      console.log('지오코딩 결과 주소:', address)
      
      // 현재 위치로 userLocation 업데이트
      userLocation.value = {
        latitude: currentPos.latitude,
        longitude: currentPos.longitude,
        address: address
      }
      console.log('userLocation 업데이트:', userLocation.value)
      
      searchLat = currentPos.latitude
      searchLng = currentPos.longitude
      // 지도 이미지 업데이트
      mapImageUrl.value = generateMapImageUrl()
      console.log('=== 현재 위치 선택 완료 ===')
    } else if (filters.locationType === 'custom') {
      // ✅ 임시 저장된 위치가 있으면 이제 실제로 userLocation 업데이트 + 검색
      if (tempSelectedLocation.value) {
        // ✅ 이 시점에 처음으로 userLocation 업데이트 (지도 반영)
        userLocation.value = {
          latitude: tempSelectedLocation.value.latitude,
          longitude: tempSelectedLocation.value.longitude,
          address: tempSelectedLocation.value.address
        }
        
        searchLat = tempSelectedLocation.value.latitude
        searchLng = tempSelectedLocation.value.longitude
        console.log('✅ 선택된 위치로 검색:', tempSelectedLocation.value.address)
        
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
    const response = await api.$get('/map/search', {
      params: {
        userId: localStorage.getItem('userSq') || userStore.userSq || 0,
        latitude: searchLat,
        longitude: searchLng,
        radius: parseFloat(filters.radius),
        jobType: filters.jobRole || null,
        keyword: filters.keyword || null,
        page: 0,
        size: 20
      }
    })
    
    console.log('API 응답:', response)
    
    // 응답 데이터 저장
    if (response.output) {
      projects.value = response.output.projects || []
    } else {
      projects.value = response.projects || []
    }
    
    // 지도 이미지 URL 생성
    mapImageUrl.value = generateMapImageUrl()
    
    console.log('프로젝트 데이터 업데이트:', projects.value)
    
  } catch (error) {
    console.error('API 호출 실패:', error)
    projects.value = []
  }
}

// 마커 클릭 핸들러
const handleMarkerClick = (project) => {
  console.log('마커 클릭:', project)
  selectedProject.value = project
}

// 프로젝트 클릭 핸들러
const handleProjectClick = (project) => {
  console.log('프로젝트 클릭:', project)
  // 사용자 타입에 따라 프로젝트 상세 페이지로 이동
  const userType = userStore.getUserType
  if (userType === 'PERSONAL') {
    router.push(`/project/spec/user/${project.projectSq}`)
  } else if (userType === 'COMPANY') {
    router.push(`/project/spec/company/${project.projectSq}`)
  } else {
    // 비로그인 사용자는 개인용 페이지로 이동
    router.push(`/project/spec/user/${project.projectSq}`)
  }
  selectedProject.value = null
}

// 경로 클릭 핸들러
const handleRouteClick = (project) => {
  console.log('경로 클릭:', project)
  
  // 네이버 지도 경로 안내 URL 생성
  const naverMapUrl = `https://map.naver.com/index.nhn?slng=${userLocation.value.longitude}&slat=${userLocation.value.latitude}&stext=${encodeURIComponent(userLocation.value.address)}&elng=${project.longitude}&elat=${project.latitude}&etext=${encodeURIComponent(project.companyName)}&menu=route&pathType=1`
  
  // 새 창으로 열기
  window.open(naverMapUrl, '_blank')
  selectedProject.value = null
}

// 위치 선택 핸들러
const handleLocationSelected = async (location) => {
  console.log('위치 선택됨:', location)
  
  // 좌표 유효성 검사
  if (isNaN(location.latitude) || isNaN(location.longitude)) {
    alert('유효하지 않은 좌표입니다. 주소를 다시 선택해주세요.')
    return
  }
  
  // ✅ 임시 변수에만 저장! userLocation은 검색 버튼 클릭 시에만 업데이트
  tempSelectedLocation.value = {
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.address
  }
  
  // 새 위치 설정
  customLocation.value = location
  
  // 현재 필터의 locationType을 'custom'으로 업데이트
  currentFilters.value.locationType = 'custom'
  
  // 위치 선택 모달 닫기
  showLocationModal.value = false
  
  console.log('위치가 임시 저장되었습니다. 검색 버튼을 눌러주세요.')
  
  // 잠시 후 필터 모달 자동으로 열기 (부드러운 전환을 위해 300ms 딜레이)
  setTimeout(() => {
    if (mapComponentRef.value) {
      mapComponentRef.value.openFilterModal()
      console.log('💡 필터를 조정하고 검색 버튼을 클릭하세요!')
    }
  }, 300)
  
  // 검색은 하지 않음! userLocation도 업데이트 안 함! 
  // 검색 버튼 클릭 시에만 모든 게 반영됨!
}

// 급여 포맷팅
const formatSalary = (salary) => {
  if (!salary) return '미정'
  return `${salary.toLocaleString()}원`
}

// 모집 마감일 포맷팅 (날짜 + D-XX 형식)
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

// 프로젝트 기간 계산 (날짜 ~ 날짜 (N개월))
const getProjectDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '미정'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMonths = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30))
  
  const startStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const endStr = end.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  
  return `${startStr} ~ ${endStr} (${diffMonths}개월)`
}

// 미니 지도 이미지 URL 생성 (메인 지도와 동일한 위치 사용)
const generateMiniMapImageUrl = () => {
  const centerLat = userLocation.value.latitude
  const centerLon = userLocation.value.longitude
  return `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=600&height=650&level=13`
}

// 미니 지도 데이터 로드 (로그인 여부에 따라 분기)
const loadMiniMapData = async () => {
  // 로그인 여부 확인
  const loggedIn = userStore.isLoggedIn || localStorage.getItem('userSq')
  
  if (!loggedIn) {
    // 로그인 안 되어 있으면 정적 지도만 표시 (마커 없음)
    console.log('비로그인 상태: 정적 지도만 표시')
    miniMapProjects.value = []
    miniMapImageUrl.value = generateMiniMapImageUrl()
    return
  }
  
  // 로그인 되어 있으면 프로젝트 검색
  try {
    const response = await api.$get('/map/search', {
      params: {
        userId: localStorage.getItem('userSq') || userStore.userSq || 0,
        latitude: userLocation.value.latitude,
        longitude: userLocation.value.longitude,
        radius: 5,
        jobType: null,
        keyword: null,
        page: 0,
        size: 20
      }
    })
    
    if (response.output) {
      miniMapProjects.value = response.output.projects || []
    } else {
      miniMapProjects.value = response.projects || []
    }
    
    miniMapImageUrl.value = generateMiniMapImageUrl()
    console.log('미니 지도 데이터 로드 완료:', miniMapProjects.value.length, '개')
  } catch (error) {
    console.error('미니 지도 데이터 로드 실패:', error)
    miniMapProjects.value = []
    miniMapImageUrl.value = generateMiniMapImageUrl()
  }
}

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  // 사용자 위치 가져오기
  userLocation.value = await getUserLocation()
  console.log('사용자 위치:', userLocation.value)
  
  // 초기 지도 이미지 생성
  mapImageUrl.value = generateMapImageUrl()
  
  // 초기 검색 실행
  handleFilterChange({
    locationType: 'address',
    radius: '5',
    jobRole: '',
    keyword: ''
  })
  
  // 미니 지도 데이터 로드 (배너용)
  await loadMiniMapData()
  
  // 인기 프로젝트 데이터 로드
  await loadPopularProjects()
})

// 필터 탭 데이터
const filterTabs = [
  { key: 'views', label: '조회순' },
  { key: 'scraps', label: '스크랩순' },
  { key: 'applications', label: '지원순' }
]

const activeFilter = ref('views')

// 인기 프로젝트 데이터 (API에서 가져옴)
const popularProjects = ref([])
const allPopularProjectsData = ref({
  viewCount: [],
  scrapCount: [],
  applicantCount: []
})

// 페이지네이션 상태 (사용 안 함 - 5개만 표시)
const isLoadingProjects = ref(false)

// 인기 프로젝트 데이터 로드
const loadPopularProjects = async () => {
  try {
    isLoadingProjects.value = true
    const response = await api.$get('/projects/top')
    console.log('인기 프로젝트 API 응답:', response)
    
    // API 응답 데이터 저장
    if (response.output) {
      allPopularProjectsData.value = {
        viewCount: response.output.viewCount || [],
        scrapCount: response.output.scrapCount || [],
        applicantCount: response.output.applicantCount || []
      }
    } else {
      allPopularProjectsData.value = {
        viewCount: response.viewCount || [],
        scrapCount: response.scrapCount || [],
        applicantCount: response.applicantCount || []
      }
    }
    
    console.log('조회순:', allPopularProjectsData.value.viewCount.length, '개')
    console.log('스크랩순:', allPopularProjectsData.value.scrapCount.length, '개')
    console.log('지원순:', allPopularProjectsData.value.applicantCount.length, '개')
    
    // 초기 필터(조회순)에 맞는 데이터 설정
    updatePopularProjects('views')
    
  } catch (error) {
    console.error('인기 프로젝트 로드 실패:', error)
    popularProjects.value = []
  } finally {
    isLoadingProjects.value = false
  }
}

// 필터에 따라 표시할 프로젝트 업데이트
const updatePopularProjects = (filter) => {
  switch(filter) {
    case 'views':
      popularProjects.value = allPopularProjectsData.value.viewCount || []
      break
    case 'scraps':
      popularProjects.value = allPopularProjectsData.value.scrapCount || []
      break
    case 'applications':
      popularProjects.value = allPopularProjectsData.value.applicantCount || []
      break
    default:
      popularProjects.value = allPopularProjectsData.value.viewCount || []
  }
  console.log(`${filter} 필터 선택됨`)
  console.log('표시할 프로젝트 수:', popularProjects.value.length)
  console.log('프로젝트 목록:', popularProjects.value.map(p => ({
    제목: p.projectTtl,
    조회수: p.viewCnt,
    스크랩: p.projectScrapCnt,
    지원자: p.applicantCnt
  })))
}

// 표시할 프로젝트 (최대 5개)
const displayedProjects = computed(() => {
  return popularProjects.value.slice(0, 5)
})

// 프로젝트 카드 클릭 핸들러
const handleProjectCardClick = (project) => {
  console.log('프로젝트 카드 클릭:', project)
  const userType = userStore.getUserType
  if (userType === 'PERSONAL') {
    router.push(`/project/spec/user/${project.projectSq}`)
  } else if (userType === 'COMPANY') {
    router.push(`/project/spec/company/${project.projectSq}`)
  } else {
    // 비로그인 사용자는 개인용 페이지로 이동
    router.push(`/project/spec/user/${project.projectSq}`)
  }
}

// 이미지 로드 실패 시 기본 이미지로 대체
const handleImageError = (event) => {
  event.target.src = defaultProjectImage
}

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
  updatePopularProjects(filter)
}

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? -1 : index
}

// 프로젝트 목록 페이지의 지도 탭으로 이동 (로그인 체크)
const scrollToMap = () => {
  if (!isLoggedIn.value) {
    alertStore.show('로그인이 필요한 서비스입니다.', 'danger')
    router.push('/login')
    return
  }
  router.push({ path: '/project', query: { tab: 'map' } })
}

// 프로젝트 목록 페이지의 리스트 탭으로 이동
const goToProjectList = () => {
  router.push({ path: '/project', query: { tab: 'list' } })
}
</script>

<style scoped>
.main-page {
  background-color: #f8f9fa;
}

/* 지도 검색 히어로 섹션 */
.map-hero-section {
  background: #f8f9fa;
  color: #333;
  padding: 60px 0;
  margin-top: -20px;
  min-height: 80vh;
}

/* 섹션 헤더 */
.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.section-description {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 0;
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

.text-color-dark {
  color: #333;
}

.btn-rounded {
  border-radius: 6px;
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

/* 인기 프로젝트 섹션 */
.popular-projects-section {
  padding: 80px 0;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.section-header-left h2 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.section-header-left p {
  font-size: 1rem;
}

.filter-tabs .btn {
  border-radius: 25px;
  padding: 0.4rem 1.2rem;
  font-weight: 500;
  white-space: nowrap;
}

.popular-projects-section .row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
}

.popular-projects-section .col {
  padding: 0;
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

.project-card .card-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.project-card .card-text {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
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

/* 캐러셀 배너 섹션 */
.banner-carousel-section {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin-bottom: 0;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
}

.carousel-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.6s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
  visibility: visible;
  z-index: 1;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 지도 슬라이드 흰색 배경 */
.map-slide-white {
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 140px;
}

/* 좌측 텍스트 영역 */
.left-text-area {
  flex: 0 0 40%;
  z-index: 5;
  padding-right: 40px;
}

.left-text-area .hero-title {
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.left-text-area .hero-subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.carousel-arrow:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.left-arrow {
  left: 30px;
}

.right-arrow {
  right: 30px;
}

.carousel-dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 12px;
}

.carousel-dots .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-dots .dot.active {
  background: white;
  width: 32px;
  border-radius: 6px;
}

/* 미니 지도 (배너 우측) */
.mini-map-wrapper {
  flex: 0 0 600px;
  z-index: 5;
}

/* 지도 테두리 제거 및 직각으로 */
.mini-map-wrapper :deep(.map-wrapper) {
  border: none !important;
  border-radius: 0 !important;
}

/* 주소 정보 배경 투명 */
.mini-map-wrapper :deep(.current-location) {
  background: transparent !important;
  border: none !important;
  padding: 8px 12px !important;
  margin-bottom: 4px !important;
}

/* 범례 배경 투명 */
.mini-map-wrapper :deep(.map-legend) {
  background: transparent !important;
  border: none !important;
  padding: 8px 12px !important;
  margin-top: 4px !important;
}

/* 미니 지도 줌 컨트롤 숨기기 */
.mini-map-wrapper :deep(.zoom-controls) {
  display: none !important;
}

/* 미니 지도 필터 버튼 숨기기 */
.mini-map-wrapper :deep(.current-location button) {
  display: none !important;
}

/* NAVER 로고 숨기기 */
.mini-map-wrapper :deep(.map-wrapper)::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 5px;
  width: 60px;
  height: 20px;
  background: #f0f0f0;
  z-index: 1000;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .popular-projects-section .row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .carousel-wrapper {
    height: 300px;
  }
  
  .carousel-arrow {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .left-arrow {
    left: 15px;
  }
  
  .right-arrow {
    right: 15px;
  }
  
  .mini-map-wrapper {
    display: none;
  }
  
  .map-slide-white {
    flex-direction: column;
    padding: 40px 20px;
  }
  
  .left-text-area {
    flex: 1;
    padding-right: 0;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .left-text-area .hero-title {
    font-size: 2rem;
  }
  
  .left-text-area .hero-subtitle {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-description {
    font-size: 1rem;
  }
  
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
  
  .section-header-left h2 {
    font-size: 2rem;
  }
  
  .faq-header h2 {
    font-size: 2rem;
  }
  
  .popular-projects-section .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }
  
  .popular-projects-section .row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 60px 0;
  }
  
  .popular-projects-section,
  .faq-section {
    padding: 60px 0;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .popular-projects-section .row {
    grid-template-columns: 1fr;
  }
}
</style>
