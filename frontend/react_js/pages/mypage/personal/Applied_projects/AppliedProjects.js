import { useState, useEffect, useMemo } from 'react';
import { useModalStore } from '../../../../store/modalStore';
import { useUserStore } from '../../../../store/userStore';
import InterviewTimeModal from '../../../../components/myPage/common/InterviewSelectModal';
import CommonConfirmModal from '../../../../components/common/CommonConfirmModal';
import ResumeDetailModal from '../../../../components/myPage/common/ResumeDetailModal';
import { navigateByUserTypeAndProjectSq } from '../../../../router/userTypeRouter';
import api from '../../../../utils/api';
import './AppliedProjects.css';

const AppliedProjects = () => {
  const userStore = useUserStore();
  const modalStore = useModalStore();
  const userType = userStore.getUserType;

  // 검색 조건
  const [searchType, setSearchType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('all');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');

  // 열람 필터
  const [readType, setReadType] = useState('all');
  const [readFilters, setReadFilters] = useState([
    { type: 'all', label: '전체', count: 0 },
    { type: 'read', label: '열람', count: 0 },
    { type: 'unread', label: '미열람', count: 0 },
  ]);

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // 지원 목록
  const [applications, setApplications] = useState([]);

  // 인터뷰 시간
  const [selectedInterviewTimes, setSelectedInterviewTimes] = useState([]);

  // 지원 목록 조회
  const fetchApplicationList = async () => {
    try {
      // userType에 따라 API 엔드포인트 분기 처리
      const endpoint =
        userType === 'COMPANY'
          ? `/projects/applications/corporate` // 기업용: 지원자 목록
          : `/projects/applications`; // 개인용: 지원 현황

      const response = await api.get(endpoint, {
        withCredentials: true,
        params: {
          offset: (currentPage - 1) * itemsPerPage,
          size: itemsPerPage,
          searchType: appliedSearchType,
          keyword: appliedSearchKeyword,
          readType: readType === 'all' ? null : readType,
        },
      });

      const data = response.output || {};
      setApplications(data.applications || []);
      setTotalPages(Math.max(1, Math.ceil((data.totalCount || 0) / itemsPerPage)));

      // 필터 카운트 갱신
      if (data.counts) {
        updateCounts(data.counts);
      }
    } catch (e) {
      console.error('❌ 프로젝트 지원 리스트 불러오기 실패:', e);
    }
  };

  // 카운트 업데이트
  const updateCounts = (counts) => {
    setReadFilters((prev) =>
      prev.map((filter) => ({
        ...filter,
        count: counts?.[filter.type] ?? 0,
      }))
    );
  };

  // 검색
  const handleSearch = () => {
    console.log('검색 클릭');
    setCurrentPage(1);
    setAppliedSearchType(searchType);
    setAppliedSearchKeyword(searchKeyword);
  };

  // 검색 실행 후 목록 조회
  useEffect(() => {
    fetchApplicationList();
  }, [currentPage, readType, appliedSearchType, appliedSearchKeyword]);

  // 엔터키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 열람 필터 클릭
  const setReadFilter = (type) => {
    setReadType(type);
    setCurrentPage(1);
  };

  // 페이지 변경
  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 프로젝트 상세 이동
  const goToProjectSpec = (project) => {
    navigateByUserTypeAndProjectSq(userType, project.projectSq);
  };

  // 상태 변경
  const updateAppStatus = async (status, applicationSq) => {
    try {
      await api.patch(
        `/projects/applications/${applicationSq}`,
        { status },
        { withCredentials: true }
      );
    } catch (e) {
      console.error('❌ 지원 상태 변경 실패:', e);
    }
  };

  // 지원 취소
  const cancelApplication = (status, applicationSq) => {
    modalStore.openModal(CommonConfirmModal, {
      title: '프로젝트 지원 취소',
      message: '취소한 프로젝트 내역은 복구할 수 없습니다. 취소하시겠습니까?',
      onConfirm: async () => {
        await updateAppStatus(status, applicationSq);
        await fetchApplicationList();
        modalStore.closeModal();
      },
    });
  };

  // 날짜 포맷터
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 인터뷰 시간 조회 + 모달 열기
  const fetchAvailableInterviewTimes = async (projectSq, applicationSq) => {
    try {
      const response = await api.get(
        `/projects/applications/interviews/${projectSq}`,
        { withCredentials: true }
      );

      setSelectedInterviewTimes(response.output);

      const confirmed = await openInterviewTimeModal(applicationSq);
      if (confirmed) {
        await fetchApplicationList();
      }
    } catch (e) {
      console.error('❌ 인터뷰 시간 조회 실패:', e);
    }
  };

  // 인터뷰 시간 선택 모달
  const openInterviewTimeModal = (applicationSq) => {
    return new Promise((resolve) => {
      modalStore.openModal(InterviewTimeModal, {
        applicationSq,
        interviewTimes: selectedInterviewTimes,
        onConfirm: (result) => {
          resolve(result);
          modalStore.closeModal();
        },
        onCancel: () => {
          resolve(null);
          modalStore.closeModal();
        },
      });
    });
  };

  // 이력서 상세 보기
  const openResumeDetailModal = (item) => {
    modalStore.openModal(ResumeDetailModal, {
      resumeSq: item.resumeSq,
      projectSq: item.projectSq,
      applicationSq: item.applicationSq,
      isFromApplicationList: true,
      size: 'modal-xl',
    });
  };

  // 상태별 버튼 렌더링
  const renderStatusButtons = (item) => {
    if (item.applicantType === '지원중') {
      return (
        <>
          <span className="btn btn-primary btn-sm">지원중</span>
          <span
            className="btn btn-primary btn-outline btn-sm"
            onClick={() => cancelApplication('지원취소', item.applicationSq)}
          >
            지원취소
          </span>
        </>
      );
    } else if (item.applicantType === '합격') {
      return <span className="btn btn-light btn-sm">합격</span>;
    } else if (item.applicantType === '인터뷰확정') {
      return (
        <div className="interview-wrapper position-relative d-inline-block">
          <div
            className="interview-tooltip position-absolute bg-white border p-2 rounded shadow-sm text-dark font-weight-semibold"
            style={{
              bottom: '80%',
              left: '50%',
              transform: 'translateX(-60%)',
              whiteSpace: 'nowrap',
            }}
          >
            {formatDate(item.interviewDt)}
          </div>
          <span className="btn btn-light btn-sm interview">인터뷰 확정</span>
        </div>
      );
    } else if (item.applicantType === '불합격') {
      return <span className="btn btn-light btn-sm">불합격</span>;
    } else if (item.applicantType === '지원취소') {
      return <span className="btn btn-light btn-sm">지원 취소됨</span>;
    } else if (item.applicantType === '인터뷰요청중') {
      return (
        <a
          onClick={(e) => {
            e.preventDefault();
            fetchAvailableInterviewTimes(item.projectSq, item.applicationSq);
          }}
          href="#"
          className="btn btn-outline btn-primary btn-sm"
        >
          인터뷰 요청중
        </a>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="row">
        <div className="col">
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            프로젝트 지원 현황
          </h4>
        </div>
      </div>

      {/* 필터 UI */}
      <div className="row align-items-center mt-3 mb-2">
        {/* 좌측: 열람 필터 토글 버튼 */}
        <div className="col-md-6 d-flex gap-2">
          {readFilters.map((filter) => (
            <button
              key={filter.type}
              className={`btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2 fs-6 ${
                readType === filter.type ? 'active' : ''
              }`}
              onClick={() => setReadFilter(filter.type)}
            >
              {filter.label}
              <span className="badge bg-white text-primary fw-bold px-2 py-1">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* 우측: 검색 영역 */}
        <div className="col-md-6 d-flex justify-content-end gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="form-select form-select-sm w-auto"
          >
            <option value="all">전체</option>
            <option value="title">제목</option>
            <option value="company">회사명</option>
          </select>
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
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

      <div className="row">
        <div className="col pt-2 mt-1">
          <hr className="my-2" />
        </div>
      </div>

      <div className="row">
        <div className="col">
          {applications.length === 0 ? (
            <div className="text-muted py-3" style={{ fontSize: '14px' }}>
              지원한 프로젝트가 없습니다.
            </div>
          ) : (
            <ul className="simple-post-list m-0 position-relative">
              {applications.map((item) => (
                <li
                  key={item.applicationSq}
                  style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
                >
                  <div className="post-info position-relative">
                    {/* 제목 + 회사명 + 지원상태 버튼 */}
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      {/* 왼쪽: 제목 / 회사명 */}
                      <div className="d-flex gap-2">
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            goToProjectSpec(item);
                          }}
                          href="#"
                          className="text-5 m-0"
                        >
                          {item.projectTitle} / {item.companyTitle}
                        </a>
                      </div>

                      {/* 오른쪽: 상태 버튼들 */}
                      <div className="d-flex gap-2">
                        {renderStatusButtons(item)}
                        {item.isRecruitEnded === true && (
                          <span className="btn btn-light btn-sm">지원 마감</span>
                        )}
                      </div>
                    </div>

                    {/* 지원일자 + 지원자 수 */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          지원일자
                        </span>
                        | {formatDate(item.appliedDt)}
                      </div>
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          지원자 수
                        </span>
                        | {item.applicantCnt}
                      </div>
                    </div>

                    {/* 지원 이력서 + 열람일자 */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          지원 이력서
                        </span>
                        |
                        <span
                          onClick={() => openResumeDetailModal(item)}
                          className="text-muted resume-hover"
                        >
                          {userType === 'COMPANY'
                            ? `${item.applicantName} / ${item.resumeTitle}`
                            : item.resumeTitle}
                        </span>
                      </div>
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          열람일자
                        </span>
                        {item.readApplicationDt
                          ? formatDate(item.readApplicationDt)
                          : '미열람'}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 페이징 */}
          <div className="mt-5 py-5">
            <ul className="pagination float-end">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <a
                  className="page-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    changePage(currentPage - 1);
                  }}
                >
                  <i className="fas fa-angle-left"></i>
                </a>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li
                  key={page}
                  className={`page-item ${page === currentPage ? 'active' : ''}`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      changePage(page);
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
                    changePage(currentPage + 1);
                  }}
                >
                  <i className="fas fa-angle-right"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppliedProjects;

