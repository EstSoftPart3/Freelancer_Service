import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import MapFilterComponent from './MapFilterComponent'
import styles from './MapComponent.module.css'

const MapComponent = forwardRef(function MapComponent({
  userLocation,
  projects = [],
  mapImageUrl = '',
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
  
  // 마커 관련 상태
  const [visibleProjects, setVisibleProjects] = useState([])

  // 프로젝트 변경 감지
  useEffect(() => {
    console.log('프로젝트 변경 감지:', projects)
    setVisibleProjects(projects || [])
  }, [projects])

  // 사용자 위치 변경 감지
  useEffect(() => {
    if (userLocation && onUpdateMap) {
      console.log('사용자 위치 변경:', userLocation)
      onUpdateMap(userLocation)
    }
  }, [userLocation, onUpdateMap])

  // 줌 컨트롤 함수들
  const zoomIn = () => {
    if (mapZoom < 18) {
      const newZoom = mapZoom + 1
      setMapZoom(newZoom)
      if (onZoomChange) onZoomChange(newZoom)
    }
  }

  const zoomOut = () => {
    if (mapZoom > 10) {
      const newZoom = mapZoom - 1
      setMapZoom(newZoom)
      if (onZoomChange) onZoomChange(newZoom)
    }
  }

  // 사용자 마커 스타일 계산
  const getUserMarkerStyle = () => {
    if (!userLocation?.latitude || !userLocation?.longitude) return {}
    
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -100%)',
      zIndex: 1000
    }
  }

  // 프로젝트 마커 스타일 계산
  const getProjectMarkerStyle = (project) => {
    if (!project.latitude || !project.longitude) return {}
    
    const userLat = userLocation.latitude
    const userLng = userLocation.longitude
    const projectLat = project.latitude
    const projectLng = project.longitude
    
    // 위도/경도 차이 계산
    const latDiff = projectLat - userLat
    const lngDiff = projectLng - userLng
    
    // 줌 레벨에 따른 스케일
    const zoomScale = Math.pow(2, mapZoom - 16)
    
    // 1도당 픽셀 수
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
    if (onMarkerClick) onMarkerClick(project)
  }

  // 필터 변경 핸들러
  const handleFilterChange = (filters) => {
    console.log('필터 변경 (MapComponent):', filters)
    if (onFilterChange) onFilterChange(filters)
    setShowFilterModal(false)
  }

  // 이미지 로드 성공 처리
  const handleImageLoad = (event) => {
    console.log('지도 이미지 로드 성공!', event.target.src)
  }

  // 이미지 오류 처리
  const handleImageError = (event) => {
    console.error('지도 이미지 로드 실패:', event.target.src)
    
    const errorSvg = `
      <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e9ecef"/>
        <text x="400" y="250" font-family="Arial" font-size="18" fill="#6c757d" text-anchor="middle">지도를 불러오는 중입니다...</text>
      </svg>
    `
    event.target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(errorSvg)))}`
  }

  // 위치 선택 모달 열기 핸들러
  const handleOpenLocationModal = () => {
    setShowFilterModal(false)
    if (onOpenLocationModal) onOpenLocationModal()
  }

  return (
    <div className="map-section">
      {/* 주소 표시 + 필터 버튼 */}
      {showControls && (
        <div className="current-location mb-3 p-3 bg-light rounded">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <strong className="text-color-dark">{userLocation.address}</strong>
            </div>
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

      {/* 지도 영역 */}
      <div 
        className="map-wrapper border rounded position-relative" 
        style={{ height: `${mapHeight}px`, overflow: 'hidden' }}
      >
        {/* 네이버 지도 이미지 */}
        {mapImageUrl ? (
          <img
            src={mapImageUrl}
            alt="지도"
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="map-placeholder d-flex justify-content-center align-items-center h-100 bg-light">
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
          <div className="zoom-controls position-absolute top-0 end-0 m-3">
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

        {/* 사용자 위치 마커 */}
        {userLocation.latitude && userLocation.longitude && (
          <div
            className="user-marker position-absolute"
            style={getUserMarkerStyle()}
            title="내 위치"
          >
            <i className="bi bi-geo-alt-fill text-primary" style={{ fontSize: '10pt' }}></i>
          </div>
        )}

        {/* 프로젝트 마커들 */}
        {visibleProjects.map(project => (
          <div
            key={project.projectSq}
            className="project-marker-container position-absolute"
            style={getProjectMarkerStyle(project)}
            onClick={() => handleMarkerClick(project)}
            title={project.projectTitle || project.projectTtl}
          >
            {/* 마커 아이콘 */}
            <i className="bi bi-geo-alt-fill text-danger" style={{ fontSize: '9pt' }}></i>
            
            {/* 줌 레벨 13 이상일 때만 라벨 표시 (5km부터) */}
            {mapZoom >= 13 && (
              <div className="marker-label">
                {project.projectTitle || project.projectTtl}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 범례 */}
      {showControls && (
        <div className="map-legend mt-3 p-4 bg-light rounded">
          <div className="d-flex gap-5">
            <div className="d-flex align-items-center">
              <i className="bi bi-geo-alt-fill text-primary me-2 fs-5"></i>
              <span className="text-muted fw-bold">내 주소</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="bi bi-geo-alt-fill text-danger me-2" style={{ fontSize: '1.1rem' }}></i>
              <span className="text-muted fw-bold">프로젝트 위치</span>
            </div>
            <div className="d-flex align-items-center">
              <span className="text-muted fw-bold">
                {showRadiusText ? '주소 5km 내 ' : ''}총 {projects.length}개 프로젝트
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
