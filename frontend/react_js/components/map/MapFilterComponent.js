import { useState, useEffect, useMemo } from 'react'
import styles from './MapFilterComponent.module.css'

export default function MapFilterComponent({ 
  currentFilters = {
    locationType: 'address',
    radius: '5',
    jobRole: '',
    keyword: ''
  },
  userLocation = { address: '위치 정보 없음' },
  tempSelectedLocation = null,
  onFilterChange,
  onOpenLocationModal
}) {
  // 필터 상태
  const [filters, setFilters] = useState({
    locationType: currentFilters.locationType || 'address',
    radius: currentFilters.radius || '5',
    jobRole: currentFilters.jobRole || '',
    keyword: currentFilters.keyword || ''
  })

  // 표시할 주소 계산
  const displayAddress = useMemo(() => {
    if (filters.locationType === 'custom' && tempSelectedLocation) {
      return tempSelectedLocation.address
    }
    return userLocation?.address || '위치 정보 없음'
  }, [filters.locationType, tempSelectedLocation, userLocation])

  // props 변경 감지하여 필터 업데이트
  useEffect(() => {
    if (currentFilters) {
      setFilters({
        locationType: currentFilters.locationType || 'address',
        radius: currentFilters.radius || '5',
        jobRole: currentFilters.jobRole || '',
        keyword: currentFilters.keyword || ''
      })
    }
  }, [currentFilters])

  // 위치 선택 버튼 클릭 핸들러
  const selectCustomLocation = () => {
    setFilters(prev => ({ ...prev, locationType: 'custom' }))
    onOpenLocationModal()
  }

  // 필터 초기화
  const resetFilters = () => {
    const defaultFilters = {
      locationType: 'address',
      radius: '5',
      jobRole: '',
      keyword: ''
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  // 필터 적용
  const applyFilters = () => {
    onFilterChange(filters)
  }

  // 필드 업데이트 핸들러
  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={styles.filterSection}>
      {/* 위치 기준 선택 (세그먼트 버튼) */}
      <div className="mb-3">
        <label className={`form-label ${styles.textColorDark} fw-bold d-block mb-2`}>기준</label>
        <div className="btn-group w-100" role="group" aria-label="위치 기준 선택">
          <button
            type="button"
            className={`btn btn-rounded ${filters.locationType === 'address' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => updateFilter('locationType', 'address')}
          >
            내 주소
          </button>
          <button
            type="button"
            className={`btn btn-rounded ${filters.locationType === 'current' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => updateFilter('locationType', 'current')}
          >
            현재 위치
          </button>
          <button
            type="button"
            className={`btn btn-rounded ${filters.locationType === 'custom' ? 'btn-primary' : 'btn-light'}`}
            onClick={selectCustomLocation}
          >
            위치 선택
          </button>
        </div>
      </div>

      {/* 선택된 위치 정보 (마커 아이콘 + 주소만) */}
      <div className={`${styles.selectedLocationSimple} mb-3`}>
        <i className="bi bi-geo-alt-fill text-primary me-2"></i>
        <span className={styles.textColorDark}>{displayAddress}</span>
      </div>

      {/* 반경 필터 (칩 버튼) */}
      <div className="mb-3">
        <label className={`form-label ${styles.textColorDark} fw-bold d-block mb-2`}>반경</label>
        <div className={`${styles.radiusChips} d-flex gap-2`}>
          {[3, 5, 10, 20].map(r => (
            <button
              key={r}
              type="button"
              className={`btn btn-rounded ${filters.radius === String(r) ? 'btn-primary' : 'btn-light'}`}
              onClick={() => updateFilter('radius', String(r))}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        {/* 직무 필터 */}
        <div className="col-md-6 mb-3">
          <label className={`form-label ${styles.textColorDark} fw-bold`}>직무</label>
          <select 
            value={filters.jobRole} 
            onChange={(e) => updateFilter('jobRole', e.target.value)}
            className="form-select"
          >
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

        {/* 검색 입력 */}
        <div className="col-md-6 mb-3">
          <label className={`form-label ${styles.textColorDark} fw-bold`}>검색어</label>
          <input
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword', e.target.value)}
            type="text"
            className="form-control"
            placeholder="프로젝트명, 기업명 검색"
          />
        </div>
      </div>

      {/* 버튼들 */}
      <div className="d-flex gap-2 mt-3">
        <button onClick={resetFilters} className="btn btn-rounded btn-light flex-fill">
          초기화
        </button>
        <button onClick={applyFilters} className="btn btn-rounded btn-primary flex-fill">
          검색
        </button>
      </div>
    </div>
  )
}

