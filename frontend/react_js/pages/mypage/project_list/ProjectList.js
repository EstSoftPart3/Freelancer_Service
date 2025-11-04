import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CommonPageHeader from '../../../components/common/CommonPageHeader';
import ProjectFilterBar from '../../../components/common/ProjectFilterBar';
import ProjectCardGroup from '../../../components/project/ProjectCardGroup';
import CommonPagination from '../../../components/common/CommonPagination';
import MapComponent from '../../../components/map/MapComponent';
import LocationSelectModal from '../../../components/map/LocationSelectModal';
import { useUserStore } from '../../../store/userStore';
import api from '../../../utils/api';
import qs from 'qs';
import './ProjectListPage.css';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStore = useUserStore();
  const mapComponentRef = useRef(null);

  // 탭 상태
  const [activeTab, setActiveTab] = useState('list');

  // 리스트 탭 상태
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
    page: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projects, setProjects] = useState([]);

  // 지도 탭 상태
  const [mapUserLocation, setMapUserLocation] = useState({
    latitude: null,
    longitude: null,
    address: '위치 정보 로딩 중...'
  });
  const [mapProjects, setMapProjects] = useState([]);
  const [mapImageUrl, setMapImageUrl] = useState('');
  const [mapZoom, setMapZoom] = useState(13);
  const [locationType, setLocationType] = useState('address');
  const [tempSelectedLocation, setTempSelectedLocation] = useState(null);
  const [currentMapFilters, setCurrentMapFilters] = useState({
    locationType: 'address',
    radius: '5',
    jobRole: '',
    keyword: ''
  });
  const [selectedMapProject, setSelectedMapProject] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProjectListModal, setShowProjectListModal] = useState(false);
  const [selectedCompanyProjects, setSelectedCompanyProjects] = useState([]);

  // 초기 로드
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('tab') === 'map') {
      setActiveTab('map');
      initializeMapTab();
    } else {
      fetchProjects();
    }
  }, []);

  // 페이지 변경 감지
  useEffect(() => {
    if (activeTab === 'list') {
      setFilters(prev => ({ ...prev, page: currentPage }));
      fetchProjects();
    }
  }, [currentPage]);

  // 탭 전환 감지
  useEffect(() => {
    if (activeTab === 'map') {
      console.log('=== 지도 탭 활성화 ===');
      initializeMapTab();
    } else if (activeTab === 'list') {
      console.log('=== 리스트 탭 활성화 ===');
      if (projects.length === 0) {
        fetchProjects();
      }
    }
  }, [activeTab]);

  // 프로젝트 목록 조회
  const fetchProjects = async () => {
    try {
      const params = { ...filters };
      const queryString = qs.stringify(params, { arrayFormat: 'repeat' });
      const response = await api.get(`/projects?${queryString}`);
      setProjects(response.output.projects);

      const totalCount = response.output.totalCount ?? 0;
      setTotalPages(Math.max(1, Math.ceil(totalCount / filters.size)));
    } catch (e) {
      console.error('프로젝트 정보 불러오기 실패', e);
    }
  };

  // 필터 업데이트
  const updateFilters = (updated) => {
    setFilters(prev => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  // ========== 지도 탭 관련 기능 ==========

  // 지도 탭 초기화
  const initializeMapTab = async () => {
    try {
      console.log('지도 초기화 시작...');
      const location = await getMapUserLocation();
      console.log('위치 조회 완료:', location);

      setMapUserLocation(location);

      const zoom = calculateZoomLevel(currentMapFilters.radius || '5');
      setMapZoom(zoom);
      console.log(`초기 줌 레벨: ${zoom}`);

      setMapImageUrl(generateMapImageUrl(location, zoom));
      console.log('지도 URL 생성 완료');

      await fetchMapProjects(location);
    } catch (error) {
      console.error('지도 초기화 실패:', error);
      alert('지도 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
    }
  };

  // 좌표를 주소로 변환
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      console.log('=== 프론트엔드 좌표 검증 ===');
      console.log('입력된 좌표:', lat, lng);
      console.log('좌표 타입:', typeof lat, typeof lng);
      console.log('좌표 유효성:', !isNaN(lat), !isNaN(lng));
      console.log('=== 지오코딩 API 호출 ===');

      const response = await api.get('/map/naver/geocoding', {
        params: {
          latitude: lat,
          longitude: lng
        }
      });

      console.log('=== 지오코딩 API 응답 분석 ===');
      console.log('전체 응답:', response);
      console.log('response.output:', response.output);
      console.log('response.address:', response.address);

      if (response.output && response.output.address) {
        console.log('✅ output.address 사용:', response.output.address);
        return response.output.address;
      } else if (response.address) {
        console.log('✅ 직접 address 사용:', response.address);
        return response.address;
      } else {
        console.log('❌ 주소 정보 없음, 좌표 표시');
        return `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`;
      }
    } catch (error) {
      console.error('주소 변환 실패:', error);
      return `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`;
    }
  };

  // 사용자 위치 가져오기
  const getMapUserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('이 브라우저는 위치 정보를 지원하지 않습니다.');
        resolve({
          latitude: 37.5665,
          longitude: 126.9780,
          address: '서울시 중구 (기본값)'
        });
        return;
      }

      const userId = localStorage.getItem('userSq') || userStore.userSq || 0;
      console.log('사용자 ID로 주소 조회:', userId);

      api.get(`/map/user-address?userId=${userId}`)
        .then(response => {
          console.log('주소 API 응답:', response);
          const data = response.data || response.output || response;
          const location = {
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address
          };
          console.log('사용자 등록 주소 사용:', location);
          resolve(location);
        })
        .catch(async (error) => {
          console.log('사용자 주소 정보 조회 실패:', error);
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              console.log('GPS 정확도:', position.coords.accuracy, 'm');

              const address = await getAddressFromCoordinates(lat, lng);

              const location = {
                latitude: lat,
                longitude: lng,
                address: address || '현재 위치'
              };
              console.log('현재 위치 사용:', location);
              resolve(location);
            },
            (error) => {
              console.log('위치 정보 획득 실패:', error.message);
              const defaultLocation = {
                latitude: 37.5665,
                longitude: 126.9780,
                address: '서울시 중구 (기본값)'
              };
              console.log('기본 위치 사용:', defaultLocation);
              resolve(defaultLocation);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
    });
  };

  // 반경에 따른 줌 레벨 계산
  const calculateZoomLevel = (radius) => {
    const radiusNum = parseFloat(radius);

    if (radiusNum <= 3) return 14;
    if (radiusNum <= 5) return 13;
    if (radiusNum <= 10) return 12;
    if (radiusNum <= 20) return 11;
    return 10;
  };

  // 지도 이미지 URL 생성
  const generateMapImageUrl = (location = mapUserLocation, zoom = mapZoom) => {
    if (!location.latitude || !location.longitude) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwN2JmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyekO2UhOyngCDrqZTsl4zsnoE8L3RleHQ+PC9zdmc+';
    }

    const centerLat = location.latitude;
    const centerLon = location.longitude;
    return `/api/map/naver/static?centerLon=${centerLon}&centerLat=${centerLat}&width=800&height=500&level=${zoom}`;
  };

  // 지도 프로젝트 검색
  const fetchMapProjects = async (location = mapUserLocation) => {
    try {
      console.log('=== 프로젝트 조회 시작 ===');
      console.log('사용자 위치:', location);
      console.log('필터 조건:', currentMapFilters);

      const params = currentMapFilters.locationType === 'address'
        ? {
            userId: userStore.userSq || 0,
            radius: currentMapFilters.radius,
            jobType: currentMapFilters.jobRole || '',
            searchKeyword: currentMapFilters.keyword || '',
            page: 0,
            size: 20
          }
        : {
            lat: location.latitude,
            lon: location.longitude,
            radius: currentMapFilters.radius,
            jobType: currentMapFilters.jobRole || '',
            searchKeyword: currentMapFilters.keyword || '',
            page: 0,
            size: 20
          };
      console.log('API 요청 파라미터:', params);

      const response = await api.get('/map/search', { params });
      console.log('API 응답:', response);

      const projects = response.output?.projects || response.projects || [];
      setMapProjects(projects);
      console.log('조회된 프로젝트 수:', projects.length);
    } catch (error) {
      console.error('지도 프로젝트 조회 실패:', error);
      setMapProjects([]);
    }
  };

  // 필터 변경 핸들러
  const handleMapFilterChange = async (filters) => {
    try {
      console.log('필터 변경:', filters);

      setCurrentMapFilters({ ...filters });
      setLocationType(filters.locationType);

      const zoom = calculateZoomLevel(filters.radius);
      setMapZoom(zoom);
      console.log(`📍 반경 ${filters.radius}km → 줌 레벨 ${zoom}로 자동 조정`);

      let searchLat, searchLng;

      if (filters.locationType === 'address') {
        console.log('=== 내 주소로 변경 ===');
        const userAddress = await getMapUserLocation();
        console.log('사용자 등록 주소 재조회:', userAddress);

        setMapUserLocation(userAddress);
        searchLat = userAddress.latitude;
        searchLng = userAddress.longitude;

        setMapImageUrl(generateMapImageUrl(userAddress, zoom));
        console.log('=== 내 주소로 변경 완료 ===');
      } else if (filters.locationType === 'current') {
        console.log('=== 현재 위치 선택 시작 ===');
        const currentPos = await getCurrentPosition();
        console.log('현재 위치 좌표:', currentPos);

        const address = await getAddressFromCoordinates(currentPos.latitude, currentPos.longitude);
        console.log('지오코딩 결과 주소:', address);

        const newLocation = {
          latitude: currentPos.latitude,
          longitude: currentPos.longitude,
          address: address
        };
        setMapUserLocation(newLocation);
        console.log('mapUserLocation 업데이트:', newLocation);

        searchLat = currentPos.latitude;
        searchLng = currentPos.longitude;
        setMapImageUrl(generateMapImageUrl(newLocation, zoom));
        console.log('=== 현재 위치 선택 완료 ===');
      } else if (filters.locationType === 'custom') {
        console.log('=== 위치 선택 모드 ===');
        console.log('tempSelectedLocation:', tempSelectedLocation);

        if (tempSelectedLocation) {
          const newLocation = {
            latitude: tempSelectedLocation.latitude,
            longitude: tempSelectedLocation.longitude,
            address: tempSelectedLocation.address
          };
          setMapUserLocation(newLocation);

          searchLat = tempSelectedLocation.latitude;
          searchLng = tempSelectedLocation.longitude;
          console.log('✅ 선택된 위치로 검색:', tempSelectedLocation.address);

          setMapImageUrl(generateMapImageUrl(newLocation, zoom));
        } else {
          console.log('⚠️ 위치를 먼저 선택해주세요');
          alert('위치를 먼저 선택해주세요.');
          return;
        }
      }

      console.log('=== API 호출 전 검증 ===');
      console.log('필터 타입:', filters.locationType);
      console.log('검색 좌표 - searchLat:', searchLat, 'searchLng:', searchLng);

      const params = filters.locationType === 'address'
        ? {
            userId: userStore.userSq || 0,
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
          };

      console.log('=== 최종 API 요청 파라미터 ===');
      console.log('params:', params);

      const response = await api.get('/map/search', { params });
      console.log('=== API 응답 분석 ===');
      console.log('전체 응답:', response);

      const projects = response.output?.projects || response.projects || [];
      setMapProjects(projects);
      console.log('조회된 프로젝트 수:', projects.length);

      setMapImageUrl(generateMapImageUrl(mapUserLocation, zoom));
    } catch (error) {
      console.error('지도 프로젝트 조회 실패:', error);
      setMapProjects([]);
    }
  };

  // 현재 위치 가져오기
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
        reject(new Error('위치 정보 미지원'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('GPS 정확도:', position.coords.accuracy, 'm');

          if (position.coords.accuracy > 1000) {
            console.warn('⚠️ GPS 정확도가 낮습니다:', position.coords.accuracy, 'm');
          }

          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('위치 정보 획득 실패:', error);
          alert('위치 정보를 가져올 수 없습니다.');
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // 위치 선택 모달 핸들러
  const handleOpenLocationModal = () => {
    setShowLocationModal(true);
  };

  const handleMapLocationSelected = async (location) => {
    console.log('위치 선택됨:', location);

    if (!location || isNaN(location.latitude) || isNaN(location.longitude)) {
      alert('유효하지 않은 좌표입니다. 주소를 다시 선택해주세요.');
      return;
    }

    setTempSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address
    });

    setCurrentMapFilters(prev => ({ ...prev, locationType: 'custom' }));
    setShowLocationModal(false);

    console.log('✅ 위치가 임시 저장되었습니다. 검색 버튼을 눌러주세요.');

    setTimeout(() => {
      if (mapComponentRef.current) {
        mapComponentRef.current.openFilterModal();
        console.log('💡 필터를 조정하고 검색 버튼을 클릭하세요!');
      }
    }, 300);
  };

  // 줌 변경 핸들러
  const handleMapZoomChange = (zoom) => {
    setMapZoom(zoom);
    setMapImageUrl(generateMapImageUrl(mapUserLocation, zoom));
  };

  // 지도 업데이트 핸들러
  const handleMapUpdate = (newLocation) => {
    setMapUserLocation(newLocation);
    setMapImageUrl(generateMapImageUrl(newLocation, mapZoom));
  };

  // 마커 클릭 핸들러
  const handleMapMarkerClick = (project) => {
    console.log('=== 마커 클릭 이벤트 ===');
    console.log('클릭한 프로젝트:', project);

    const companyProjects = mapProjects.filter(
      p => p.companyName === project.companyName
    );

    console.log(`${project.companyName} 프로젝트 개수:`, companyProjects.length);

    if (companyProjects.length === 1) {
      console.log('→ 1개 프로젝트 → 상세 모달 표시');
      setSelectedMapProject(project);
    } else {
      console.log('→ 2개+ 프로젝트 → 리스트 모달 표시');
      setSelectedCompanyProjects(companyProjects);
      setShowProjectListModal(true);
    }
  };

  // 리스트에서 프로젝트 선택 시
  const handleSelectProjectFromList = (project) => {
    setShowProjectListModal(false);
    setSelectedMapProject(project);
  };

  // 프로젝트 상세보기
  const handleMapProjectClick = (project) => {
    const userType = userStore.userTypeCd === 'COMPANY' ? 'company' : 'user';
    navigate(`/project/spec/${userType}/${project.projectSq}`);
    setSelectedMapProject(null);
  };

  // 경로 안내
  const handleMapRouteClick = (project) => {
    console.log('=== 경로 안내 클릭 ===');
    console.log('프로젝트:', project);
    console.log('네이버 맵 URL:', project.naverMapUrl);

    if (project.naverMapUrl) {
      console.log('✅ URL 존재 - 새 창 열기:', project.naverMapUrl);
      window.open(project.naverMapUrl, '_blank');
    } else {
      console.error('❌ naverMapUrl이 없습니다!');
    }
    setSelectedMapProject(null);
  };

  // 거리 계산 함수 (Haversine 공식)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 날짜 포맷팅 함수들
  const formatDeadlineWithDate = (deadline) => {
    if (!deadline) return '미정';
    const today = new Date();
    const endDate = new Date(deadline);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dateStr = endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    if (diffDays < 0) return `${dateStr} (마감)`;
    if (diffDays === 0) return `${dateStr} (D-0)`;
    return `${dateStr} (D-${diffDays})`;
  };

  const formatSalary = (salary) => {
    if (!salary) return '미정';
    return `${salary.toLocaleString()}원`;
  };

  const getProjectDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '미정';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMonths = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));

    const startStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const endStr = end.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    return `${startStr} ~ ${endStr} (${diffMonths}개월)`;
  };

  return (
    <div>
      <CommonPageHeader
        title=""
        strongText="프로젝트 목록"
        breadcrumbs={[{ text: 'Home', link: '/' }, { text: '프로젝트' }]}
      />

      {/* 탭을 필터 위로 이동 */}
      <div className="container">
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
        <ProjectFilterBar
          localFilters={['서울', '부산', '대구']}
          careerFilters={['신입', '경력']}
          jobTypeFilters={['백엔드', '프론트엔드', 'PM', '디자이너']}
          onUpdate={updateFilters}
        />
      )}

      <div className="container py-4">
        {/* 리스트 탭 내용 */}
        {activeTab === 'list' && (
          <div>
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-rounded btn-primary me-2" onClick={fetchProjects}>
                검색
              </button>
              {userStore.userTypeCd === 'COMPANY' && (
                <a
                  href="/mypage/projectPostPage"
                  className="btn btn-rounded btn-light"
                >
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
            <div>
              <CommonPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

        {/* 지도 탭 내용 */}
        {activeTab === 'map' && (
          <div>
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
                  onMarkerClick={handleMapMarkerClick}
                  onZoomChange={handleMapZoomChange}
                  onLocationSelected={handleMapLocationSelected}
                  onUpdateMap={handleMapUpdate}
                  onFilterChange={handleMapFilterChange}
                  onOpenLocationModal={handleOpenLocationModal}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 프로젝트 리스트 모달 (여러 공고) */}
      {showProjectListModal && (
        <div className="modal-overlay" onClick={() => setShowProjectListModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h5 className="modal-title text-color-dark">
                <i className="bi bi-building me-2"></i>
                {selectedCompanyProjects[0]?.companyName} 프로젝트 목록
              </h5>
              <button onClick={() => setShowProjectListModal(false)} className="btn-close">×</button>
            </div>

            <div className="modal-body">
              <p className="text-muted mb-3">
                총 {selectedCompanyProjects.length}개의 프로젝트가 있습니다. 원하는 프로젝트를 선택하세요.
              </p>

              {/* 프로젝트 리스트 */}
              <div className="project-list">
                {selectedCompanyProjects.map((project) => (
                  <div
                    key={project.projectSq}
                    className="project-item"
                    onClick={() => handleSelectProjectFromList(project)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{project.projectTitle}</h6>
                        <p className="text-muted mb-1 small">
                          <i className="bi bi-briefcase me-1"></i>{project.jobType}
                        </p>
                        <p className="text-muted mb-0 small">
                          <i className="bi bi-calendar me-1"></i>
                          {formatDeadlineWithDate(project.recruitEndDt)}
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-primary">
                          {project.distance}km
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 지도 마커 클릭 모달 */}
      {selectedMapProject && (
        <div className="modal-overlay" onClick={() => setSelectedMapProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title text-color-dark">
                프로젝트 정보
              </h5>
              <button onClick={() => setSelectedMapProject(null)} className="btn-close"></button>
            </div>

            <div className="modal-body">
              <div className="project-info">
                <h6 className="text-color-dark fw-bold">{selectedMapProject.projectTitle}</h6>
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

                {/* 추가 정보 */}
                <div className="border-top pt-3 mt-3">
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted">모집 마감일</small>
                      <div className="fw-bold">{formatDeadlineWithDate(selectedMapProject.recruitEndDt)}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">급여</small>
                      <div className="fw-bold">{formatSalary(selectedMapProject.projectSalary)}</div>
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
  );
};

export default ProjectListPage;
