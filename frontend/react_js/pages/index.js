import { useState, useEffect, useCallback } from 'react'
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
    radius: '5',
    jobRole: '',
    keyword: ''
  })

  // 미니 지도 관련 상태 (배너용)
  const [miniMapProjects, setMiniMapProjects] = useState([])
  const [miniMapImageUrl, setMiniMapImageUrl] = useState('')

  // 인기 프로젝트 관련 상태
  const filterTabs = [
    { key: 'views', label: '조회수' },
    { key: 'scraps', label: '스크랩수' },
    { key: 'latest', label: '최신순' }
  ]
  const [activeFilter, setActiveFilter] = useState('views')
  const [popularProjects, setPopularProjects] = useState([])
  const [allPopularProjectsData, setAllPopularProjectsData] = useState({
    views: [],
    scraps: [],
    latest: []
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  // FAQ 관련 상태
  const [activeFaq, setActiveFaq] = useState(0)
  const faqList = [
    {
      question: '프로젝트에 지원하려면 어떻게 해야 하나요?',
      answer: '프로젝트 상세 페이지에서 "지원하기" 버튼을 클릭하면 지원할 수 있습니다. 로그인이 필요합니다.'
    },
    {
      question: '프로젝트 모집이 마감되면 어떻게 되나요?',
      answer: '모집 마감 후에는 지원이 불가능하며, 이미 지원한 내역은 마이페이지에서 확인할 수 있습니다.'
    },
    {
      question: '프로젝트 정보를 수정하려면 어떻게 해야 하나요?',
      answer: '기업 회원은 마이페이지에서 등록한 프로젝트 정보를 수정할 수 있습니다.'
    },
    {
      question: '스크랩한 프로젝트는 어디서 확인하나요?',
      answer: '마이페이지의 "스크랩한 프로젝트" 메뉴에서 확인할 수 있습니다.'
    },
    {
      question: '프로젝트 검색은 어떻게 하나요?',
      answer: '상단 검색바에서 키워드를 입력하거나, 필터를 사용하여 원하는 프로젝트를 찾을 수 있습니다.'
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
  const getUserLocation = useCallback(() => {
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

      const userId = localStorage.getItem('userSq') || user.userSq || 0
      api.$get(`/map/user-address?userId=${userId}`)
        .then(response => {
          const data = response.data || response.output || response
          resolve({
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address
          })
        })
        .catch(error => {
          console.log('사용자 주소 정보 조회 실패:', error)
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: '현재 위치'
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
  }, [user.userSq])

  const generateMapImageUrl = useCallback(() => {
    if (!userLocation.latitude || !userLocation.longitude) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwN2JmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyekOyduO2UhOyngCDrqZTsl4zsnoE8L3RleHQ+PC9zdmc+'
    }
    
    const centerLat = userLocation.latitude
    const centerLon = userLocation.longitude
    
    return `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=800&height=500&level=${mapZoom}`
  }, [userLocation, mapZoom])

  const handleMarkerClick = (project) => {
    console.log('마커 클릭:', project)
    setSelectedProject(project)
  }

  const handleProjectClick = (project) => {
    const userType = localStorage.getItem('userType') || user.userType
    if (userType === 'PERSONAL') {
      router.push(`/project/spec/user/${project.projectSq}`)
    } else if (userType === 'COMPANY') {
      router.push(`/project/spec/company/${project.projectSq}`)
    } else {
      showAlert('로그인이 필요한 서비스입니다.', 'danger')
      router.push('/auth/login')
    }
  }

  const handleRouteClick = (project) => {
    const destLat = project.latitude
    const destLon = project.longitude
    const naverMapUrl = `https://map.naver.com/index.nhn?slng=${userLocation.longitude}&slat=${userLocation.latitude}&stext=내위치&elng=${destLon}&elat=${destLat}&pathType=0&showMap=true&etext=${encodeURIComponent(project.projectTitle || project.address)}&menu=route`
    window.open(naverMapUrl, '_blank')
  }

  const formatSalary = (salary) => {
    if (!salary) return '협의'
    return `${parseInt(salary).toLocaleString()}만원`
  }

  const formatDeadlineWithDate = (deadline) => {
    if (!deadline) return '상시 모집'
    const date = new Date(deadline)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '마감'
    if (diffDays === 0) return '오늘 마감'
    return `D-${diffDays}`
  }

  const getProjectDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '기간 미정'
    return `${startDate} ~ ${endDate}`
  }

  // ============ 인기 프로젝트 관련 함수들 ============
  const loadPopularProjects = useCallback(async () => {
    setIsLoadingProjects(true)
    try {
      const userId = localStorage.getItem('userSq') || user.userSq || 0
      
      const [viewsRes, scrapsRes, latestRes] = await Promise.all([
        api.$get(`/project/popular/views?userId=${userId}&page=0&size=100`),
        api.$get(`/project/popular/scraps?userId=${userId}&page=0&size=100`),
        api.$get(`/project/popular/latest?userId=${userId}&page=0&size=100`)
      ])

      setAllPopularProjectsData({
        views: viewsRes.data || viewsRes.output || [],
        scraps: scrapsRes.data || scrapsRes.output || [],
        latest: latestRes.data || latestRes.output || []
      })

      setPopularProjects(viewsRes.data || viewsRes.output || [])
    } catch (error) {
      console.error('인기 프로젝트 조회 실패:', error)
      showAlert('인기 프로젝트를 불러오는데 실패했습니다.', 'danger')
    } finally {
      setIsLoadingProjects(false)
    }
  }, [user.userSq, showAlert])

  const updatePopularProjects = (filter) => {
    let selectedProjects = []
    if (filter === 'views') {
      selectedProjects = allPopularProjectsData.views
    } else if (filter === 'scraps') {
      selectedProjects = allPopularProjectsData.scraps
    } else if (filter === 'latest') {
      selectedProjects = allPopularProjectsData.latest
    }
    setPopularProjects(selectedProjects)
    setCurrentPage(1)
  }

  const paginatedProjects = popularProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(popularProjects.length / itemsPerPage)

  const hasDataForPage = (page) => {
    return page <= totalPages
  }

  const changePage = (page) => {
    if (page < 1 || page > totalPages || !hasDataForPage(page)) return
    setCurrentPage(page)
  }

  const handleProjectCardClick = (project) => {
    const userType = localStorage.getItem('userType') || user.userType
    if (userType === 'PERSONAL') {
      router.push(`/project/spec/user/${project.projectSq}`)
    } else if (userType === 'COMPANY') {
      router.push(`/project/spec/company/${project.projectSq}`)
    } else {
      showAlert('로그인이 필요한 서비스입니다.', 'danger')
      router.push('/auth/login')
    }
  }

  const handleImageError = (event) => {
    event.target.src = defaultProjectImage
  }

  // ============ FAQ 관련 함수들 ============
  const setActiveFilterHandler = (filter) => {
    setActiveFilter(filter)
    updatePopularProjects(filter)
  }

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const scrollToMap = () => {
    // 지도 섹션으로 스크롤 (구현 필요)
    window.scrollTo({ top: 600, behavior: 'smooth' })
  }

  // 지도 이미지 URL 업데이트
  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      const newMapUrl = generateMapImageUrl()
      setMapImageUrl(newMapUrl)
      setMiniMapImageUrl(newMapUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, mapZoom])

  // ============ 초기화 ============
  useEffect(() => {
    const initData = async () => {
      // 사용자 위치 가져오기
      const location = await getUserLocation()
      setUserLocation(location)
      
      // 인기 프로젝트 로드
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
            {/* 슬라이드 1: 캘린더 배너 이미지 */}
            <div className={`${styles.carouselSlide} ${currentSlideIndex === 0 ? 'active' : ''}`}>
              <img 
                src="/assets/banners/main-calendar.png" 
                alt="캘린더 배너" 
                className={styles.bannerImage}
              />
            </div>

            {/* 슬라이드 2: 히어로 배너 이미지 + 지도 축소판 */}
            <div className={`${styles.carouselSlide} ${styles.mapSlideWhite} ${currentSlideIndex === 1 ? 'active' : ''}`}>
              {/* 좌측 텍스트 영역 */}
              <div className={styles.leftTextArea}>
                <h1 className={styles.heroTitle}>
                  나와 가까운 일자리,<br />
                  지금 바로 찾아드릴게요
                </h1>
                <p className={styles.heroSubtitle}>내 위치 반경을 설정해 빠르게 찾기</p>
                <button className="btn btn-rounded btn-primary btn-lg" onClick={scrollToMap}>
                  내 주변 공고
                </button>
              </div>

              {/* 우측에 지도 */}
              <div className={styles.miniMapWrapper}>
                <MapComponent
                  userLocation={userLocation}
                  projects={miniMapProjects}
                  mapImageUrl={miniMapImageUrl}
                  locationType="address"
                  currentFilters={{ locationType: 'address', radius: '5', jobRole: '', keyword: '' }}
                  tempSelectedLocation={null}
                  initialZoom={13}
                  mapWidth={600}
                  mapHeight={500}
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
              className={`dot ${currentSlideIndex === 0 ? 'active' : ''}`} 
              onClick={() => jumpToSlide(0)}
            ></button>
            <button 
              className={`dot ${currentSlideIndex === 1 ? 'active' : ''}`} 
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
                  <i className="bi bi-geo-alt me-2"></i>{selectedProject.address}
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
                className={`btn ${styles.btnRounded} btn-outline-primary btn-sm flex-fill`}
              >
                <i className="bi bi-route me-1"></i>경로 안내
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인기 프로젝트 섹션 */}
      <section className={styles.popularProjectsSection}>
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2>인기 프로젝트</h2>
            <p className="text-muted">많은 관심을 받고 있는 프로젝트들을 확인해보세요</p>
          </div>

          {/* 필터 탭 */}
          <div className="filter-tabs mb-4">
            <div className="d-flex justify-content-center">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  className={`btn me-2 ${activeFilter === tab.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveFilterHandler(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 프로젝트 카드 */}
          {isLoadingProjects ? (
            <div className="text-center py-5" style={{ minHeight: '400px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">로딩 중...</span>
              </div>
            </div>
          ) : popularProjects.length === 0 ? (
            <div className="text-center py-5" style={{ minHeight: '400px' }}>
              <p className="text-muted">표시할 프로젝트가 없습니다.</p>
            </div>
          ) : (
            <div className="row" style={{ minHeight: '400px' }}>
              {paginatedProjects.map(project => (
                <div 
                  key={project.projectSq} 
                  className="col-lg-4 col-md-6 mb-4"
                >
                  <div 
                    className={`${styles.projectCard} card h-100`} 
                    onClick={() => handleProjectCardClick(project)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.projectImage}>
                      <img
                        src={project.companyImageUrl || defaultProjectImage}
                        alt={project.projectTtl}
                        className="card-img-top"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{project.projectTtl}</h5>
                      <p className="card-text text-muted">{project.companyNm}</p>
                      <p className="card-text small text-muted">
                        {project.address} / {project.devGradeNm} / {project.requiredEduLvl}
                      </p>
                      <div className="d-flex gap-1 flex-wrap mt-2">
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

          {/* 페이지네이션 */}
          {!isLoadingProjects && (
            <div className="pagination-container text-center">
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <a 
                      className="page-link" 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); changePage(currentPage - 1) }}
                      aria-label="Previous"
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li
                      key={page}
                      className={`page-item ${currentPage === page ? 'active' : ''} ${!hasDataForPage(page) ? 'disabled' : ''}`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        onClick={(e) => { e.preventDefault(); hasDataForPage(page) && changePage(page) }}
                      >
                        {page}
                      </a>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages || !hasDataForPage(currentPage + 1) ? 'disabled' : ''}`}>
                    <a
                      className="page-link"
                      href="#"
                      onClick={(e) => { e.preventDefault(); changePage(currentPage + 1) }}
                      aria-label="Next"
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className={styles.faqSection}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="faq-header text-center mb-5">
                <h2>자주 묻는 질문</h2>
                <p className="text-muted">궁금한 점이 있으시면 FAQ를 확인해보세요</p>
              </div>

              <div className="accordion" id="faqAccordion">
                {faqList.map((faq, index) => (
                  <div key={index} className="accordion-item">
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className={`accordion-button ${activeFaq !== index ? 'collapsed' : ''}`}
                        type="button"
                        onClick={() => toggleFaq(index)}
                        aria-expanded={activeFaq === index}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className={`accordion-collapse collapse ${activeFaq === index ? 'show' : ''}`}
                      aria-labelledby={`heading${index}`}
                    >
                      <div className="accordion-body">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 위치 선택 모달 */}
      {showLocationModal && (
        <LocationSelectModal
          onClose={() => setShowLocationModal(false)}
          onLocationSelected={(location) => {
            setTempSelectedLocation(location)
            setShowLocationModal(false)
          }}
        />
      )}
    </div>
  )
}
