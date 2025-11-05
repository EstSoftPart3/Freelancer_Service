import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/axios';
import styles from './CalendarFilterBar.module.css';

const CalendarFilterBar = ({ onUpdate }) => {
  // ==================== State ====================
  // 필터 옵션 데이터
  const [contractTypeOptions, setContractTypeOptions] = useState([]);
  const [jobTypeOptions, setJobTypeOptions] = useState([]);
  const calendarTypeOptions = [
    { value: 'PERSONAL', label: '개인 일정' },
    { value: 'PROJECT', label: '프로젝트 일정' },
    { value: 'INTERVIEW', label: '인터뷰 일정' }
  ];

  // 선택된 값들
  const [selectedContractTypes, setSelectedContractTypes] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedCalendarType, setSelectedCalendarType] = useState(null);

  // 검색어
  const [searchKeyword, setSearchKeyword] = useState('');

  // 드롭다운 열림 상태
  const [openDropdown, setOpenDropdown] = useState(null); // 'calendar', 'contract', 'job', null

  // ==================== Computed (useMemo) ====================
  const selectedContractTypeText = useMemo(() => {
    if (selectedContractTypes.length === 0) return '계약형태';
    if (selectedContractTypes.length === 1) {
      const selected = contractTypeOptions.find(
        (opt) => opt.common_code_sq === selectedContractTypes[0]
      );
      return selected ? selected.common_code_nm : '계약형태';
    }
    return `계약형태 (${selectedContractTypes.length}개)`;
  }, [selectedContractTypes, contractTypeOptions]);

  const selectedJobTypeText = useMemo(() => {
    if (selectedJobTypes.length === 0) return '직무';
    if (selectedJobTypes.length === 1) {
      const selected = jobTypeOptions.find(
        (opt) => opt.common_code_sq === selectedJobTypes[0]
      );
      return selected ? selected.common_code_nm : '직무';
    }
    return `직무 (${selectedJobTypes.length}개)`;
  }, [selectedJobTypes, jobTypeOptions]);

  const selectedCalendarTypeText = useMemo(() => {
    if (selectedCalendarType === null) return '일정 종류';
    const selected = calendarTypeOptions.find(
      (opt) => opt.value === selectedCalendarType
    );
    return selected ? selected.label : '일정 종류';
  }, [selectedCalendarType]);

  // ==================== Effects ====================
  // 컴포넌트 마운트 시 필터 옵션 로드
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // 필터 변경 시 부모 컴포넌트로 전달
  useEffect(() => {
    const filters = {
      searchKeyword: searchKeyword,
      contractTypeCd: selectedContractTypes.length > 0 ? selectedContractTypes[0] : null,
      jobRoleCd: selectedJobTypes.length > 0 ? selectedJobTypes[0] : null,
      calendarType: selectedCalendarType,
    };
    
    if (onUpdate) {
      onUpdate(filters);
    }
  }, [selectedContractTypes, selectedJobTypes, selectedCalendarType, searchKeyword]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e) => {
      // data-dropdown 속성으로 드롭다운 영역인지 확인
      const isDropdownClick = e.target.closest('[data-dropdown]');
      if (!isDropdownClick) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // ==================== API ====================
  const fetchFilterOptions = async () => {
    try {
      const [contractRes, jobTypeRes] = await Promise.all([
        api.$get('/calendar/filter', { params: { type: '계약형태' } }),
        api.$get('/calendar/filter', { params: { type: '직무' } }),
      ]);

      setContractTypeOptions(contractRes.output || []);
      setJobTypeOptions(jobTypeRes.output || []);
    } catch (error) {
      console.error('필터 데이터 불러오기 실패', error);
    }
  };

  // ==================== Handlers ====================
  const toggleDropdown = (dropdownName) => {
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleSearch = (e) => {
    // 검색어 변경은 useEffect에서 자동으로 처리됨
  };

  const clearSearch = () => {
    setSearchKeyword('');
  };

  const clearSelection = (type) => {
    if (type === 'contractTypes') setSelectedContractTypes([]);
    if (type === 'jobTypes') setSelectedJobTypes([]);
    if (type === 'calendarType') setSelectedCalendarType(null);
    setOpenDropdown(null);
  };

  const selectCalendarType = (type) => {
    setSelectedCalendarType(type);
    setOpenDropdown(null);
  };

  const toggleContractType = (codeSq) => {
    setSelectedContractTypes((prev) =>
      prev.includes(codeSq)
        ? prev.filter((id) => id !== codeSq)
        : [...prev, codeSq]
    );
  };

  const toggleJobType = (codeSq) => {
    setSelectedJobTypes((prev) =>
      prev.includes(codeSq)
        ? prev.filter((id) => id !== codeSq)
        : [...prev, codeSq]
    );
  };

  return (
    <div className={styles['calendar-filter-bar']}>
      {/* 필터 영역 */}
      <div className={styles['filters-section']}>
        {/* 일정 종류 필터 */}
        <div className={styles['filter-dropdown']} data-dropdown="calendar">
          <button
            className={`${styles['filter-btn']} ${selectedCalendarType !== null ? styles.active : ''}`}
            type="button"
            onClick={() => toggleDropdown('calendar')}
          >
            {selectedCalendarTypeText}
          </button>
          {openDropdown === 'calendar' && (
            <ul className={styles['dropdown-menu']}>
              <li>
                <a
                  className={styles['dropdown-item']}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    clearSelection('calendarType');
                  }}
                >
                  전체
                </a>
              </li>
              {calendarTypeOptions.map((calType) => (
                <li key={calType.value}>
                  <a
                    className={styles['dropdown-item']}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      selectCalendarType(calType.value);
                    }}
                  >
                    {calType.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 계약형태 필터 */}
        <div className={styles['filter-dropdown']} data-dropdown="contract">
          <button
            className={`${styles['filter-btn']} ${selectedContractTypes.length > 0 ? styles.active : ''}`}
            type="button"
            onClick={() => toggleDropdown('contract')}
          >
            {selectedContractTypeText}
          </button>
          {openDropdown === 'contract' && (
            <ul className={styles['dropdown-menu']}>
              <li>
                <a
                  className={styles['dropdown-item']}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    clearSelection('contractTypes');
                  }}
                >
                  전체
                </a>
              </li>
              {contractTypeOptions.map((contract) => (
                <li key={contract.common_code_sq}>
                  <div
                    className={`${styles['dropdown-item']} ${styles['checkbox-item']}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleContractType(contract.common_code_sq);
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`contract-${contract.common_code_sq}`}
                      checked={selectedContractTypes.includes(contract.common_code_sq)}
                      onChange={() => toggleContractType(contract.common_code_sq)}
                      className="form-check-input me-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label htmlFor={`contract-${contract.common_code_sq}`}>
                      {contract.common_code_nm}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 직무 필터 */}
        <div className={styles['filter-dropdown']} data-dropdown="job">
          <button
            className={`${styles['filter-btn']} ${selectedJobTypes.length > 0 ? styles.active : ''}`}
            type="button"
            onClick={() => toggleDropdown('job')}
          >
            {selectedJobTypeText}
          </button>
          {openDropdown === 'job' && (
            <ul className={styles['dropdown-menu']}>
              <li>
                <a
                  className={styles['dropdown-item']}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    clearSelection('jobTypes');
                  }}
                >
                  전체
                </a>
              </li>
              {jobTypeOptions.map((job) => (
                <li key={job.common_code_sq}>
                  <div
                    className={`${styles['dropdown-item']} ${styles['checkbox-item']}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleJobType(job.common_code_sq);
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`job-${job.common_code_sq}`}
                      checked={selectedJobTypes.includes(job.common_code_sq)}
                      onChange={() => toggleJobType(job.common_code_sq)}
                      className="form-check-input me-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label htmlFor={`job-${job.common_code_sq}`}>
                      {job.common_code_nm}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 검색 영역 */}
      <div className={styles['search-section']}>
        <div className={styles['search-wrapper']}>
          <div className={styles['search-icon-wrapper']}>
            <i className="bi bi-search"></i>
          </div>
          <input
            type="text"
            className={styles['search-input']}
            placeholder="기업명, 직무명, 공고명을 검색하세요."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyUp={handleSearch}
          />
          {searchKeyword && (
            <div className={styles['clear-search']} onClick={clearSearch}>
              <i className="bi bi-x-circle"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarFilterBar;

