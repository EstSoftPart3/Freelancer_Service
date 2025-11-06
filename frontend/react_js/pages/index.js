import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import MapComponent from '@/components/map/MapComponent'
import LocationSelectModal from '@/components/map/LocationSelectModal'
import styles from './index.module.css'

export default function MainPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const { showAlert } = useAlert()

  // 캐러셀 상태
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // 지도 관련 상태
  const [userLocation, setUserLocation] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    address: '위치 정보를 가져오는 중...'
  })
  const [projects, setProjects] = useState([])
  const [mapImageUrl, setMapImageUrl] = useState('')
  const [mapZoom, setMapZoom] = useState(13)

  // 마커 관련 상태
  const [selectedProject, setSelectedProject] = useState(null)

  // 위치 선택 모달
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locationType, setLocationType] = useState('address')
  const [tempSelectedLocation, setTempSelectedLocation] = useState(null)
  
  // 현재 필터 상태
  const [currentFilters, setCurrentFilters] = useState({
    locationType: 'address',
    radius: '10000', // 초기값: 없음 (전국 전체)
    jobRole: '',
    keyword: ''
  })

  // 미니 지도 관련 상태 (배너용)
  const [miniMapProjects, setMiniMapProjects] = useState([])
  const [miniMapImageUrl, setMiniMapImageUrl] = useState('')
  
  // MapComponent에 대한 ref (필터 모달 제어용)
  const mapComponentRef = useRef(null)

  // 인기 프로젝트 관련 상태
  const filterTabs = [
    { key: 'views', label: '조회순' },
    { key: 'scraps', label: '스크랩순' },
    { key: 'applications', label: '지원순' }
  ]
  const [activeFilter, setActiveFilter] = useState('views')
  const [popularProjects, setPopularProjects] = useState([])
  const [allPopularProjectsData, setAllPopularProjectsData] = useState({
    viewCount: [],
    scrapCount: [],
    applicantCount: []
  })
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  // FAQ 관련 상태
  const [activeFaq, setActiveFaq] = useState(0)
  const faqList = [
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
  ]

  // 기본 이미지
  const defaultProjectImage = '/img/basicProject.png'

  // ============ 캐러셀 함수들 ============
  const goToNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? 1 : 0))
  }

  const goToPrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? 1 : 0))
  }

  const jumpToSlide = (index) => {
    setCurrentSlideIndex(index)
  }

  // ============ 지도 관련 함수들 ============
  // 좌표를 주소로 변환
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      // 네이버 지오코딩 API 호출
      const response = await api.$get('/map/naver/geocoding', {
        params: {
          latitude: lat,
          longitude: lng
        }
      })
      
      // success가 true이고 유효한 주소가 있으면 사용
      if (response.success !== false) {
        if (response.output && response.output.address) {
          return response.output.address
        } else if (response.address && !response.address.includes('위도:') && !response.address.includes('경도:')) {
          return response.address
        }
      }
      
      // 네이버 실패 시 카카오 지오코딩 시도
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        return new Promise((resolve) => {
          const geocoder = new window.kakao.maps.services.Geocoder()
          geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              const address = result[0].address.address_name
              resolve(address)
            } else {
              resolve(null)
            }
          })
        })
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // 사용자 위치 가져오기 함수
  const getUserLocation = useCallback(() => {
    return new Promise((resolve) => {
      // 비로그인 시: 기본 위치만 사용 (GPS 접근 안 함, 주소 정보 없음)
      const userId = localStorage.getItem('userSq') || user?.userSq || 0
      if (!userId || userId === 0 || userId === '0') {
        resolve({
          latitude: 37.5665,
          longitude: 126.9780,
          address: null // 주소 정보 없음 (사용자 마커 표시 안 함)
        })
        return
      }

      // 로그인 시: 사용자 등록 주소 정보 API 호출
      api.$get(`/map/user-address?userId=${userId}`)
        .then(async (response) => {
          const data = response.data || response.output || response
          
          // API에서 반환한 주소를 그대로 사용
          resolve({
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address
          })
        })
        .catch((error) => {
          // 실패 시 기본 위치 사용 (GPS 접근 안 함)
          resolve({
            latitude: 37.5665,
            longitude: 126.9780,
            address: '서울시 중구 (기본값)'
          })
        })
    })
  }, [user?.userSq])

  // 네이버 지도 URL 생성
  const generateMapImageUrl = useCallback(() => {
    if (!userLocation.latitude || !userLocation.longitude) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjcwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwN2JmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyekOyduO2UhOyngCDrqZTsl4zsnoE8L3RleHQ+PC9zdmc+'
    }
    
    const centerLat = userLocation.latitude
    const centerLon = userLocation.longitude
    
    return `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=900&height=700&level=${mapZoom}`
  }, [userLocation, mapZoom])

  // 현재 위치 가져오기
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        alert('이 브라우저는 위치 정보를 지원하지 않습니다.')
        reject(new Error('위치 정보 미지원'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          resolve(coords)
        },
        (error) => {
          alert('위치 정보를 가져올 수 없습니다.')
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0  // 캐시 사용 안 함
        }
      )
    })
  }

  // 필터 변경 핸들러
  const handleFilterChange = async (filters) => {
    try {
      // 현재 필터 상태 저장 (필터 유지용)
      setCurrentFilters({ ...filters })
      
      // locationType 상태 동기화
      setLocationType(filters.locationType)
      
      let searchLat, searchLng
      
      if (filters.locationType === 'address') {
        // 내 주소 선택 시 사용자 주소 재조회
        const userAddress = await getUserLocation()
        
        setUserLocation(userAddress)
        searchLat = userAddress.latitude
        searchLng = userAddress.longitude
      } else if (filters.locationType === 'current') {
        const currentPos = await getCurrentPosition()
        
        // 좌표를 주소로 변환
        const address = await getAddressFromCoordinates(currentPos.latitude, currentPos.longitude)
        
        // 주소 변환 실패 시 기본 텍스트 사용
        const finalAddress = address || '현재 위치'
        
        // 현재 위치로 userLocation 업데이트
        const newLocation = {
          latitude: currentPos.latitude,
          longitude: currentPos.longitude,
          address: finalAddress
        }
        setUserLocation(newLocation)
        
        searchLat = currentPos.latitude
        searchLng = currentPos.longitude
        // 지도 이미지 업데이트
        setMapImageUrl(generateMapImageUrl())
      } else if (filters.locationType === 'custom') {
        // 임시 저장된 위치가 있으면 이제 실제로 userLocation 업데이트 + 검색
        if (tempSelectedLocation) {
          // 이 시점에 처음으로 userLocation 업데이트 (지도 반영)
          const newLocation = {
            latitude: tempSelectedLocation.latitude,
            longitude: tempSelectedLocation.longitude,
            address: tempSelectedLocation.address
          }
          setUserLocation(newLocation)
          
          searchLat = tempSelectedLocation.latitude
          searchLng = tempSelectedLocation.longitude
          
          // 지도 이미지 업데이트
          setMapImageUrl(generateMapImageUrl())
        } else {
          // 위치가 아직 선택 안 됐으면 검색 안 함
          alert('위치를 먼저 선택해주세요.')
          return
        }
      }
      
      // 백엔드 API 호출
      const response = await api.$get('/map/search', {
        params: {
          userId: localStorage.getItem('userSq') || user?.userSq || 0,
          lat: searchLat,
          lon: searchLng,
          radius: parseFloat(filters.radius),
          jobType: filters.jobRole || null,
          keyword: filters.keyword || null,
          page: 0,
          size: 20
        }
      })
      
      // 응답 데이터 저장
      if (response.output) {
        setProjects(response.output.projects || [])
      } else {
        setProjects(response.projects || [])
      }
      
      // 지도 이미지 URL 생성
      setMapImageUrl(generateMapImageUrl())
      
    } catch (error) {
      setProjects([])
    }
  }

  const handleMarkerClick = (project) => {
    console.log('선택된 프로젝트 데이터:', project)
    console.log('address:', project.address)
    console.log('sigungu:', project.sigungu)
    console.log('detailAddress:', project.detailAddress)
    setSelectedProject(project)
  }

  // 프로젝트 클릭 핸들러
  const handleProjectClick = (project) => {
    // 사용자 타입에 따라 프로젝트 상세 페이지로 이동
    const userType = localStorage.getItem('userType') || user?.userType
    if (userType === 'PERSONAL') {
      router.push(`/project/spec/user/${project.projectSq}`)
    } else if (userType === 'COMPANY') {
      router.push(`/project/spec/company/${project.projectSq}`)
    } else {
      // 비로그인 사용자는 개인용 페이지로 이동
      router.push(`/project/spec/user/${project.projectSq}`)
    }
    setSelectedProject(null)
  }

  // 경로 클릭 핸들러
  const handleRouteClick = (project) => {
    // 네이버 지도 경로 안내 URL 생성
    const naverMapUrl = `https://map.naver.com/index.nhn?slng=${userLocation.longitude}&slat=${userLocation.latitude}&stext=${encodeURIComponent(userLocation.address)}&elng=${project.longitude}&elat=${project.latitude}&etext=${encodeURIComponent(project.companyName)}&menu=route&pathType=1`
    
    // 새 창으로 열기
    window.open(naverMapUrl, '_blank')
    setSelectedProject(null)
  }

  // 위치 선택 핸들러
  const handleLocationSelected = async (location) => {
    // 좌표 유효성 검사
    if (isNaN(location.latitude) || isNaN(location.longitude)) {
      alert('유효하지 않은 좌표입니다. 주소를 다시 선택해주세요.')
      return
    }
    
    // 임시 변수에만 저장! userLocation은 검색 버튼 클릭 시에만 업데이트
    setTempSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address
    })
    
    // 현재 필터의 locationType을 'custom'으로 업데이트
    setCurrentFilters(prev => ({ ...prev, locationType: 'custom' }))
    
    // 위치 선택 모달 닫기
    setShowLocationModal(false)
    
    // 잠시 후 필터 모달 자동으로 열기 (부드러운 전환을 위해 300ms 딜레이)
    setTimeout(() => {
      if (mapComponentRef.current) {
        mapComponentRef.current.openFilterModal()
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
    const centerLat = userLocation.latitude
    const centerLon = userLocation.longitude
    return `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=1100&height=580&level=13`
  }

  // 미니 지도 데이터 로드 (로그인 여부에 따라 분기)
  const loadMiniMapData = async () => {
    // 로그인 여부 확인
    const userId = localStorage.getItem('userSq') || user?.userSq || 0
    const loggedIn = userId && userId !== 0
    
    // 미니 지도 이미지 URL 생성
    const centerLat = userLocation.latitude
    const centerLon = userLocation.longitude
    const miniUrl = `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=1100&height=580&level=13`
    setMiniMapImageUrl(miniUrl)
    
    if (!loggedIn) {
      // 로그인 안 되어 있으면 정적 지도만 표시 (마커 없음)
      setMiniMapProjects([])
      return
    }
    
  // 로그인 되어 있으면 프로젝트 검색
  try {
    const response = await api.$get('/map/search', {
      params: {
        userId: userId,
        // 메인 페이지는 항상 내 주소 기준이므로 userId만 전달 (lat/lon 불필요)
        radius: 10000,
        jobType: null,
        keyword: null,
        page: 0,
        size: 1000
      }
    })
      
      if (response.output) {
        setMiniMapProjects(response.output.projects || [])
      } else {
        setMiniMapProjects(response.projects || [])
      }
      
    } catch (error) {
      setMiniMapProjects([])
    }
  }

  // ============ 인기 프로젝트 관련 함수들 ============
  // 인기 프로젝트 데이터 로드
  const loadPopularProjects = async () => {
    try {
      setIsLoadingProjects(true)
      const response = await api.$get('/projects/top')
      
      // API 응답 데이터 저장
      let newData = {
        viewCount: [],
        scrapCount: [],
        applicantCount: []
      }
      
      if (response.output) {
        newData = {
          viewCount: response.output.viewCount || [],
          scrapCount: response.output.scrapCount || [],
          applicantCount: response.output.applicantCount || []
        }
      } else {
        newData = {
          viewCount: response.viewCount || [],
          scrapCount: response.scrapCount || [],
          applicantCount: response.applicantCount || []
        }
      }
      
      setAllPopularProjectsData(newData)
      
      // 초기 필터(조회순)에 맞는 데이터 설정
      setPopularProjects(newData.viewCount || [])
      
    } catch (error) {
      setPopularProjects([])
    } finally {
      setIsLoadingProjects(false)
    }
  }

  // 필터에 따라 표시할 프로젝트 업데이트
  const updatePopularProjects = (filter) => {
    let selectedData = []
    
    switch(filter) {
      case 'views':
        selectedData = allPopularProjectsData.viewCount || []
        break
      case 'scraps':
        selectedData = allPopularProjectsData.scrapCount || []
        break
      case 'applications':
        selectedData = allPopularProjectsData.applicantCount || []
        break
      default:
        selectedData = allPopularProjectsData.viewCount || []
    }
    
    setPopularProjects(selectedData)
  }

  // 표시할 프로젝트 (최대 5개)
  const displayedProjects = popularProjects.slice(0, 5)

  // 프로젝트 카드 클릭 핸들러
  const handleProjectCardClick = (project) => {
    const userType = localStorage.getItem('userType') || user?.userType
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

  // ============ FAQ 관련 함수들 ============
  const setActiveFilterHandler = (filter) => {
    setActiveFilter(filter)
    updatePopularProjects(filter)
  }

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? -1 : index)
  }

  // 프로젝트 목록 페이지의 지도 탭으로 이동 (로그인 체크)
  const scrollToMap = () => {
    if (!isLoggedIn) {
      showAlert('로그인이 필요한 서비스입니다.', 'danger')
      router.push('/auth/login')
      return
    }
    router.push({ pathname: '/project/projectList', query: { tab: 'map' } })
  }

  // 프로젝트 목록 페이지의 리스트 탭으로 이동
  const goToProjectList = () => {
    router.push({ pathname: '/project/projectList', query: { tab: 'list' } })
  }

  // ============ 초기화 ============
  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    let isInitialized = false
    
    const initData = async () => {
      if (isInitialized) return
      isInitialized = true
      
      // 사용자 위치 가져오기
      const location = await getUserLocation()
      
      // state 업데이트는 비동기이므로, location 값을 직접 사용
      setUserLocation(location)
      
      // location 값으로 직접 지도 이미지 생성
      const centerLat = location.latitude
      const centerLon = location.longitude
      const initialMapUrl = `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=800&height=500&level=13`
      setMapImageUrl(initialMapUrl)
      
      // 미니 지도 이미지도 생성
      const miniUrl = `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=1100&height=580&level=13`
      setMiniMapImageUrl(miniUrl)
      
      // 로그인 시에만 프로젝트 검색
      const userId = localStorage.getItem('userSq') || user?.userSq || 0
      if (userId && userId !== 0) {
        try {
          // 초기 검색 실행
          const response = await api.$get('/map/search', {
            params: {
              userId: userId,
              // 메인 페이지는 항상 내 주소 기준이므로 userId만 전달
              radius: 10000,
              jobType: null,
              keyword: null,
              page: 0,
              size: 1000
            }
          })
          
          if (response.output) {
            setProjects(response.output.projects || [])
            setMiniMapProjects(response.output.projects || [])
          } else {
            setProjects(response.projects || [])
            setMiniMapProjects(response.projects || [])
          }
          
        } catch (error) {
        }
      }
      
      // 인기 프로젝트 데이터 로드
      await loadPopularProjects()
    }

    initData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles.mainPage}>
      {/* 광고 배너 캐러셀 */}
      <section className={styles.bannerCarouselSection}>
        <div className={styles.carouselWrapper}>
          {/* 좌측 화살표 */}
          <button 
            className={`${styles.carouselArrow} ${styles.leftArrow}`} 
            onClick={goToPrevSlide}
            aria-label="이전 배너"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          {/* 슬라이드 영역 */}
          <div className={styles.carouselTrack}>
            {/* 슬라이드 1: 캘린더 텍스트 배너 */}
            <div className={`${styles.carouselSlide} ${styles.calendarSlideWhite} ${currentSlideIndex === 0 ? styles.active : ''}`}>
              <div className={styles.centerTextArea}>
                <h1 className={styles.heroTitle}>
                  관심있는 프로젝트 공고 일정<br />
                  달력에서 바로 확인하세요
                </h1>
                <p className={styles.heroSubtitle}>스크랩한 기업 프로젝트의 모집 일정 캘린더에서 한눈에 확인하세요</p>
              </div>
            </div>

            {/* 슬라이드 2: 히어로 배너 이미지 + 지도 축소판 */}
            <div className={`${styles.carouselSlide} ${styles.mapSlideWhite} ${currentSlideIndex === 1 ? styles.active : ''}`}>
              {/* 좌측 텍스트 영역 */}
              <div className={styles.leftTextArea}>
                <h1 className={styles.heroTitle}>
                  나와 가까운 일자리,<br />
                  지금 바로 찾아드릴게요
                </h1>
                <p className={styles.heroSubtitle}>내 위치 반경을 설정해 빠르게 찾기</p>
                <button className={`btn btn-rounded btn-primary btn-lg ${styles.btnRounded}`} onClick={scrollToMap}>
                  내 주변 공고
                </button>
              </div>

              {/* 우측에 지도 (항상 표시, 로그인 시 주소/범례 추가) */}
              <div className={styles.miniMapWrapper}>
                <MapComponent
                  userLocation={userLocation}
                  projects={miniMapProjects}
                  mapImageUrl={miniMapImageUrl}
                  locationType="address"
                  currentFilters={{ locationType: 'address', radius: '10000', jobRole: '', keyword: '' }}
                  tempSelectedLocation={null}
                  initialZoom={13}
                  mapWidth={1100}
                  mapHeight={580}
                  showControls={isLoggedIn}
                  showRadiusText={isLoggedIn}
                  onMarkerClick={handleMarkerClick}
                  onZoomChange={() => {}}
                  onLocationSelected={() => {}}
                  onUpdateMap={() => {}}
                  onFilterChange={() => {}}
                  onOpenLocationModal={() => {}}
                />
              </div>
            </div>
          </div>

          {/* 우측 화살표 */}
          <button 
            className={`${styles.carouselArrow} ${styles.rightArrow}`} 
            onClick={goToNextSlide}
            aria-label="다음 배너"
          >
            <i className="bi bi-chevron-right"></i>
          </button>

          {/* 인디케이터 점 */}
          <div className={styles.carouselDots}>
            <button 
              className={`${styles.dot} ${currentSlideIndex === 0 ? styles.active : ''}`} 
              onClick={() => jumpToSlide(0)}
            ></button>
            <button 
              className={`${styles.dot} ${currentSlideIndex === 1 ? styles.active : ''}`} 
              onClick={() => jumpToSlide(1)}
            ></button>
          </div>
        </div>
      </section>

      {/* 마커 클릭 모달 */}
      {selectedProject && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProject(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h5 className={`modal-title ${styles.textColorDark}`}>프로젝트 정보</h5>
              <button onClick={() => setSelectedProject(null)} className={styles.btnClose}></button>
            </div>

            <div className="modal-body">
              <div className="project-info">
                <h6 className={`${styles.textColorDark} fw-bold`}>{selectedProject.projectTitle}</h6>
                <p className="text-muted mb-1">
                  <i className="bi bi-building me-2"></i>{selectedProject.companyName}
                </p>
                <p className="text-muted mb-1">
                  <i className="bi bi-briefcase me-2"></i>{selectedProject.jobType}
                </p>
                <p className="text-muted mb-1">
                  <i className="bi bi-geo-alt me-2"></i>{selectedProject.address || selectedProject.sigungu || '주소 정보 없음'}
                  {selectedProject.detailAddress ? ' ' + selectedProject.detailAddress : ''}
                </p>
                <p className="text-muted mb-2">
                  <i className="bi bi-arrow-right me-2"></i>{selectedProject.distance}km
                </p>

                <div className="border-top pt-3 mt-3">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">모집 마감일</small>
                      <div className="fw-bold">{formatDeadlineWithDate(selectedProject.recruitEndDt)}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">급여</small>
                      <div className="fw-bold">{formatSalary(selectedProject.projectSalary)}</div>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-12">
                      <small className="text-muted">작업 기간</small>
                      <div className="fw-bold">
                        {getProjectDuration(
                          selectedProject.projectStartDt || selectedProject.projectStartDate,
                          selectedProject.projectEndDt || selectedProject.projectEndDate
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer d-flex gap-2 mt-3">
              <button 
                onClick={() => handleProjectClick(selectedProject)} 
                className={`btn ${styles.btnRounded} btn-primary btn-sm flex-fill`}
              >
                <i className="bi bi-eye me-1"></i>상세보기
              </button>
              <button 
                onClick={() => handleRouteClick(selectedProject)} 
                className={`btn ${styles.btnRounded} btn-primary btn-sm flex-fill`}
                style={{ 
                  backgroundColor: 'white',
                  color: '#0d6efd',
                  border: '1px solid #0d6efd'
                }}
              >
                <i className="bi bi-route me-1"></i>경로 안내
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인기 프로젝트 섹션 */}
      <section className={styles.popularProjectsSection}>
        <div className={styles.sectionInner}>
          {/* 헤더와 필터를 같은 줄에 배치 */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* 왼쪽: 제목과 소개글 */}
            <div className={styles.sectionHeaderLeft}>
              <div className="d-flex align-items-center gap-2">
                <h2 className="mb-0">인기 프로젝트</h2>
              </div>
              <div className="d-flex align-items-center gap-2">
                <p className="text-muted mb-0">많은 관심을 받고 있는 프로젝트들을 확인해보세요</p>
                <button className={`btn btn-primary btn-sm ${styles.btnRoundedSmall}`} onClick={goToProjectList}>
                  전체보기
                </button>
              </div>
            </div>
            
            {/* 우측: 필터 탭 */}
            <div className="filter-tabs">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  className={`btn btn-sm me-2 ${activeFilter === tab.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveFilterHandler(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 프로젝트 카드 */}
          {isLoadingProjects ? (
            <div className="text-center py-3" style={{ minHeight: '200px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">로딩 중...</span>
              </div>
            </div>
          ) : popularProjects.length === 0 ? (
            <div className="text-center py-3" style={{ minHeight: '200px' }}>
              <p className="text-muted">표시할 프로젝트가 없습니다.</p>
            </div>
          ) : (
            <div className={styles.projectGrid}>
              {displayedProjects.map(project => (
                <div 
                  key={project.projectSq} 
                  className={styles.projectGridItem}
                >
                  <div 
                    className={`${styles.projectCard} card h-100`} 
                    onClick={() => handleProjectCardClick(project)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{project.projectTtl}</h5>
                      <p className="card-text text-muted">{project.companyNm}</p>
                      <p className="card-text small text-muted">
                        {project.address} / {project.devGradeNm} / {project.requiredEduLvl}
                      </p>
                      <div className={`d-flex gap-1 flex-wrap mt-1 ${styles.skillTagsArea}`}>
                        {project.reqSkills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="badge bg-primary">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className={styles.faqSection}>
        <div className={styles.faqSectionInner}>
          {/* 헤더 */}
          <div className="mb-4">
            <div className={styles.sectionHeaderLeft}>
              <h2>자주 묻는 질문</h2>
              <p className="text-muted mb-0">궁금한 점이 있으시면 FAQ를 확인해보세요</p>
            </div>
          </div>

          {/* FAQ 아코디언 */}
          <div className={styles.faqAccordion}>
            {faqList.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={`${styles.faqQuestion} ${activeFaq === index ? styles.active : ''}`}
                  onClick={() => toggleFaq(index)}
                  style={activeFaq === index ? { color: '#0d6efd' } : {}}
                >
                  <span style={activeFaq === index ? { color: '#0d6efd' } : {}}>{faq.question}</span>
                  <i 
                    className={`bi ${activeFaq === index ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                    style={{ color: activeFaq === index ? '#0d6efd' : '#333' }}
                  ></i>
                </button>
                {activeFaq === index && (
                  <div className={styles.faqAnswer}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 위치 선택 모달 */}
      {showLocationModal && (
        <LocationSelectModal
          onClose={() => setShowLocationModal(false)}
          onLocationSelected={handleLocationSelected}
        />
      )}
    </div>
  )
}
