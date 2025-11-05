import { useState, useEffect, useMemo } from 'react';
import { useModalStore } from '../../../store/modalStore';
import { useAlertStore } from '../../../store/alertStore';
import CommonConfirmModal from '../common/CommonConfirmModal';
import ResumeDetailModal from '../common/ResumeDetailModal';
import { api } from '@/lib/axios';
import skillIconMap from '@/lib/skillIconMap';
import './PersonalApplyStatusModal.module.css';

const PersonalApplyStatusModal = ({ projectSq, projectTitle, onToggle }) => {
  const modalStore = useModalStore();
  const alertStore = useAlertStore();

  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchType, setSearchType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [applicantType] = useState('personal');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [localApplicants, setLocalApplicants] = useState([]);

  // 개인 지원자 목록 조회
  const fetchPersonalApplicants = async () => {
    try {
      const res = await api.$get(
        `/projects/applications/${projectSq}/personal?page=${currentPage}&size=${pageSize}&filter=${currentFilter}&searchType=${searchType}&keyword=${searchText}`
      );
      setLocalApplicants(res.response || []);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      console.error('개인 지원자 목록 불러오기 실패', error);
      setLocalApplicants([]);
      setTotalPages(1);
    }
  };

  // 초기 로드 및 필터/페이지 변경 시 재조회
  useEffect(() => {
    fetchPersonalApplicants();
  }, [currentPage, currentFilter, searchType, searchText]);

  // 필터별 카운트 계산
  const filterCounts = useMemo(() => {
    const counts = {
      all: 0,
      passed: 0,
      in_progress: 0,
      interview_confirmed: 0,
      interview_requested: 0,
      rejected: 0,
    };
    localApplicants.forEach((a) => {
      counts.all++;
      const status = a.appStatusVo?.appStatus;
      if (status === '지원중') counts.in_progress++;
      else if (status === '합격') counts.passed++;
      else if (status === '인터뷰확정') counts.interview_confirmed++;
      else if (status === '인터뷰요청중') counts.interview_requested++;
      else if (['불합격', '지원취소'].includes(status)) counts.rejected++;
    });
    return counts;
  }, [localApplicants]);

  // 필터 목록
  const filters = useMemo(
    () => [
      { type: 'all', label: '전체', count: filterCounts.all },
      { type: 'passed', label: '합격', count: filterCounts.passed },
      { type: 'in_progress', label: '지원중', count: filterCounts.in_progress },
      {
        type: 'interview_confirmed',
        label: '인터뷰확정',
        count: filterCounts.interview_confirmed,
      },
      {
        type: 'interview_requested',
        label: '인터뷰요청중',
        count: filterCounts.interview_requested,
      },
      {
        type: 'rejected',
        label: '불합격 / 취소',
        count: filterCounts.rejected,
      },
    ],
    [filterCounts]
  );

  // 기업 모드로 토글
  const toggleToCorporate = () => {
    onToggle?.(projectSq, projectTitle);
  };

  // 필터 변경
  const setFilter = (type) => {
    setCurrentFilter(type);
    setCurrentPage(1);
  };

  // 검색
  const search = () => {
    setCurrentPage(1);
  };

  // 페이지 변경
  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 모달 닫기
  const closeModal = () => {
    modalStore.closeModal();
  };

  // 로컬 상태 업데이트
  const updateStatusLocally = (applicationSq, newStatus) => {
    setLocalApplicants((prev) =>
      prev.map((app) =>
        app.applicationSq === applicationSq
          ? {
              ...app,
              appStatusVo: { ...app.appStatusVo, appStatus: newStatus },
            }
          : app
      )
    );
  };

  // 상태 변경
  const updateStatus = async (applicationSq, status) => {
    try {
      await api.$patch(
        `/projects/applications/${applicationSq}`,
        { status }
      );
      updateStatusLocally(applicationSq, status);
      alertStore.show('상태가 정상적으로 변경되었습니다.');
    } catch (e) {
      console.error('지원 상태 변경 실패', e);
      alertStore.show('상태 변경 중 오류가 발생했습니다.', 'danger');
    }
  };

  // 불합격 확인 모달
  const openStatusFailureModal = (applicationSq) => {
    modalStore.openModal(CommonConfirmModal, {
      message: '해당 지원자를 불합격 처리하겠습니까?',
      onConfirm: async () => {
        await updateStatus(applicationSq, '불합격');
        modalStore.closeModal();
      },
    });
  };

  // 이력서 상세보기 모달
  const openResumeDetailModal = (resumeSq, applicationSq) => {
    modalStore.openModal(ResumeDetailModal, {
      title: '이력서 상세보기',
      size: 'modal-lg',
      resumeSq: resumeSq,
      applicationSq: applicationSq,
      projectSq: projectSq,
      isFromApplicationList: true,
    });
  };

  // 스킬 아이콘 URL 생성
  const generateIconUrl = (name) => {
    const key = name.toLowerCase().replace(/[\s.]+/g, '');
    return skillIconMap[key] || skillIconMap.default;
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 상태별 버튼 렌더링
  const renderStatusButtons = (applicant) => {
    const status = applicant.appStatusVo.appStatus;

    if (status === '지원중') {
      return (
        <>
          <span
            onClick={() => updateStatus(applicant.applicationSq, '인터뷰요청중')}
            className="btn btn-outline btn-primary btn-sm"
          >
            인터뷰 요청
          </span>
          <span
            onClick={() => openStatusFailureModal(applicant.applicationSq)}
            className="btn btn-outline btn-primary btn-sm"
          >
            불합격
          </span>
        </>
      );
    } else if (status === '인터뷰요청중') {
      return <span className="btn btn-primary btn-sm">인터뷰 요청중</span>;
    } else if (status === '불합격') {
      return <span className="btn btn-primary btn-sm">불합격</span>;
    } else if (status === '인터뷰확정') {
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
            {formatDate(applicant.appStatusVo.interviewDt)}
          </div>
          <span className="btn btn-light btn-sm interview">인터뷰 확정</span>
        </div>
      );
    } else if (status === '지원취소') {
      return <span className="btn btn-light btn-sm">지원 취소됨</span>;
    }
    return null;
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h3 className="modal-title">지원 현황</h3>
        <button
          type="button"
          className="btn-close"
          onClick={closeModal}
          aria-hidden="true"
        >
          ×
        </button>
      </div>
      <div
        className="modal-body"
        style={{ maxHeight: '80vh', overflowY: 'auto', padding: 0 }}
      >
        <div className="container py-1 mt-3">
          <div className="row">
            <div className="col">
              <h1 className="font-weight-normal text-10 mb-20">
                <strong>{projectTitle}</strong>
              </h1>
            </div>
          </div>

          {/* 필터 UI */}
          <div className="row align-items-center mt-3 mb-2">
            {/* 좌측 토글 버튼 */}
            <div className="col-md-8 d-flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.type}
                  className={`btn btn-primary fw-bold px-2 py-2 d-flex align-items-center gap-2 fs-6 btn-sm ${
                    currentFilter === filter.type ? 'active' : ''
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

            {/* 우측 셀렉트 + 검색 */}
            <div className="col-md-4 d-flex justify-content-end gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="form-select form-select-sm w-auto"
              >
                <option value="all">전체</option>
                <option value="name">이름</option>
                <option value="skills">사용 기술</option>
              </select>
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                type="text"
                className="form-control form-control-sm w-auto"
                placeholder="검색어 입력"
              />
              <button className="btn btn-primary btn-sm" onClick={search}>
                검색
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-12 d-flex justify-content-end pt-2 mt-1">
              <div className="btn-group" role="group" aria-label="개인 기업 토글">
                <button
                  type="button"
                  className={`btn btn-primary ${
                    applicantType === 'personal' ? 'active' : ''
                  }`}
                >
                  개인
                </button>
                <button
                  type="button"
                  className={`btn btn-primary btn-outline ${
                    applicantType === 'company' ? 'active' : ''
                  }`}
                  onClick={toggleToCorporate}
                >
                  기업
                </button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col" style={{ padding: 0 }}>
              <hr className="my-4" />
            </div>
          </div>

          {/* 지원자 목록 */}
          <div className="row">
            <div className="col">
              {localApplicants.length === 0 ? (
                <div className="text-muted py-3" style={{ fontSize: '14px' }}>
                  조건에 해당하는 개인 지원자가 없습니다.
                </div>
              ) : (
                <ul className="simple-post-list m-0 position-relative">
                  {localApplicants.map((applicant) => (
                    <li
                      key={applicant.applicationSq}
                      style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
                    >
                      <div className="post-info position-relative">
                        {/* 제목 + 회사명 + 지원상태 버튼 */}
                        <div className="d-flex justify-content-between align-items-center gap-2">
                          <div className="d-flex gap-2">
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                openResumeDetailModal(
                                  applicant.resumeSq,
                                  applicant.applicationSq
                                );
                              }}
                              href="#"
                              className="d-flex gap-1 align-items-center text-decoration-none"
                            >
                              <span className="text-6 m-0">
                                {applicant.resumeNmTtlVo.resumeNm} /
                              </span>
                              <span className="text-5 m-0">
                                {applicant.resumeNmTtlVo.resumeTtl}
                              </span>
                            </a>
                          </div>
                          <div className="d-flex gap-2">
                            {renderStatusButtons(applicant)}
                          </div>
                        </div>

                        {/* 경력 + 열람일자 */}
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className="post-meta text-4">
                            <span className="text-dark text-uppercase font-weight-semibold">
                              경력
                            </span>
                            | {applicant.careerYear}년차
                          </div>
                          <div className="post-meta text-4">
                            <span className="text-dark text-uppercase font-weight-semibold">
                              열람일자
                            </span>
                            | {applicant.appStatusVo.readResumeDt || '미열람'}
                          </div>
                        </div>

                        {/* 사용 기술 + 지원일자 */}
                        <div
                          className="d-flex justify-content-between align-items-center mt-2"
                          style={{ fontSize: '16.8px !important' }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-dark text-uppercase font-weight-semibold">
                              사용 기술
                            </span>
                            |
                            {applicant.skillNames.map((skill) => (
                              <div
                                key={skill}
                                className="btn d-flex align-items-center gap-2 border-0"
                              >
                                <img
                                  src={generateIconUrl(skill)}
                                  alt={skill}
                                  width="24"
                                  height="24"
                                />
                                <span>{skill}</span>
                              </div>
                            ))}
                          </div>
                          <div className="post-meta" style={{ fontSize: '16.8px' }}>
                            <span
                              className="text-dark text-uppercase font-weight-semibold"
                              style={{ fontSize: '16.8px' }}
                            >
                              지원일자
                            </span>
                            | {applicant.appStatusVo.appDt}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* 페이지네이션 */}
              <div className="mt-5 py-5">
                <ul className="pagination float-end">
                  <li className="page-item">
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
                      className={`page-item ${
                        currentPage === page ? 'active' : ''
                      }`}
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
                  <li className="page-item">
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
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-light" onClick={closeModal}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default PersonalApplyStatusModal;

