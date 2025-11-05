import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAlertStore } from '../../../store/alertStore';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './EducationSearchModal.module.css';

const EducationSearchModal = ({ onComplete }) => {
  const alertStore = useAlertStore();

  const [tab, setTab] = useState('high'); // 'high' 또는 'univ'
  const [search, setSearch] = useState('');
  const [schools, setSchools] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isDateSelection, setIsDateSelection] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [majorName, setMajorName] = useState('');

  const perPage = 3;
  const groupSize = 3;

  // 페이지 그룹 계산
  const currentGroup = useMemo(() => Math.ceil(page / groupSize), [page]);

  const pageGroup = useMemo(() => {
    const start = (currentGroup - 1) * groupSize + 1;
    const end = Math.min(start + groupSize - 1, totalPages);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentGroup, totalPages]);

  // 학교 검색
  const fetchSchools = async () => {
    const apiKey = '28c12cecb3e103d5b10acd6a0e76209f';
    const gubun = tab === 'high' ? 'high_list' : 'univ_list';
    const keyword = search.trim();

    try {
      const res = await axios.get(
        'https://www.career.go.kr/cnet/openapi/getOpenApi',
        {
          params: {
            apiKey,
            svcType: 'api',
            svcCode: 'SCHOOL',
            contentType: 'json',
            gubun,
            thisPage: page,
            perPage: perPage,
            searchSchulNm: keyword,
          },
        }
      );

      let content = res.data?.dataSearch?.content;
      if (!content) {
        content = [];
      } else if (!Array.isArray(content)) {
        content = [content];
      }

      setSchools(
        content.map((item, idx) => ({
          id: item.seq || idx,
          name: item.schoolName,
          address: item.adres || item.addr || '',
          type: tab === 'high' ? '고등학교' : '대학교',
        }))
      );

      const totalCount = content.length > 0 ? parseInt(content[0].totalCount) : 0;
      console.log('res.data.dataSearch', res.data.dataSearch);
      setTotalPages(Math.ceil(totalCount / perPage));
    } catch (error) {
      console.error('학교 검색 오류:', error);
      setSchools([]);
    }
  };

  // 탭 또는 페이지 변경 시 새로 요청
  useEffect(() => {
    fetchSchools();
  }, [tab, page]);

  // 초기 로드
  useEffect(() => {
    fetchSchools();
  }, []);

  // 탭 변경
  const onTabChange = (newTab) => {
    setTab(newTab);
    setSearch('');
    setPage(1);
    setTotalPages(1);
  };

  // 학교 선택
  const selectSchool = (school) => {
    setSelectedSchool({
      name: school.name,
      type: school.type,
      address: school.address,
    });
    setIsDateSelection(true);
  };

  // 검색으로 돌아가기
  const backToSearch = () => {
    setIsDateSelection(false);
    setSelectedSchool(null);
    setStartDate(null);
    setEndDate(null);
    setMajorName('');
  };

  // 날짜 포맷팅
  const formatDate = (date) => {
    if (!date) return '';
    
    // Date 객체를 YYYY-MM-DD 형식으로 변환
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    }
    
    return date.substring(0, 10).replace(/-/g, '.');
  };

  // API용 날짜 포맷팅
  const formatDateForAPI = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  };

  // 완료
  const completeSelection = () => {
    if (!startDate) {
      alertStore.show('입학년월을 입력해주세요.', 'danger');
      return;
    }
    if (!majorName) {
      alertStore.show('전공명을 입력하세요.', 'danger');
      return;
    }

    const period = endDate
      ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
      : `${formatDate(startDate)} ~`;

    onComplete?.({
      educationSchoolNm: selectedSchool.name,
      educationMajorNm: majorName,
      educationAdmissionDt: formatDateForAPI(startDate),
      educationGraduationDt: formatDateForAPI(endDate),
      educationStatusCd: endDate ? 1201 : 1202, // 졸업 or 졸업예정
      period,
    });

    close();
  };

  // 모달 닫기
  const close = () => {
    onComplete?.(null);
  };

  // 페이지네이션
  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const goPage = (p) => {
    setPage(p);
  };

  // 엔터키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchSchools();
    }
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={close}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>
            {isDateSelection ? '학력 기간 입력' : '학력 검색'}
          </span>
          <button className={styles.modalClose} onClick={close}>
            ×
          </button>
        </div>

        {!isDateSelection ? (
          <div>
            {/* 탭 */}
            <div className={styles.modalTabs}>
              <button
                className={tab === 'high' ? styles.active : ''}
                onClick={() => onTabChange('high')}
              >
                고등학교
              </button>
              <button
                className={tab === 'univ' ? styles.active : ''}
                onClick={() => onTabChange('univ')}
              >
                대학교
              </button>
            </div>

            {/* 검색 */}
            <div className={styles.modalSearch}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="학교명을 입력하세요"
              />
              <button className={styles.modalSearchBtn} onClick={fetchSchools}>
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="2" />
                  <path
                    d="M13 13l3 3"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* 학교 목록 */}
            <div className={styles.modalList}>
              {schools.length > 0 ? (
                <div>
                  {schools.map((school) => (
                    <div key={school.id} className={styles.modalItem}>
                      <div>
                        <div className={styles.schoolName}>{school.name}</div>
                        <div className={styles.schoolAddress}>{school.address}</div>
                      </div>
                      <button
                        className={styles.modalAddBtn}
                        onClick={() => selectSchool(school)}
                      >
                        선택
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.modalEmpty}>검색 결과가 없습니다.</div>
              )}
            </div>

            {/* 페이지네이션 */}
            <div className={styles.modalPagination}>
              <button disabled={page === 1} onClick={prevPage}>
                &lt;
              </button>

              {pageGroup.map((p) => (
                <button
                  key={p}
                  className={page === p ? styles.active : ''}
                  onClick={() => goPage(p)}
                >
                  {p}
                </button>
              ))}

              <button disabled={page === totalPages} onClick={nextPage}>
                &gt;
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.dateSelection}>
            {/* 선택된 학교 정보 */}
            <div className={styles.selectedSchool}>
              <div className={styles.schoolName}>{selectedSchool?.name}</div>
              <div className={styles.schoolAddress}>{selectedSchool?.address}</div>
            </div>

            {/* 날짜 입력 */}
            <div className={styles.dateInputs}>
              <div className={styles.dateInputGroup}>
                <label>
                  입학일 <span style={{ color: 'red' }}>*</span>
                </label>
                <div className={styles.datepickerWrapper}>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="입학일 선택"
                    className="form-control"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                  />
                  <i className="fas fa-calendar datepicker-icon"></i>
                </div>
              </div>
              <div className={styles.dateInputGroup}>
                <label>졸업일</label>
                <div className={styles.datepickerWrapper}>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="졸업일 선택"
                    className="form-control"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                  />
                  <i className="fas fa-calendar datepicker-icon"></i>
                </div>
              </div>
            </div>

            {/* 전공명 입력 */}
            <div className={styles.dateInputGroup} style={{ marginTop: '20px' }}>
              <label>
                전공명 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={majorName}
                onChange={(e) => setMajorName(e.target.value)}
                placeholder="전공명을 입력하세요"
                required
              />
            </div>
          </div>
        )}

        {/* 푸터 */}
        <div className={styles.modalFooter}>
          {isDateSelection ? (
            <>
              <button className={styles.modalFooterBack} onClick={backToSearch}>
                이전
              </button>
              <button
                className={styles.modalFooterComplete}
                onClick={completeSelection}
              >
                완료
              </button>
            </>
          ) : (
            <button className={styles.modalFooterClose} onClick={close}>
              닫기
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EducationSearchModal;

