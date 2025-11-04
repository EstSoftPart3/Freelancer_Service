import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import qs from 'qs'
import MapComponent from '@/components/map/MapComponent'
import LocationSelectModal from '@/components/map/LocationSelectModal'
import ProjectFilterBar from '@/components/project/ProjectFilterBar'
import ProjectCardGroup from '@/components/project/ProjectCardGroup'
import CommonPagination from '@/components/common/CommonPagination'
import CommonPageHeader from '@/components/common/CommonPageHeader'
import styles from './projectList.module.css'

export default function ProjectListPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const { showAlert } = useAlert()

  // 탭 상태
  const [activeTab, setActiveTab] = useState('list')

  // ========== 리스트 탭 관련 상태 ==========
  const [filters, setFilters] = useState({
    addressCodeSq: [],
    projectDeveloperGradeCd: [],
    educationCd: [],
    jobRoleCd: [],
    sortBy: 'project_start_dt',
    sortOrder: 'desc',
    searchKeyword: '',
    searchType: '전체',
    size: 5,
    page: 1
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [projects, setProjects] = useState([])

  // ========== 지도 탭 관련 상태 ==========
  const [mapUserLocation, setMapUserLocation] = useState({
    latitude: null,
    longitude: null,
    address: '위치 정보 로딩 중...'
  })
  const [mapProjects, setMapProjects] = useState([])
  const [mapImageUrl, setMapImageUrl] = useState('')
  const [mapZoom, setMapZoom] = useState(13)
  const [locationType, setLocationType] = useState('address')
  const [tempSelectedLocation, setTempSelectedLocation] = useState(null)
  const [currentMapFilters, setCurrentMapFilters] = useState({
    locationType: 'address',
    radius: '10000', // 초기값: 없음 (전국 전체)
    jobRole: '',
    keyword: ''
  })
  const [selectedMapProject, setSelectedMapProject] = useState(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showProjectListModal, setShowProjectListModal] = useState(false)
  const [selectedCompanyProjects, setSelectedCompanyProjects] = useState([])
  const mapComponentRef = useRef(null)

  // ========== 리스트 탭 관련 함수 ==========

  // 프로젝트 목록 조회
  const fetchProjects = async () => {
    try {
      const params = { ...filters }
      const queryString = qs.stringify(params, { arrayFormat: 'repeat' })
      const response = await api.$get(`/projects?${queryString}`)
      setProjects(response.output.projects || [])

      const totalCount = response.output.totalCount ?? 0
      setTotalPages(Math.max(1, Math.ceil(totalCount / filters.size)))
    } catch (e) {
      console.error('프로젝트 정보 불러오기 실패', e)
    }
  }

  // 필터 업데이트 (useCallback으로 메모이제이션)
  const updateFilters = useCallback((updated) => {
    setFilters(prev => ({ ...prev, ...updated }))
    setCurrentPage(1) // 필터 바꾸면 1페이지부터
  }, [])

  // 페이지 변경 시 프로젝트 조회
  useEffect(() => {
    if (activeTab === 'list') {
      setFilters(prev => ({ ...prev, page: currentPage }))
      fetchProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab])

  // ========== 지도 탭 관련 함수 ==========

  // 좌표를 주소로 변환
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      console.log('=== 프론트엔드 좌표 검증 ===')
      console.log('입력된 좌표:', lat, lng)
      console.log('좌표 타입:', typeof lat, typeof lng)
      console.log('좌표 유효성:', !isNaN(lat), !isNaN(lng))
      console.log('=== 지오코딩 API 호출 ===')
      
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
      
      // success가 true이고 유효한 주소가 있으면 사용
      if (response.success !== false) {
        if (response.output && response.output.address) {
          console.log('네이버 지오코딩 성공:', response.output.address)
          return response.output.address
        } else if (response.address && !response.address.includes('위도:') && !response.address.includes('경도:')) {
          console.log('네이버 지오코딩 성공:', response.address)
          return response.address
        }
      }
      
      // 네이버 실패 시 카카오 지오코딩 시도
      console.log('네이버 지오코딩 실패, 카카오 API 시도...')
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        return new Promise((resolve) => {
          const geocoder = new window.kakao.maps.services.Geocoder()
          geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              const address = result[0].address.address_name
              console.log('카카오 지오코딩 성공:', address)
              resolve(address)
            } else {
              console.log('카카오 지오코딩도 실패')
              resolve(null)
            }
          })
        })
      }
      
      console.log('카카오 API 사용 불가')
      return null
    } catch (error) {
      console.error('주소 변환 실패:', error)
      return null
    }
  }

  // 사용자 위치 가져오기
  const getMapUserLocation = () => {
    return new Promise((resolve) => {
      const userId = localStorage.getItem('userSq') || user?.userSq || 0
      console.log('사용자 ID로 주소 조회:', userId)
      
      if (!userId || userId === 0 || userId === '0') {
        console.log('비로그인 상태: 위치 정보 없음 (전국 지도 표시)')
        resolve({
          latitude: 37.5665, // 지도 초기 중심점 (서울시청)
          longitude: 126.9780,
          address: null // 주소 정보 없음
        })
        return
      }
      
      api.$get(`/map/user-address?userId=${userId}`)
        .then(async (response) => {
          console.log('주소 API 응답:', response)
          const data = response.data || response.output || response
          
          // API에서 반환한 주소를 그대로 사용
          const location = {
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address
          }
          console.log('사용자 등록 주소 사용:', location)
          resolve(location)
        })
        .catch((error) => {
          console.log('사용자 주소 정보 조회 실패:', error)
          // 실패 시 기본 위치 사용 (GPS 접근 안 함)
          const defaultLocation = {
            latitude: 37.5665,
            longitude: 126.9780,
            address: '서울시 중구 (기본값)'
          }
          console.log('기본 위치 사용:', defaultLocation)
          resolve(defaultLocation)
        })
    })
  }

  // 반경에 따른 적절한 줌 레벨 계산
  const calculateZoomLevel = (radius) => {
    const radiusNum = parseFloat(radius)
    
    if (radiusNum <= 3) return 14
    if (radiusNum <= 5) return 13
    if (radiusNum <= 10) return 12
    if (radiusNum <= 20) return 11
    return 10
  }

  // 지도 이미지 URL 생성
  const generateMapImageUrl = () => {
    if (!mapUserLocation.latitude || !mapUserLocation.longitude) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwN2JmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyekOyduO2UhOyngCDrqZTsl4zsnoE8L3RleHQ+PC9zdmc+'
    }
    
    const centerLat = mapUserLocation.latitude
    const centerLon = mapUserLocation.longitude
    const mapUrl = `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=900&height=800&level=${mapZoom}`
    
    console.log('지도 URL 생성:', mapUrl)
    return mapUrl
  }

  // 지도 프로젝트 검색
  const fetchMapProjects = async () => {
    try {
      console.log('=== 프로젝트 조회 시작 ===')
      console.log('사용자 위치:', mapUserLocation)
      console.log('필터 조건:', currentMapFilters)
      
      const userId = localStorage.getItem('userSq') || user?.userSq || 0
      
      // 비로그인 시 또는 "내 주소" 모드일 때 userId 사용, 아니면 직접 좌표 전달
      const params = (currentMapFilters.locationType === 'address' && userId && userId !== 0 && userId !== '0')
        ? {
            userId: userId,
            radius: currentMapFilters.radius,
            jobType: currentMapFilters.jobRole || '',
            searchKeyword: currentMapFilters.keyword || '',
            page: 0,
            size: 1000 // 전국 조회 시 많은 프로젝트 가져오기
          }
        : {
            lat: mapUserLocation.latitude,
            lon: mapUserLocation.longitude,
            radius: currentMapFilters.radius,
            jobType: currentMapFilters.jobRole || '',
            searchKeyword: currentMapFilters.keyword || '',
            page: 0,
            size: 1000 // 전국 조회 시 많은 프로젝트 가져오기
          }
      console.log('API 요청 파라미터:', params)
      
      const response = await api.$get('/map/search', { params })
      console.log('API 응답:', response)
      
      const projects = response.output?.projects || response.projects || []
      setMapProjects(projects)
      console.log('조회된 프로젝트 수:', projects.length)
    } catch (error) {
      console.error('지도 프로젝트 조회 실패:', error)
      setMapProjects([])
    }
  }

  // 지도 탭 초기화
  const initializeMapTab = async () => {
    try {
      console.log('지도 초기화 시작...')
      const location = await getMapUserLocation()
      console.log('위치 조회 완료:', location)
      
      setMapUserLocation(location)
      
      // 비로그인 시 전국 프로젝트 조회
      const userId = localStorage.getItem('userSq') || user?.userSq || 0
      if (!userId || userId === 0 || userId === '0') {
        console.log('비로그인 상태: 전국 프로젝트 조회')
        setCurrentMapFilters({
          locationType: 'address',
          radius: '10000', // 전국 전체
          jobRole: '',
          keyword: ''
        })
        
        // 전국 줌 레벨
        const initialZoom = 10
        setMapZoom(initialZoom)
        console.log(`비로그인: 전국 지도 (줌 레벨 ${initialZoom})`)
      } else {
        // 로그인 시 기존 로직
        const initialZoom = calculateZoomLevel(currentMapFilters.radius || '5')
        setMapZoom(initialZoom)
        console.log(`로그인: 초기 줌 레벨 ${initialZoom}`)
      }
      
    } catch (error) {
      console.error('지도 초기화 실패:', error)
      showAlert('지도 초기화에 실패했습니다. 페이지를 새로고침해주세요.', 'danger')
    }
  }

  // 현재 위치 가져오기 (여러 번 시도해서 가장 정확한 GPS 선택)
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      console.log('=== getCurrentPosition 시작 ===')
      if (!navigator.geolocation) {
        console.log('브라우저가 위치 정보를 지원하지 않음')
        alert('이 브라우저는 위치 정보를 지원하지 않습니다.')
        reject(new Error('위치 정보 미지원'))
        return
      }
      
      console.log('위치 정보 3회 요청 시작... (가장 정확한 것 선택)')
      const positions = []
      let attempts = 0
      const maxAttempts = 3
      
      const getPosition = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            attempts++
            positions.push(position)
            console.log(`GPS 시도 ${attempts}/${maxAttempts}:`, {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              accuracy: position.coords.accuracy
            })
            
            if (attempts >= maxAttempts) {
              // 가장 정확한 GPS 선택 (accuracy가 가장 낮은 것)
              const bestPosition = positions.reduce((prev, curr) => 
                curr.coords.accuracy < prev.coords.accuracy ? curr : prev
              )
              
              console.log('✅ 가장 정확한 GPS 선택:', {
                lat: bestPosition.coords.latitude,
                lon: bestPosition.coords.longitude,
                accuracy: bestPosition.coords.accuracy
              })
              
              const coords = {
                latitude: bestPosition.coords.latitude,
                longitude: bestPosition.coords.longitude
              }
              resolve(coords)
            } else {
              // 다음 시도
              setTimeout(getPosition, 500)
            }
          },
          (error) => {
            console.log(`GPS 시도 ${attempts + 1} 실패:`, error)
            attempts++
            
            if (attempts >= maxAttempts) {
              if (positions.length > 0) {
                // 실패해도 이전 성공한 것이 있으면 사용
                const bestPosition = positions.reduce((prev, curr) => 
                  curr.coords.accuracy < prev.coords.accuracy ? curr : prev
                )
                console.log('일부 실패했지만 가장 정확한 GPS 사용:', bestPosition.coords.accuracy, 'm')
                const coords = {
                  latitude: bestPosition.coords.latitude,
                  longitude: bestPosition.coords.longitude
                }
                resolve(coords)
              } else {
                alert('위치 정보를 가져올 수 없습니다.')
                reject(error)
              }
            } else {
              // 다음 시도
              setTimeout(getPosition, 500)
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        )
      }
      
      getPosition()
    })
  }

  // 필터 변경 핸들러
  const handleMapFilterChange = async (filters) => {
    try {
      console.log('필터 변경:', filters)
      
      setCurrentMapFilters({ ...filters })
      setLocationType(filters.locationType)
      
      // 반경에 따라 줌 레벨 자동 조정
      const newZoom = calculateZoomLevel(filters.radius)
      setMapZoom(newZoom)
      console.log(`반경 ${filters.radius}km → 줌 레벨 ${newZoom}로 자동 조정`)
      
      let searchLat, searchLng
      
      if (filters.locationType === 'address') {
        console.log('=== 내 주소로 변경 ===')
        const userAddress = await getMapUserLocation()
        console.log('사용자 등록 주소 재조회:', userAddress)
        
        setMapUserLocation(userAddress)
        searchLat = userAddress.latitude
        searchLng = userAddress.longitude
        
        console.log('=== 내 주소로 변경 완료 ===')
      } else if (filters.locationType === 'current') {
        console.log('=== 현재 위치 선택 시작 ===')
        let currentPos
        try {
          currentPos = await getCurrentPosition()
          console.log('현재 위치 좌표:', currentPos)
        } catch (error) {
          console.error('GPS 획득 실패:', error)
          showAlert('현재 위치를 가져올 수 없습니다. "위치 선택" 기능을 사용해주세요.', 'danger')
          return
        }
        
        console.log('지오코딩 API 호출 시작...')
        const address = await getAddressFromCoordinates(currentPos.latitude, currentPos.longitude)
        console.log('지오코딩 결과 주소:', address)
        
        // 주소 변환 실패 시 기본 텍스트 사용
        const finalAddress = address || '현재 위치'
        
        const newLocation = {
          latitude: currentPos.latitude,
          longitude: currentPos.longitude,
          address: finalAddress
        }
        setMapUserLocation(newLocation)
        console.log('mapUserLocation 업데이트:', newLocation)
        
        searchLat = currentPos.latitude
        searchLng = currentPos.longitude
        console.log('=== 현재 위치 선택 완료 ===')
      } else if (filters.locationType === 'custom') {
        console.log('=== 위치 선택 모드 ===')
        
        if (tempSelectedLocation) {
          const newLocation = {
            latitude: tempSelectedLocation.latitude,
            longitude: tempSelectedLocation.longitude,
            address: tempSelectedLocation.address
          }
          setMapUserLocation(newLocation)
          
          searchLat = tempSelectedLocation.latitude
          searchLng = tempSelectedLocation.longitude
          console.log('선택된 위치로 검색:', tempSelectedLocation.address)
        } else {
          console.log('위치를 먼저 선택해주세요')
          alert('위치를 먼저 선택해주세요.')
          return
        }
      }
      
      // 백엔드 API 호출
      console.log('=== API 호출 전 검증 ===')
      console.log('검색 좌표 - searchLat:', searchLat, 'searchLng:', searchLng)
      
      // "내 주소" 모드일 때만 userId 사용, 아니면 직접 좌표 전달
      const params = filters.locationType === 'address' 
        ? {
            userId: user?.userSq || 0,
            radius: parseFloat(filters.radius),
            jobType: filters.jobRole || '',
            searchKeyword: filters.keyword || '',
            page: 0,
            size: 20
          }
        : {
            lat: searchLat,
            lon: searchLng,
            radius: parseFloat(filters.radius),
            jobType: filters.jobRole || '',
            searchKeyword: filters.keyword || '',
            page: 0,
            size: 20
          }
      console.log('=== 최종 API 요청 파라미터 ===', params)
      
      const response = await api.$get('/map/search', { params })
      console.log('=== API 응답 분석 ===', response)
      
      const projects = response.output?.projects || response.projects || []
      setMapProjects(projects)
      console.log('조회된 프로젝트 수:', projects.length)
      
      // 지도 URL은 useEffect에서 자동으로 업데이트됨
      
    } catch (error) {
      console.error('지도 프로젝트 조회 실패:', error)
      setMapProjects([])
    }
  }

  // 위치 선택 핸들러
  const handleMapLocationSelected = async (location) => {
    console.log('위치 선택됨:', location)
    
    if (isNaN(location.latitude) || isNaN(location.longitude)) {
      alert('유효하지 않은 좌표입니다. 주소를 다시 선택해주세요.')
      return
    }
    
    // 임시 변수에만 저장! mapUserLocation은 검색 버튼 클릭 시에만 업데이트
    setTempSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address
    })
    
    // 현재 필터의 locationType을 'custom'으로 업데이트
    setCurrentMapFilters(prev => ({ ...prev, locationType: 'custom' }))
    
    // 위치 선택 모달 닫기
    setShowLocationModal(false)
    
    console.log('위치가 임시 저장되었습니다. 검색 버튼을 눌러주세요.')
    
    // 잠시 후 필터 모달 자동으로 열기 (부드러운 전환을 위해 300ms 딜레이)
    setTimeout(() => {
      if (mapComponentRef.current) {
        mapComponentRef.current.openFilterModal()
        console.log('필터를 조정하고 검색 버튼을 클릭하세요!')
      }
    }, 300)
    
    // 검색은 하지 않음! mapUserLocation도 업데이트 안 함! 
    // 검색 버튼 클릭 시에만 모든 게 반영됨!
  }

  // 마커 클릭 핸들러
  const handleMapMarkerClick = (project) => {
    console.log('마커 클릭:', project)
    setSelectedMapProject(project)
  }

  // 프로젝트 클릭 핸들러
  const handleMapProjectClick = (project) => {
    console.log('프로젝트 클릭:', project)
    const userType = localStorage.getItem('userType') || user?.userType
    if (userType === 'PERSONAL') {
      router.push(`/project/spec/user/${project.projectSq}`)
    } else if (userType === 'COMPANY') {
      router.push(`/project/spec/company/${project.projectSq}`)
    } else {
      router.push(`/project/spec/user/${project.projectSq}`)
    }
    setSelectedMapProject(null)
  }

  // 경로 안내 핸들러
  const handleMapRouteClick = (project) => {
    console.log('경로 클릭:', project)
    
    const naverMapUrl = `https://map.naver.com/index.nhn?slng=${mapUserLocation.longitude}&slat=${mapUserLocation.latitude}&stext=${encodeURIComponent(mapUserLocation.address)}&elng=${project.longitude}&elat=${project.latitude}&etext=${encodeURIComponent(project.companyName)}&menu=route&pathType=1`
    
    window.open(naverMapUrl, '_blank')
    setSelectedMapProject(null)
  }

  // 급여 포맷팅
  const formatSalary = (salary) => {
    if (!salary) return '미정'
    return `${salary.toLocaleString()}원`
  }

  // 모집 마감일 포맷팅
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

  // 프로젝트 기간 계산
  const getProjectDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '미정'
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMonths = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30))
    
    const startStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    const endStr = end.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    
    return `${startStr} ~ ${endStr} (${diffMonths}개월)`
  }

  // 지도 URL 업데이트 및 프로젝트 로드
  useEffect(() => {
    if (activeTab === 'map' && mapUserLocation.latitude && mapUserLocation.longitude) {
      console.log('=== 지도 데이터 업데이트 ===')
      console.log('위치:', mapUserLocation)
      console.log('줌 레벨:', mapZoom)
      
      const newMapUrl = generateMapImageUrl()
      setMapImageUrl(newMapUrl)
      console.log('지도 URL 업데이트:', newMapUrl)
      
      // 프로젝트 로드
      fetchMapProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapUserLocation.latitude, mapUserLocation.longitude, mapZoom, activeTab])

  // 탭 전환 감지
  useEffect(() => {
    if (activeTab === 'map') {
      console.log('=== 지도 탭 활성화 ===')
      initializeMapTab()
    } else if (activeTab === 'list') {
      console.log('=== 리스트 탭 활성화 ===')
      // 리스트가 비어있으면 프로젝트 목록 로드
      if (projects.length === 0) {
        fetchProjects()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // 초기 마운트 시 query parameter 확인
  useEffect(() => {
    const initialize = async () => {
      if (router.query.tab === 'map') {
        setActiveTab('map')
        await initializeMapTab()
      } else {
        fetchProjects()
        console.log('fetchProjects')
      }
    }
    
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.tab])

  return (
    <div className={styles.projectListPage}>
      {/* 페이지 헤더 */}
      <CommonPageHeader
        title=""
        strongText="프로젝트 목록"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '프로젝트' }]}
      />

      {/* 탭 */}
      <div className={styles.pageContainer}>
        <ul className="nav nav-tabs mb-0 pt-3">
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-list-ul me-2"></i>리스트
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-map me-2"></i>지도
            </a>
          </li>
        </ul>
      </div>

      <div className="mb-3"></div>

      {/* 리스트 탭일 때만 ProjectFilterBar 표시 */}
      {activeTab === 'list' && (
        <ProjectFilterBar onUpdate={updateFilters} />
      )}

      <div className={`${styles.pageContainer} py-4`}>
        {/* 리스트 탭 내용 */}
        {activeTab === 'list' && (
          <div>
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-rounded btn-primary me-2" onClick={fetchProjects}>
                검색
              </button>
              {user?.userType === 'COMPANY' && (
                <a href="/mypage/projectPostPage" className="btn btn-rounded btn-light">
                  등록하기
                </a>
              )}
            </div>
            
            <ProjectCardGroup projects={projects} />
            
            {projects.length === 0 && (
              <div className="text-center text-muted py-5">
                조건에 맞는 프로젝트가 없습니다.
              </div>
            )}
            
            <CommonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}

        {/* 지도 탭 내용 */}
        {activeTab === 'map' && (
          <div className="row">
            <div className="col-12">
              <MapComponent
                ref={mapComponentRef}
                userLocation={mapUserLocation}
                projects={mapProjects}
                mapImageUrl={mapImageUrl}
                locationType={locationType}
                currentFilters={currentMapFilters}
                tempSelectedLocation={tempSelectedLocation}
                initialZoom={mapZoom}
                mapWidth={900}
                mapHeight={800}
                showControls={true}
                showRadiusText={true}
                onMarkerClick={handleMapMarkerClick}
                onZoomChange={(zoom) => setMapZoom(zoom)}
                onLocationSelected={handleMapLocationSelected}
                onUpdateMap={() => {}}
                onFilterChange={handleMapFilterChange}
                onOpenLocationModal={() => setShowLocationModal(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 지도 마커 클릭 모달 */}
      {selectedMapProject && (
        <div className={styles.modalOverlay} onClick={() => setSelectedMapProject(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h5 className={`modal-title ${styles.textColorDark}`}>
                프로젝트 정보
              </h5>
              <button onClick={() => setSelectedMapProject(null)} className={styles.btnClose}>×</button>
            </div>

            <div className="modal-body">
              <div className="project-info">
                <h6 className={`${styles.textColorDark} fw-bold`}>
                  {selectedMapProject.projectTitle}
                </h6>
                <p className="text-muted mb-1">
                  <i className="bi bi-building me-2"></i>{selectedMapProject.companyName}
                </p>
                <p className="text-muted mb-1">
                  <i className="bi bi-briefcase me-2"></i>{selectedMapProject.jobType}
                </p>
                <p className="text-muted mb-1">
                  <i className="bi bi-geo-alt me-2"></i>{selectedMapProject.address}
                  {selectedMapProject.detailAddress ? ' ' + selectedMapProject.detailAddress : ''}
                </p>
                <p className="text-muted mb-2">
                  <i className="bi bi-arrow-right me-2"></i>{selectedMapProject.distance}km
                </p>

                <div className="border-top pt-3 mt-3">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">모집 마감일</small>
                      <div className="fw-bold">
                        {formatDeadlineWithDate(selectedMapProject.recruitEndDt)}
                      </div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">급여</small>
                      <div className="fw-bold">
                        {formatSalary(selectedMapProject.projectSalary)}
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-12">
                      <small className="text-muted">작업 기간</small>
                      <div className="fw-bold">
                        {getProjectDuration(
                          selectedMapProject.projectStartDt || selectedMapProject.projectStartDate,
                          selectedMapProject.projectEndDt || selectedMapProject.projectEndDate
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer d-flex gap-2 mt-3">
              <button
                onClick={() => handleMapProjectClick(selectedMapProject)}
                className="btn btn-rounded btn-primary btn-sm flex-fill"
              >
                <i className="bi bi-eye me-1"></i>상세보기
              </button>
              <button
                onClick={() => handleMapRouteClick(selectedMapProject)}
                className="btn btn-rounded btn-primary btn-sm flex-fill"
                style={{ 
                  backgroundColor: 'white',
                  color: '#007bff',
                  border: '1px solid #007bff'
                }}
              >
                <i className="bi bi-route me-1"></i>경로 안내
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 위치 선택 모달 */}
      {showLocationModal && (
        <LocationSelectModal
          onClose={() => setShowLocationModal(false)}
          onLocationSelected={handleMapLocationSelected}
        />
      )}
    </div>
  )
}

