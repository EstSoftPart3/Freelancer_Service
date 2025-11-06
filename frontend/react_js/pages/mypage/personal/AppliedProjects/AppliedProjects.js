import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/axios';
import MyPageLayout from '../../MyPageLayout';
import styles from './AppliedProjects.module.css';

const AppliedProjects = () => {
  const router = useRouter();
  const { user } = useAuth();

  // State 관리
  const [applications, setApplications] = useState([]);
  const [readType, setReadType] = useState('all');
  const [searchType, setSearchType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedSearchType, setAppliedSearchType] = useState('all');
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ all: 0, read: 0, unread: 0 });

  const itemsPerPage = 5;
  const userType = user?.userType || 'PERSONAL';

  // 필터 계산
  const readFilters = useMemo(
    () => [
      { type: 'all', label: '전체', count: counts.all || 0 },
      { type: 'read', label: '열람', count: counts.read || 0 },
      { type: 'unread', label: '미열람', count: counts.unread || 0 },
    ],
    [counts]
  );

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchApplicationList();
  }, []);

  // currentPage, readType 변경 시 재조회
  useEffect(() => {
    fetchApplicationList();
  }, [currentPage, readType]);

  // 지원 목록 조회
  const fetchApplicationList = async () => {
    try {
      const endpoint =
        userType === 'COMPANY'
          ? `/projects/applications/corporate`
          : `/projects/applications`;

      const params = {
        offset: (currentPage - 1) * itemsPerPage,
        size: itemsPerPage,
        searchType: appliedSearchType,
        keyword: appliedSearchKeyword,
        readType: readType === 'all' ? null : readType,
      };

      const response = await api.$get(endpoint, { params });

      const data = response.output || {};
      setApplications(data.applications || []);
      setTotalPages(Math.max(1, Math.ceil((data.totalCount || 0) / itemsPerPage)));

      // 필터 카운트 갱신
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('❌ 프로젝트 지원 리스트 불러오기 실패:', error);
      alert('지원 현황을 불러올 수 없습니다.');
    }
  };

  // 검색
  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearchType(searchType);
    setAppliedSearchKeyword(searchKeyword);
    fetchApplicationList();
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 열람 필터 설정
  const setReadFilter = (type) => {
    setReadType(type);
    setCurrentPage(1);
  };

  // 페이지 변경
  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 프로젝트 상세 이동
  const goToProjectSpec = (project) => {
    if (userType === 'COMPANY') {
      router.push(`/project/spec/company/${project.projectSq}`);
    } else {
      router.push(`/project/spec/user/${project.projectSq}`);
    }
  };

  // 지원 상태 변경
  const updateAppStatus = async (status, applicationSq) => {
    try {
      await api.$patch(
        `/projects/applications/${applicationSq}`,
        { status }
      );
    } catch (error) {
      console.error('❌ 지원 상태 변경 실패:', error);
    }
  };

  // 지원 취소
  const cancelApplication = async (status, applicationSq) => {
    const confirmed = window.confirm(
      '취소한 프로젝트 내역은 복구할 수 없습니다. 취소하시겠습니까?'
    );

    if (!confirmed) return;

    await updateAppStatus(status, applicationSq);
    await fetchApplicationList();
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
      const response = await api.$get(
        `/projects/applications/interviews/${projectSq}`
      );

      // 모달 구현 필요
      alert(
        `인터뷰 시간 선택 모달 구현 필요\nProject SQ: ${projectSq}\nApplication SQ: ${applicationSq}`
      );
      // 실제 구현:
      // setModalData({
      //   type: 'interviewTimeSelect',
      //   applicationSq,
      //   interviewTimes: response.data.output,
      //   onConfirm: fetchApplicationList,
      // });
    } catch (error) {
      console.error('❌ 인터뷰 시간 조회 실패:', error);
    }
  };

  // 이력서 상세 보기
  const openResumeDetailModal = (item) => {
    // 모달 구현 필요
    alert(`이력서 상세보기 모달 구현 필요\nResume SQ: ${item.resumeSq}`);
    // 실제 구현:
    // setModalData({
    //   type: 'resumeDetail',
    //   resumeSq: item.resumeSq,
    //   projectSq: item.projectSq,
    //   applicationSq: item.applicationSq,
    //   isFromApplicationList: true,
    // });
  };

  // 페이지네이션 컴포넌트
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className={styles.paginationWrapper}>
        <ul className={styles.pagination}>
          <li className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ''}`}>
            <a
              className={styles.pageLink}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
            >
              <i className="fas fa-angle-left"></i>
            </a>
          </li>
          {pageNumbers.map((page) => (
            <li
              key={page}
              className={`${styles.pageItem} ${page === currentPage ? styles.active : ''}`}
            >
              <a
                className={styles.pageLink}
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
            className={`${styles.pageItem} ${
              currentPage === totalPages ? styles.disabled : ''
            }`}
          >
            <a
              className={styles.pageLink}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
            >
              <i className="fas fa-angle-right"></i>
            </a>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <MyPageLayout userType={userType}>
      <div className={styles.container}>
        {/* 페이지 제목 */}
        <div className={styles.row}>
          <div className={styles.col}>
            <h4 className={styles.title}>프로젝트 지원 현황</h4>
          </div>
        </div>

        {/* 필터/검색 UI */}
        <div className={`${styles.row} ${styles.filterRow}`}>
          {/* 좌측: 열람 필터 버튼 */}
          <div className={`${styles.colMd6} ${styles.filterButtons}`}>
            {readFilters.map((filter) => (
              <button
                key={filter.type}
                className={`${styles.filterBtn} ${
                  readType === filter.type ? styles.active : ''
                }`}
                onClick={() => setReadFilter(filter.type)}
              >
                {filter.label}
                <span className={styles.badge}>{filter.count}</span>
              </button>
            ))}
          </div>

          {/* 우측: 검색 */}
          <div className={`${styles.colMd6} ${styles.searchGroup}`}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className={styles.searchSelect}
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
              className={styles.searchInput}
              placeholder="검색어 입력"
            />
            <button className={styles.searchBtn} onClick={handleSearch}>
              검색
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 지원 목록 */}
        <div className={styles.row}>
          <div className={styles.col}>
            {applications.length === 0 ? (
              <div className={styles.emptyMessage}>지원한 프로젝트가 없습니다.</div>
            ) : (
              <ul className={styles.postList}>
                {applications.map((item) => (
                  <li key={item.applicationSq} className={styles.postItem}>
                    <div className={styles.postInfo}>
                      {/* 제목 + 회사명 + 지원상태 버튼 */}
                      <div className={styles.postHeader}>
                        {/* 왼쪽: 제목 / 회사명 */}
                        <div className={styles.postTitleGroup}>
                          <a
                            href="#"
                            className={styles.projectTitle}
                            onClick={(e) => {
                              e.preventDefault();
                              goToProjectSpec(item);
                            }}
                          >
                            {item.projectTitle} / {item.companyTitle}
                          </a>
                        </div>

                        {/* 오른쪽: 상태 버튼들 */}
                        <div className={styles.statusButtons}>
                          {item.applicantType === '지원중' && (
                            <>
                              <span className={styles.statusApplying}>지원중</span>
                              <span
                                className={styles.cancelBtn}
                                onClick={() =>
                                  cancelApplication('지원취소', item.applicationSq)
                                }
                              >
                                지원취소
                              </span>
                            </>
                          )}

                          {item.applicantType === '합격' && (
                            <span className={styles.statusPassed}>합격</span>
                          )}

                          {item.applicantType === '인터뷰확정' && (
                            <div className={styles.interviewWrapper}>
                              <div className={styles.interviewTooltip}>
                                {formatDate(item.interviewDt)}
                              </div>
                              <span className={styles.statusInterview}>
                                인터뷰 확정
                              </span>
                            </div>
                          )}

                          {item.applicantType === '불합격' && (
                            <span className={styles.statusFailed}>불합격</span>
                          )}

                          {item.applicantType === '지원취소' && (
                            <span className={styles.statusCancelled}>지원 취소됨</span>
                          )}

                          {item.applicantType === '인터뷰요청중' && (
                            <a
                              href="#"
                              className={styles.interviewRequestBtn}
                              onClick={(e) => {
                                e.preventDefault();
                                fetchAvailableInterviewTimes(
                                  item.projectSq,
                                  item.applicationSq
                                );
                              }}
                            >
                              인터뷰 요청중
                            </a>
                          )}

                          {item.isRecruitEnded === true && (
                            <span className={styles.statusEnded}>지원 마감</span>
                          )}
                        </div>
                      </div>

                      {/* 지원일자 + 지원자 수 */}
                      <div className={styles.metaRow}>
                        <div className={styles.meta}>
                          <span className={styles.metaLabel}>지원일자</span> |{' '}
                          {formatDate(item.appliedDt)}
                        </div>
                        <div className={styles.meta}>
                          <span className={styles.metaLabel}>지원자 수</span> |{' '}
                          {item.applicantCnt}
                        </div>
                      </div>

                      {/* 지원 이력서 + 열람일자 */}
                      <div className={styles.metaRow}>
                        <div className={styles.meta}>
                          <span className={styles.metaLabel}>지원 이력서</span> |{' '}
                          <span
                            className={styles.resumeHover}
                            onClick={() => openResumeDetailModal(item)}
                          >
                            {userType === 'COMPANY'
                              ? `${item.applicantName} / ${item.resumeTitle}`
                              : item.resumeTitle}
                          </span>
                        </div>
                        <div className={styles.meta}>
                          <span className={styles.metaLabel}>열람일자</span>{' '}
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

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
              />
            )}
          </div>
        </div>
      </div>
    </MyPageLayout>
  );
};

export default AppliedProjects;

