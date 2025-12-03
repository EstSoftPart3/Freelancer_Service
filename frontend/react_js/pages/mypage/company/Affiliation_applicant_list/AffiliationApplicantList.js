import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/axios';
import MyPageLayout from '../../MyPageLayout';
import './AffiliationApplicantList.module.css';
import skillIconMap from '@/lib/skillIconMap';
import ResumeDetailModal from '@/components/myPage/common/ResumeDetailModal';
import { useModalStore } from '@/store/modalStore';

// skillIconMap import - 경로는 프로젝트에 맞게 조정
// import skillIconMap from '../../../../assets/skillIconMap';

const AffiliationApplicantList = () => {

  const modalStore = useModalStore();
  const size = 10;

  // State 관리
  const [applicants, setApplicants] = useState([]);
  const [readType, setReadType] = useState('all');
  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [readElements, setReadElements] = useState(0);
  const [unreadElements, setUnreadElements] = useState(0);

  // 필터 계산 (useMemo)
  const filters = useMemo(
    () => [
      { type: 'all', label: '전체', count: totalElements },
      { type: 'read', label: '열람', count: readElements },
      { type: 'unread', label: '미열람', count: unreadElements },
    ],
    [totalElements, readElements, unreadElements]
  );

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    getApplicants();
  }, []);

  // currentPage, readType 변경 시 재조회
  useEffect(() => {
    getApplicants();
  }, [currentPage, readType]);

  // 지원자 목록 조회
  const getApplicants = async () => {
    try {
      const searchFilter =
        keyword == null || keyword.trim() === ''
          ? ''
          : `&searchType=${searchType}&keyword=${keyword}`;

      const readFilter =
        readType == null || readType === 'all' ? '' : `&readType=${readType}`;

      const response = await api.$get(
        `/mypage/applications/company?page=${currentPage}&size=${size}${searchFilter}${readFilter}`
      );
      console.log('지원자 목록 조회', response)

      if (response.status === 'OK') {
        const output = response.output;
        const totalCnt = output.totalElements;
        const readCnt = output.readElements;
        const unreadCnt = totalCnt - readCnt;

        setApplicants(output.applicants || []);
        setTotalElements(totalCnt);
        setReadElements(readCnt);
        setUnreadElements(unreadCnt);

        // 페이지 수 계산
        let pages = 1;
        if (readType === 'read') {
          pages = readCnt === 0 ? 1 : Math.floor((readCnt + size - 1) / size);
        } else if (readType === 'unread') {
          pages = unreadCnt === 0 ? 1 : Math.floor((unreadCnt + size - 1) / size);
        } else {
          pages = totalCnt === 0 ? 1 : Math.floor((totalCnt + size - 1) / size);
        }
        setTotalPages(pages);
      }
    } catch (error) {
      console.error('지원자 조회 실패:', error);
      alert('지원자를 불러올 수 없습니다.');
    }
  };

  // 합격/불합격 처리
  const handlePassClick = (applicant, cd) => {
    if (applicant.statusCd === cd) {
      return;
    }

    const statusText = cd === 502 ? '합격' : '불합격';
    const confirmed = window.confirm(
      `해당 지원자를 ${statusText} 하시겠습니까?`
    );

    if (confirmed) {
      updateApplicationStatus(applicant.applicationSq, cd);
    }
  };

  // 지원 상태 변경 API 호출
  const updateApplicationStatus = async (applicationSq, statusCd) => {
    try {
      const response = await api.$put(
        `/mypage/applications/apply/${applicationSq}`,
        {
          companyApplicationStatusCd: statusCd,
        }
      );

      if (response.status === 'OK') {
        alert('지원 상태 변경이 완료되었습니다.');
        getApplicants();
      }
    } catch (error) {
      console.error('지원 상태 변경 실패:', error);
      alert('지원 상태 변경에 실패했습니다.');
    }
  };

  // 이력서 상세보기 모달 열기
  const openResumeModal = (resumeSq) => {
    modalStore.openModal(ResumeDetailModal, {
      resumeSq,
      projectSq: 0,
      applicationSq: 0,
      isFromApplicationList: false,
      api: api,
      skillIconMap: skillIconMap,
    });
  };

  // 지원자 클릭 (열람 처리 + 상세보기)
  const handleOpenApplicant = async (applicationSq) => {
    try {
      // 이력서 열람으로 업데이트
      const res = await api.$put(`/mypage/applications/read/${applicationSq}`);
      const resumeSq = res.output.resumeSq
      getApplicants();
      // 이력서 모달 오픈
      openResumeModal(resumeSq);
    } catch (error) {
      console.error('열람 처리 실패:', error);
    }
  };

  // 경력 변환 (개월 → 년 개월)
  const convertCareer = (career) => {
    if (!career || career <= 0) return '신입';
    const years = Math.floor(career / 12);
    const months = career % 12;

    const yearPart = years > 0 ? `${years}년 ` : '';
    const monthPart = months > 0 ? `${months}개월` : '';
    return `${yearPart}${monthPart}`;
  };

  // 날짜 포맷팅 (yyyy.MM.dd)
  const convertDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    return `${year}.${month}.${day}`;
  };

  // 스킬 아이콘 가져오기
  const getSkillIcon = (name) => {
    // skillIconMap 사용 - 실제 구현에 맞게 수정
    const key = name?.toLowerCase().replace(/[\s.]+/g, '');
    // return skillIconMap[key] || skillIconMap.default;
    return null; // 임시
  };

  // 필터 설정
  const setFilter = (type) => {
    setReadType(type);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  // 검색
  const handleSearch = () => {
    setCurrentPage(1);
    getApplicants();
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 페이지 변경
  const updateCurrentPage = (page) => {
    setCurrentPage(page);
  };

  // 페이지네이션 컴포넌트
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="d-flex justify-content-end mt-4">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a
              className="page-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
            >
              &laquo;
            </a>
          </li>
          {pageNumbers.map((page) => (
            <li
              key={page}
              className={`page-item ${page === currentPage ? 'active' : ''}`}
            >
              <a
                className="page-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page}
              </a>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? 'disabled' : ''
            }`}
          >
            <a
              className="page-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
            >
              &raquo;
            </a>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <MyPageLayout userType="COMPANY">
      <div className="affiliation-applicant-list-container">
      {/* 페이지 제목 */}
      <div className="row">
        <div className="col">
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            소속 공고 지원자 현황
          </h4>
        </div>
      </div>

      {/* 필터/검색 UI */}
      <div className="row align-items-center mt-3 mb-2">
        {/* 좌측: 필터 버튼 */}
        <div className="col-md-6 d-flex gap-2 filter-buttons">
          {filters.map((filter) => (
            <button
              key={filter.type}
              className={`btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2 fs-6 ${
                readType === filter.type ? 'active' : ''
              }`}
              onClick={() => setFilter(filter.type)}
            >
              {filter.label}
              <span className="badge bg-white text-primary fw-bold px-2 py-1">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* 우측: 검색 */}
        <div className="col-md-6 d-flex justify-content-end gap-2 search-group">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="form-select form-select-sm w-auto"
          >
            <option value="all">전체</option>
            <option value="title">이력서 제목</option>
            <option value="name">지원자명</option>
            <option value="greeting">인사말</option>
          </select>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="검색어 입력"
          />
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      {applicants.length > 0 ? (
        <div className="row">
          <div className="col">
            <ul className="simple-post-list m-0 my-2 position-relative">
              {applicants.map((applicant, index) => (
                <li
                  key={applicant.applicationSq}
                  className="applicant-item"
                  style={{
                    borderTop:
                      index === 0 ? '1px solid rgb(230, 230, 230)' : '',
                    borderBottom: '1px solid rgb(230, 230, 230)',
                  }}
                >
                  <div className="post-info position-relative">
                    {/* 이름 + 합격/불합격 버튼 */}
                    <div className="d-flex justify-content-between align-items-center gap-2 applicant-header">
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="text-5 m-0 text-primary applicant-name"
                          onClick={() =>
                            handleOpenApplicant(applicant.applicationSq)
                          }
                        >
                          {applicant.userNm}
                        </button>
                      </div>
                      <div className="d-flex gap-2 action-buttons">
                        {/* 합격 상태일 때 */}
                        {applicant.statusCd === 502 ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-primary btn-sm btn-light status-button"
                            disabled
                          >
                            합격
                          </button>
                        ) : applicant.statusCd === 503 ? (
                          /* 불합격 상태일 때 */
                          <button
                            type="button"
                            className="btn btn-outline btn-primary btn-sm btn-light status-button"
                            disabled
                          >
                            불합격
                          </button>
                        ) : (
                          /* 아직 처리되지 않은 경우 */
                          <>
                            <button
                              type="button"
                              className="btn btn-outline btn-primary btn-sm"
                              onClick={() => handlePassClick(applicant, 502)}
                            >
                              합격
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-primary btn-sm"
                              onClick={() => handlePassClick(applicant, 503)}
                            >
                              불합격
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 경력/열람일자 */}
                    <div className="row mt-2">
                      <div className="col-md-8">
                        <div className="post-meta text-4">
                          <span className="text-dark text-uppercase font-weight-semibold">
                            경력
                          </span>
                          | {convertCareer(applicant.career)}
                        </div>
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="post-meta text-4">
                          <span className="text-dark text-uppercase font-weight-semibold">
                            열람일자
                          </span>
                          |{' '}
                          {applicant.readAt
                            ? convertDate(applicant.readAt)
                            : '미열람'}
                        </div>
                      </div>
                    </div>

                    {/* 사용 기술/지원일자 */}
                    <div className="row mt-2 align-items-start applicant-details">
                      <div className="col-md-8">
                        <div className="d-flex align-items-center gap-2 flex-wrap skills-section">
                          <span className="text-dark text-uppercase font-weight-semibold">
                            사용 기술
                          </span>
                          |
                          {applicant.skills &&
                            applicant.skills.map((skill, idx) => (
                              <div
                                key={idx}
                                className="btn d-flex align-items-center gap-2 border-0 p-0 skill-tag"
                              >
                                {getSkillIcon(skill.skillTagNm) && (
                                  <img
                                    src={getSkillIcon(skill.skillTagNm)}
                                    width="20"
                                    alt={skill.skillTagNm}
                                  />
                                )}
                                {skill.skillTagNm}
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="post-meta apply-date">
                          <span className="text-dark text-uppercase font-weight-semibold">
                            지원일자
                          </span>
                          | {convertDate(applicant.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={updateCurrentPage}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          지원자가 없습니다.
        </div>
      )}
    </div>
    </MyPageLayout>
  );
};

export default AffiliationApplicantList;

