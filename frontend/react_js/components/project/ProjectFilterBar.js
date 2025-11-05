import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/axios'
import styles from './ProjectFilterBar.module.css'

export default function ProjectFilterBar({ onUpdate }) {
  const { user } = useAuth()
  
  // API로부터 가져올 옵션들
  const [localOptions, setLocalOptions] = useState([])
  const [careerOptions, setCareerOptions] = useState([])
  const [educationOptions, setEducationOptions] = useState([])
  const [jobTypeOptions, setJobTypeOptions] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 선택된 값들 (다중 선택)
  const [selectedRegions, setSelectedRegions] = useState([])
  const [selectedCareers, setSelectedCareers] = useState([])
  const [selectedEducations, setSelectedEducations] = useState([])
  const [selectedJobTypes, setSelectedJobTypes] = useState([])

  // 기타 필터 값
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedTargetField, setSelectedTargetField] = useState('전체')
  const [selectedSort, setSelectedSort] = useState('최신순')
  const [selectedPublicStatus, setSelectedPublicStatus] = useState('전체')

  // 관리자 여부 확인 (SSR safe)
  const [userType, setUserType] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const type = localStorage.getItem('userType') || user?.userType
    setUserType(type)
    setIsAdmin(type === 'ADMIN')
  }, [user])

  // 드롭다운 버튼 텍스트 (웹용 - 전체 표시)
  const selectedRegionText = useMemo(() => {
    if (selectedRegions.length === 0) return '지역 (전체)'
    if (selectedRegions.length === 1) {
      const selected = localOptions.find(opt => opt.areaSq === selectedRegions[0])
      return selected ? selected.areaName : '지역'
    }
    return `지역 (${selectedRegions.length}개)`
  }, [selectedRegions, localOptions])

  const selectedCareerText = useMemo(() => {
    if (selectedCareers.length === 0) return '경력 (전체)'
    if (selectedCareers.length === 1) {
      const selected = careerOptions.find(opt => opt.common_code_sq === selectedCareers[0])
      return selected ? selected.common_code_nm : '경력'
    }
    return `경력 (${selectedCareers.length}개)`
  }, [selectedCareers, careerOptions])

  const selectedEducationText = useMemo(() => {
    if (selectedEducations.length === 0) return '학력 (전체)'
    if (selectedEducations.length === 1) {
      const selected = educationOptions.find(opt => opt.common_code_sq === selectedEducations[0])
      return selected ? selected.common_code_nm : '학력'
    }
    return `학력 (${selectedEducations.length}개)`
  }, [selectedEducations, educationOptions])

  const selectedJobTypeText = useMemo(() => {
    if (selectedJobTypes.length === 0) return '직종 (전체)'
    if (selectedJobTypes.length === 1) {
      const selected = jobTypeOptions.find(opt => opt.common_code_sq === selectedJobTypes[0])
      return selected ? selected.common_code_nm : '직종'
    }
    return `직종 (${selectedJobTypes.length}개)`
  }, [selectedJobTypes, jobTypeOptions])

  // 모바일용 텍스트 (간략 - 전체 표시 안 함)
  const selectedRegionTextMobile = useMemo(() => {
    if (selectedRegions.length === 0) return '지역'
    if (selectedRegions.length === 1) {
      const selected = localOptions.find(opt => opt.areaSq === selectedRegions[0])
      return selected ? selected.areaName : '지역'
    }
    return `지역 (${selectedRegions.length}개)`
  }, [selectedRegions, localOptions])

  const selectedCareerTextMobile = useMemo(() => {
    if (selectedCareers.length === 0) return '경력'
    if (selectedCareers.length === 1) {
      const selected = careerOptions.find(opt => opt.common_code_sq === selectedCareers[0])
      return selected ? selected.common_code_nm : '경력'
    }
    return `경력 (${selectedCareers.length}개)`
  }, [selectedCareers, careerOptions])

  const selectedEducationTextMobile = useMemo(() => {
    if (selectedEducations.length === 0) return '학력'
    if (selectedEducations.length === 1) {
      const selected = educationOptions.find(opt => opt.common_code_sq === selectedEducations[0])
      return selected ? selected.common_code_nm : '학력'
    }
    return `학력 (${selectedEducations.length}개)`
  }, [selectedEducations, educationOptions])

  const selectedJobTypeTextMobile = useMemo(() => {
    if (selectedJobTypes.length === 0) return '직종'
    if (selectedJobTypes.length === 1) {
      const selected = jobTypeOptions.find(opt => opt.common_code_sq === selectedJobTypes[0])
      return selected ? selected.common_code_nm : '직종'
    }
    return `직종 (${selectedJobTypes.length}개)`
  }, [selectedJobTypes, jobTypeOptions])

  // API에서 필터 옵션 가져오기
  const fetchFilterOptions = async () => {
    try {
      const basePath = '/projects'
      const [regionRes, careerRes, educationRes, jobTypeRes] = await Promise.all([
        api.$get(`${basePath}/filters`, { params: { type: '지역' } }),
        api.$get(`${basePath}/filters`, { params: { type: '경력' } }),
        api.$get(`${basePath}/filters`, { params: { type: '학력' } }),
        api.$get(`${basePath}/filters`, { params: { type: '직종' } })
      ])
      setLocalOptions(regionRes.output || [])
      setCareerOptions(careerRes.output || [])
      setEducationOptions(educationRes.output || [])
      setJobTypeOptions(jobTypeRes.output || [])
    } catch (e) {
      console.error('필터 데이터 불러오기 실패', e)
    }
  }

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // 필터 변경 시 부모에게 전달
  useEffect(() => {
    // 초기화가 완료된 후에만 onUpdate 호출 (무한 루프 방지)
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }

    const filters = {
      addressCodeSq: selectedRegions,
      projectDeveloperGradeCd: selectedCareers,
      educationCd: selectedEducations,
      jobRoleCd: selectedJobTypes,
      searchKeyword: searchKeyword,
      searchType: selectedTargetField,
      publicStatus: selectedPublicStatus
    }

    if (selectedSort === '최신순') {
      filters.sortBy = 'project_start_dt'
      filters.sortOrder = 'desc'
    } else if (selectedSort === '조회순') {
      filters.sortBy = 'view_count'
      filters.sortOrder = 'desc'
    } else if (selectedSort === '지원자순') {
      filters.sortBy = 'applicant_count'
      filters.sortOrder = 'desc'
    }

    onUpdate(filters)
  }, [selectedRegions, selectedCareers, selectedEducations, selectedJobTypes, searchKeyword, selectedTargetField, selectedSort, selectedPublicStatus, onUpdate, isInitialized])

  // 체크박스 토글
  const toggleCheckbox = (value, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter(item => item !== value))
    } else {
      setSelectedArray([...selectedArray, value])
    }
  }

  // 선택 초기화
  const clearSelection = (type) => {
    if (type === 'regions') setSelectedRegions([])
    if (type === 'careers') setSelectedCareers([])
    if (type === 'educations') setSelectedEducations([])
    if (type === 'jobTypes') setSelectedJobTypes([])
  }

  return (
    <div className={styles.filterBarContainer}>
      {/* Web Layout */}
      <div className="filter-bar border rounded p-3 d-none d-lg-flex align-items-center gap-2">
        {/* Region Dropdown */}
        <div className="dropdown">
          <button className="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            {selectedRegionText}
          </button>
          <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
            <li>
              <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); clearSelection('regions') }}>전체</a>
            </li>
            {localOptions.map(local => (
              <li key={local.areaSq}>
                <div className="dropdown-item">
                  <input
                    type="checkbox"
                    id={`region-${local.areaSq}`}
                    value={local.areaSq}
                    checked={selectedRegions.includes(local.areaSq)}
                    onChange={() => toggleCheckbox(local.areaSq, selectedRegions, setSelectedRegions)}
                    className="form-check-input me-2"
                  />
                  <label htmlFor={`region-${local.areaSq}`}>{local.areaName}</label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Career Dropdown */}
        <div className="dropdown">
          <button className="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            {selectedCareerText}
          </button>
          <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
            <li>
              <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); clearSelection('careers') }}>전체</a>
            </li>
            {careerOptions.map(career => (
              <li key={career.common_code_sq}>
                <div className="dropdown-item">
                  <input
                    type="checkbox"
                    id={`career-${career.common_code_sq}`}
                    value={career.common_code_sq}
                    checked={selectedCareers.includes(career.common_code_sq)}
                    onChange={() => toggleCheckbox(career.common_code_sq, selectedCareers, setSelectedCareers)}
                    className="form-check-input me-2"
                  />
                  <label htmlFor={`career-${career.common_code_sq}`}>{career.common_code_nm}</label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Education Dropdown */}
        <div className="dropdown">
          <button className="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            {selectedEducationText}
          </button>
          <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
            <li>
              <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); clearSelection('educations') }}>전체</a>
            </li>
            {educationOptions.map(education => (
              <li key={education.common_code_sq}>
                <div className="dropdown-item">
                  <input
                    type="checkbox"
                    id={`education-${education.common_code_sq}`}
                    value={education.common_code_sq}
                    checked={selectedEducations.includes(education.common_code_sq)}
                    onChange={() => toggleCheckbox(education.common_code_sq, selectedEducations, setSelectedEducations)}
                    className="form-check-input me-2"
                  />
                  <label htmlFor={`education-${education.common_code_sq}`}>{education.common_code_nm}</label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Job Type Dropdown */}
        <div className="dropdown">
          <button className="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            {selectedJobTypeText}
          </button>
          <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
            <li>
              <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); clearSelection('jobTypes') }}>전체</a>
            </li>
            {jobTypeOptions.map(job => (
              <li key={job.common_code_sq}>
                <div className="dropdown-item">
                  <input
                    type="checkbox"
                    id={`job-${job.common_code_sq}`}
                    value={job.common_code_sq}
                    checked={selectedJobTypes.includes(job.common_code_sq)}
                    onChange={() => toggleCheckbox(job.common_code_sq, selectedJobTypes, setSelectedJobTypes)}
                    className="form-check-input me-2"
                  />
                  <label htmlFor={`job-${job.common_code_sq}`}>{job.common_code_nm}</label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Public Status Dropdown (관리자 전용) */}
        {isAdmin && (
          <div className="dropdown">
            <button className="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              {selectedPublicStatus === '전체' ? '공개여부 (전체)' : selectedPublicStatus}
            </button>
            <ul className="dropdown-menu">
              {['전체', '공개', '비공개'].map(status => (
                <li key={status}>
                  <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedPublicStatus(status) }}>
                    {status}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Search Input */}
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="검색어를 입력하세요..."
            style={{ width: '250px' }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        {/* Search Type Dropdown */}
        <div className="dropdown">
          <button className="btn btn-outline btn-primary dropdown-toggle text-truncate" type="button" data-bs-toggle="dropdown" style={{ width: '100px' }}>
            {selectedTargetField}
          </button>
          <ul className="dropdown-menu">
            {['전체', '제목', '작성자명', '내용', '태그'].map(type => (
              <li key={type}>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedTargetField(type) }}>
                  {type}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sort Dropdown */}
        <div className="dropdown">
          <button className="btn btn-outline btn-primary dropdown-toggle text-truncate" type="button" data-bs-toggle="dropdown" style={{ width: '100px' }}>
            {selectedSort}
          </button>
          <ul className="dropdown-menu">
            {['최신순', '조회순', '지원자순'].map(sort => (
              <li key={sort}>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedSort(sort) }}>
                  {sort}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="filter-bar border rounded p-3 d-lg-none">
        <div className="d-flex flex-wrap gap-2 mb-3">
          {/* Region Dropdown */}
          <div className="dropdown flex-grow-1">
            <button className="btn btn-outline btn-primary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
              {selectedRegionTextMobile}
            </button>
            <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <li>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); clearSelection('regions') }}>전체</a>
              </li>
              {localOptions.map(local => (
                <li key={local.areaSq}>
                  <div className="dropdown-item">
                    <input
                      type="checkbox"
                      id={`region-mobile-${local.areaSq}`}
                      value={local.areaSq}
                      checked={selectedRegions.includes(local.areaSq)}
                      onChange={() => toggleCheckbox(local.areaSq, selectedRegions, setSelectedRegions)}
                      className="form-check-input me-2"
                    />
                    <label htmlFor={`region-mobile-${local.areaSq}`}>{local.areaName}</label>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Dropdown */}
          <div className="dropdown flex-grow-1">
            <button className="btn btn-outline btn-primary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
              {selectedCareerTextMobile}
            </button>
            <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <li>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); clearSelection('careers') }}>전체</a>
              </li>
              {careerOptions.map(career => (
                <li key={career.common_code_sq}>
                  <div className="dropdown-item">
                    <input
                      type="checkbox"
                      id={`career-mobile-${career.common_code_sq}`}
                      value={career.common_code_sq}
                      checked={selectedCareers.includes(career.common_code_sq)}
                      onChange={() => toggleCheckbox(career.common_code_sq, selectedCareers, setSelectedCareers)}
                      className="form-check-input me-2"
                    />
                    <label htmlFor={`career-mobile-${career.common_code_sq}`}>{career.common_code_nm}</label>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Education Dropdown */}
          <div className="dropdown flex-grow-1">
            <button className="btn btn-outline btn-primary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
              {selectedEducationTextMobile}
            </button>
            <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <li>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); clearSelection('educations') }}>전체</a>
              </li>
              {educationOptions.map(education => (
                <li key={education.common_code_sq}>
                  <div className="dropdown-item">
                    <input
                      type="checkbox"
                      id={`education-mobile-${education.common_code_sq}`}
                      value={education.common_code_sq}
                      checked={selectedEducations.includes(education.common_code_sq)}
                      onChange={() => toggleCheckbox(education.common_code_sq, selectedEducations, setSelectedEducations)}
                      className="form-check-input me-2"
                    />
                    <label htmlFor={`education-mobile-${education.common_code_sq}`}>{education.common_code_nm}</label>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Job Type Dropdown */}
          <div className="dropdown flex-grow-1">
            <button className="btn btn-outline btn-primary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
              {selectedJobTypeTextMobile}
            </button>
            <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <li>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); clearSelection('jobTypes') }}>전체</a>
              </li>
              {jobTypeOptions.map(job => (
                <li key={job.common_code_sq}>
                  <div className="dropdown-item">
                    <input
                      type="checkbox"
                      id={`job-mobile-${job.common_code_sq}`}
                      value={job.common_code_sq}
                      checked={selectedJobTypes.includes(job.common_code_sq)}
                      onChange={() => toggleCheckbox(job.common_code_sq, selectedJobTypes, setSelectedJobTypes)}
                      className="form-check-input me-2"
                    />
                    <label htmlFor={`job-mobile-${job.common_code_sq}`}>{job.common_code_nm}</label>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Public Status Dropdown (관리자 전용) */}
          {isAdmin && (
            <div className="dropdown flex-grow-1">
              <button className="btn btn-outline btn-primary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
                {selectedPublicStatus === '전체' ? '공개여부' : selectedPublicStatus}
              </button>
              <ul className="dropdown-menu">
                {['전체', '공개', '비공개'].map(status => (
                  <li key={status}>
                    <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedPublicStatus(status) }}>
                      {status}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Search Input */}
          <div className="flex-grow-1">
            <input
              type="text"
              className="form-control"
              placeholder="검색어를 입력하세요..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* Search Type Dropdown */}
          <div className="dropdown">
            <button className="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              {selectedTargetField}
            </button>
            <ul className="dropdown-menu">
              {['전체', '제목', '작성자명', '내용', '태그'].map(type => (
                <li key={type}>
                  <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedTargetField(type) }}>
                    {type}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sort Dropdown */}
          <div className="dropdown">
            <button className="btn btn-outline btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              {selectedSort}
            </button>
            <ul className="dropdown-menu">
              {['최신순', '조회순', '지원자순'].map(sort => (
                <li key={sort}>
                  <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedSort(sort) }}>
                    {sort}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

