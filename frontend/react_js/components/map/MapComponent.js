import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import MapFilterComponent from './MapFilterComponent'
import styles from './MapComponent.module.css'

const MapComponent = forwardRef(function MapComponent({
  userLocation,
  projects = [],
  mapImageUrl = '', // 더이상 사용하지 않지만 호환성을 위해 유지
  locationType = 'address',
  currentFilters = {
    locationType: 'address',
    radius: '5',
    jobRole: '',
    keyword: ''
  },
  tempSelectedLocation = null,
  initialZoom = 13,
  mapWidth = 800,
  mapHeight = 600,
  showControls = true,
  showRadiusText = false,
  onMarkerClick,
  onLocationSelected,
  onUpdateMap,
  onFilterChange,
  onZoomChange,
  onOpenLocationModal
}, ref) {
  // 필터 모달 상태
  const [showFilterModal, setShowFilterModal] = useState(false)

  // 부모 컴포넌트에서 접근 가능하도록 expose
  useImperativeHandle(ref, () => ({
    openFilterModal: () => {
      setShowFilterModal(true)
    }
  }))
  
  // 지도 관련 상태
  const [mapZoom, setMapZoom] = useState(initialZoom)
  const [isMapReady, setIsMapReady] = useState(false)
  
  // 프로젝트 관리 상태
  const [allProjects, setAllProjects] = useState([]) // 서버에서 받은 전체 프로젝트
  const [visibleProjects, setVisibleProjects] = useState([]) // 현재 지도 영역에 보이는 프로젝트
  
  // 지도 인스턴스 및 마커 관리를 위한 ref
  const mapRef = useRef(null) // 지도가 그려질 DOM 요소
  const mapInstanceRef = useRef(null) // 네이버 지도 인스턴스
  const userMarkerRef = useRef(null) // 사용자 위치 마커
  const projectMarkersRef = useRef([]) // 프로젝트 마커들 배열

  // ========================================
  // 1. props로 받은 projects를 allProjects로 저장
  // ========================================
  useEffect(() => {
    if (projects && projects.length > 0) {
      setAllProjects(projects)
    }
  }, [projects])

  // ========================================
  // 2. 네이버 지도 초기화
  // ========================================
  useEffect(() => {
    // 네이버 Maps API가 로드되지 않았거나 DOM이 준비되지 않은 경우 대기
    if (!window.naver || !window.naver.maps || !mapRef.current) {
      return
    }

    // 이미 지도가 생성된 경우 중복 생성 방지
    if (mapInstanceRef.current) {
      return
    }

    try {
      // 네이버 지도 생성
      const map = new naver.maps.Map(mapRef.current, {
        center: new naver.maps.LatLng(
          userLocation.latitude || 37.5665,
          userLocation.longitude || 126.9780
        ),
        zoom: mapZoom,
        zoomControl: false, // 기본 줌 컨트롤 숨김 (우리가 커스텀으로 만듦)
        mapTypeControl: false,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false
      })

      mapInstanceRef.current = map
      setIsMapReady(true)

      // 지도 줌 변경 이벤트 리스너
      naver.maps.Event.addListener(map, 'zoom_changed', () => {
        const newZoom = map.getZoom()
        setMapZoom(newZoom)
        if (onZoomChange) onZoomChange(newZoom)
      })

    } catch (error) {
      console.error('지도 초기화 실패:', error)
    }
  }, []) // 최초 1회만 실행

  // ========================================
  // 3. 지도 영역 변경 시 보이는 프로젝트 필터링
  // ========================================
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !window.naver || !window.naver.maps) {
      return
    }

    const map = mapInstanceRef.current

    // 지도 영역 내 프로젝트 필터링 함수
    const updateVisibleProjects = () => {
      if (allProjects.length === 0) {
        setVisibleProjects([])
        return
      }

      try {
        const bounds = map.getBounds() // 현재 보이는 지도 영역

        const filtered = allProjects.filter(project => {
          if (!project.latitude || !project.longitude) return false
          
          const position = new naver.maps.LatLng(
            project.latitude,
            project.longitude
          )
          
          return bounds.hasLatLng(position) // 영역 안에 있는지 확인
        })

        setVisibleProjects(filtered)
      } catch (error) {
        console.error('프로젝트 필터링 오류:', error)
      }
    }

    // 초기 필터링
    updateVisibleProjects()

    // 지도 드래그 종료 시 필터링
    const dragendListener = naver.maps.Event.addListener(map, 'dragend', updateVisibleProjects)

    // 지도 줌 변경 시 필터링 (기존 줌 이벤트와 별개)
    const zoomListener = naver.maps.Event.addListener(map, 'zoom_changed', updateVisibleProjects)

    // 클린업
    return () => {
      naver.maps.Event.removeListener(dragendListener)
      naver.maps.Event.removeListener(zoomListener)
    }
  }, [allProjects, isMapReady])

  // ========================================
  // 4. 사용자 위치 변경 시 지도 중심 이동 + 사용자 마커 업데이트 (로그인 시에만)
  // ========================================
  useEffect(() => {
    // 로그인 안 했거나 위치 정보가 없으면 사용자 마커 표시 안 함
    if (!mapInstanceRef.current || !userLocation || !userLocation.latitude || !userLocation.longitude || !window.naver || !window.naver.maps) {
      return
    }

    const map = mapInstanceRef.current

    try {
      const userPosition = new naver.maps.LatLng(userLocation.latitude, userLocation.longitude)

      // 지도 중심을 사용자 위치로 이동
      map.setCenter(userPosition)

      // 기존 사용자 마커 제거
      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.setMap(null)
        } catch (error) {
        }
      }

      // 새로운 사용자 마커 생성 (파란색 핀)
      const userMarker = new naver.maps.Marker({
        position: userPosition,
        map: map,
        title: '내 위치',
        icon: {
          content: '<div style="display: flex; flex-direction: column; align-items: center;"><i class="bi bi-geo-alt-fill" style="font-size: 10pt; color: #0066FF;"></i></div>',
          anchor: new naver.maps.Point(8, 24)
        },
        zIndex: 1000
      })

      userMarkerRef.current = userMarker

    } catch (error) {
      console.error('사용자 마커 업데이트 실패:', error)
    }
  }, [userLocation.latitude, userLocation.longitude])

  // ========================================
  // 5. 보이는 프로젝트 목록 변경 시 마커 업데이트
  // ========================================
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !window.naver || !window.naver.maps) {
      return
    }

    const map = mapInstanceRef.current

    // 기존 프로젝트 마커들 모두 제거 (안전하게)
    projectMarkersRef.current.forEach(marker => {
      try {
        if (marker && marker.setMap) {
          marker.setMap(null)
        }
      } catch (error) {
      }
    })
    projectMarkersRef.current = []

    // 프로젝트가 없으면 종료
    if (!visibleProjects || visibleProjects.length === 0) {
      return
    }

    // 각 프로젝트에 대해 마커 생성
    visibleProjects.forEach((project, index) => {
      // 위도/경도가 없는 경우 스킵
      if (!project.latitude || !project.longitude) {
        return
      }

      try {
        const projectPosition = new naver.maps.LatLng(
          project.latitude,
          project.longitude
        )

        const projectTitle = project.projectTitle || project.projectTtl || '프로젝트'

        // 프로젝트 마커 생성 (빨간색 핀 + 타이틀)
        const marker = new naver.maps.Marker({
          position: projectPosition,
          map: map,
          title: projectTitle,
          icon: {
            content: `
              <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                <i class="bi bi-geo-alt-fill" style="font-size: 9pt; color: #FF4444;"></i>
                <div style="font-size: 7pt; font-weight: bold; color: #333; background: rgba(255, 255, 255, 0.9); padding: 1px 3px; border-radius: 3px; white-space: nowrap; margin-top: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                  ${projectTitle}
                </div>
              </div>
            `,
            anchor: new naver.maps.Point(8, 24)
          },
          zIndex: 999
        })

        // 마커 클릭 이벤트 등록
        naver.maps.Event.addListener(marker, 'click', () => {
          if (onMarkerClick) {
            onMarkerClick(project)
          }
        })

        // 마커 배열에 추가
        projectMarkersRef.current.push(marker)
      } catch (error) {
        console.error(`프로젝트 ${project.projectSq} 마커 생성 실패:`, error)
      }
    })

  }, [visibleProjects, isMapReady, onMarkerClick])

  // ========================================
  // 6. 줌 컨트롤 함수들
  // ========================================
  const zoomIn = () => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current
    const currentZoom = map.getZoom()
    if (currentZoom < 18) {
      map.setZoom(currentZoom + 1)
    }
  }

  const zoomOut = () => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current
    const currentZoom = map.getZoom()
    if (currentZoom > 10) {
      map.setZoom(currentZoom - 1)
    }
  }

  // ========================================
  // 7. 필터 관련 핸들러
  // ========================================
  const handleFilterChange = (filters) => {
    if (onFilterChange) onFilterChange(filters)
    setShowFilterModal(false)
  }

  const handleOpenLocationModal = () => {
    setShowFilterModal(false)
    if (onOpenLocationModal) onOpenLocationModal()
  }

  // ========================================
  // 렌더링
  // ========================================
  return (
    <div className="map-section">
      {/* 주소 표시 + 필터 버튼 (로그인 시에만 주소 표시) */}
      {showControls && (
        <div className="current-location mb-3 p-3 bg-light rounded">
          <div className="d-flex align-items-center justify-content-between">
            {/* 로그인 했을 때만 주소 표시 */}
            {userLocation && userLocation.address && (
              <div>
                <strong className="text-color-dark">{userLocation.address}</strong>
              </div>
            )}
            {/* 로그인 안 했을 때 안내 문구 */}
            {(!userLocation || !userLocation.address) && (
              <div>
                <span className="text-muted">전국 프로젝트 지도</span>
              </div>
            )}
            {/* 필터 버튼 */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="btn btn-rounded btn-primary btn-sm d-flex align-items-center"
            >
              <i className="bi bi-funnel me-1"></i>필터
            </button>
          </div>
        </div>
      )}

      {/* 지도 영역 - 네이버 지도가 여기에 렌더링됩니다 */}
      <div 
        className="map-wrapper border rounded position-relative" 
        style={{ height: `${mapHeight}px`, overflow: 'hidden' }}
      >
        {/* 네이버 Dynamic Map이 렌더링될 DOM 요소 */}
        <div 
          ref={mapRef}
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'relative'
          }}
        />

        {/* 로딩 상태 표시 */}
        {!isMapReady && (
          <div 
            className="map-placeholder d-flex justify-content-center align-items-center h-100 bg-light"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9999
            }}
          >
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">로딩 중...</span>
              </div>
              <p className="mt-2 text-muted">지도 로딩 중...</p>
            </div>
          </div>
        )}

        {/* 줌 컨트롤 */}
        {showControls && (
          <div className="zoom-controls position-absolute top-0 end-0 m-3" style={{ zIndex: 1000 }}>
            <div className="btn-group-vertical" role="group">
              <button
                onClick={zoomIn}
                className="btn btn-light btn-sm border shadow-sm"
                disabled={mapZoom >= 18}
                title="확대"
              >
                <i className="bi bi-plus"></i>
              </button>
              <button
                onClick={zoomOut}
                className="btn btn-light btn-sm border shadow-sm"
                disabled={mapZoom <= 10}
                title="축소"
              >
                <i className="bi bi-dash"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 범례 */}
      {showControls && (
        <div className="map-legend mt-3 p-4 bg-light rounded">
          <div className="d-flex gap-5">
            {/* 로그인 했을 때만 "내 주소" 표시 */}
            {userLocation && userLocation.latitude && userLocation.longitude && (
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt-fill me-2 fs-5" style={{ color: '#0066FF' }}></i>
                <span className="text-muted fw-bold">기준 위치</span>
              </div>
            )}
            <div className="d-flex align-items-center">
              <i className="bi bi-geo-alt-fill me-2" style={{ fontSize: '1.1rem', color: '#FF4444' }}></i>
              <span className="text-muted fw-bold">프로젝트 위치</span>
            </div>
            <div className="d-flex align-items-center">
              <span className="text-muted fw-bold">
                총 {visibleProjects.length}개 프로젝트
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 필터 모달 */}
      {showFilterModal && showControls && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title text-color-dark">
                <i className="bi bi-funnel me-2"></i>검색 필터
              </h5>
              <button onClick={() => setShowFilterModal(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <MapFilterComponent
                currentFilters={currentFilters}
                userLocation={userLocation}
                tempSelectedLocation={tempSelectedLocation}
                onFilterChange={handleFilterChange}
                onOpenLocationModal={handleOpenLocationModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default MapComponent
