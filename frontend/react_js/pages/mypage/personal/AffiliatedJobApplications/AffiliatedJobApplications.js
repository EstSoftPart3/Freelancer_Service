import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/axios';
import { useModalStore } from '@/store/modalStore';
import AffiliationRequestDetailModal from '@/components/myPage/personal/AffiliationRequestDetailModal';
import MyPageLayout from '../../MyPageLayout';
import styles from './AffiliatedJobApplications.module.css';

const AffiliatedJobApplications = () => {
  const { openModal } = useModalStore();

  // State 관리
  const [applies, setApplies] = useState([]);
  const [readType, setReadType] = useState('all');
  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [readElements, setReadElements] = useState(0);
  const [unreadElements, setUnreadElements] = useState(0);

  const size = 10;

  // 필터 계산
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
    getApplies();
  }, []);

  // currentPage, readType 변경 시 재조회
  useEffect(() => {
    getApplies();
  }, [currentPage, readType]);

  // 지원 현황 조회
  const getApplies = async () => {
    try {
      const searchFilter =
        !keyword || keyword.trim() === ''
          ? ''
          : `&searchType=${searchType}&keyword=${keyword}`;

      const readFilter =
        !readType || readType === 'all' ? '' : `&readType=${readType}`;

      const response = await api.$get(
        `/mypage/applications/user?page=${currentPage}&size=${size}${searchFilter}${readFilter}`
      );

      if (response.status === 'OK') {
        const output = response.output;
        const totalCnt = output.totalElements;
        const readCnt = output.readElements;
        const unreadCnt = totalCnt - readCnt;

        setApplies(output.applies || []);
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
      console.error('지원 현황 조회 실패:', error);
      alert('지원 현황을 불러올 수 없습니다.');
    }
  };

  // 날짜 포맷팅
  const convertDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    return `${year}.${month}.${day}`;
  };

  // 필터 설정
  const setFilter = (type) => {
    setReadType(type);
    setCurrentPage(1);
  };

  // 검색
  const handleSearch = () => {
    setCurrentPage(1);
    getApplies();
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 지원 취소
  const cancelApply = async (applicationSq) => {
    const confirmed = window.confirm('해당 소속에 지원 취소하시겠습니까?');

    if (!confirmed) return;

    try {
      const response = await api.$patch(`/mypage/applications/${applicationSq}`);

      if (response.status === 'OK') {
        alert('지원 취소되었습니다.');
        getApplies();
      }
    } catch (error) {
      console.error('지원 취소 실패:', error);
      alert('지원 취소에 실패했습니다.');
    }
  };

  // 상세보기 모달 열기
  const openDetailModal = (applicationSq) => {
    openModal(AffiliationRequestDetailModal, {
      applicationSq: applicationSq,
    });
  };

  // 페이지 변경
  const updateCurrentPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              &laquo;
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
              &raquo;
            </a>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <MyPageLayout userType="PERSONAL">
      <div className={styles.container}>
        {/* 페이지 제목 */}
        <div className={styles.row}>
          <div className={styles.col}>
            <h4 className={styles.title}>소속 공고 지원 현황</h4>
          </div>
        </div>

        {/* 필터/검색 UI */}
        <div className={`${styles.row} ${styles.filterRow}`}>
          {/* 좌측: 필터 버튼 */}
          <div className={`${styles.colMd6} ${styles.filterButtons}`}>
            {filters.map((filter) => (
              <button
                key={filter.type}
                className={`${styles.filterBtn} ${
                  readType === filter.type ? styles.active : ''
                }`}
                onClick={() => setFilter(filter.type)}
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
              <option value="title">이력서 제목</option>
              <option value="name">회사명</option>
              <option value="greeting">인사말</option>
            </select>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
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
            <ul className={styles.postList}>
              {applies.map((apply) => (
                <li key={apply.applicationSq} className={styles.postItem}>
                  <div className={styles.postInfo}>
                    {/* 제목 + 회사명 + 지원상태 버튼 */}
                    <div className={styles.postHeader}>
                      <div className={styles.postTitleGroup}>
                        <button
                          type="button"
                          className={styles.companyName}
                          onClick={() => openDetailModal(apply.applicationSq)}
                        >
                          {apply.companyNm}
                        </button>
                      </div>
                      <div className={styles.statusButtons}>
                        {apply.isDeleted === 'Y' ? (
                          <span className={styles.statusCancelled}>지원 취소 완료</span>
                        ) : apply.statusCd === 501 ? (
                          <>
                            <span className={styles.statusApplying}>지원중</span>
                            <button
                              type="button"
                              className={styles.cancelBtn}
                              onClick={() => cancelApply(apply.applicationSq)}
                            >
                              지원 취소
                            </button>
                          </>
                        ) : (
                          <>
                            {apply.statusCd === 502 && (
                              <span className={styles.statusPassed}>합격</span>
                            )}
                            {apply.statusCd === 503 && (
                              <span className={styles.statusFailed}>불합격</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* 지원일자 + 지원자 수 */}
                    <div className={styles.metaRow}>
                      <div className={styles.meta}>
                        <span className={styles.metaLabel}>지원일자</span> |{' '}
                        {convertDate(apply.createdAt)}
                      </div>
                      <div className={styles.meta}>
                        <span className={styles.metaLabel}>지원자 수</span> |{' '}
                        {apply.applicantCnt}
                      </div>
                    </div>

                    {/* 지원 이력서 + 열람일자 */}
                    <div className={styles.metaRow}>
                      <div className={styles.meta}>
                        <span className={styles.metaLabel}>지원 이력서</span> |{' '}
                        {apply.resumeTtl}
                      </div>
                      <div className={styles.meta}>
                        <span className={styles.metaLabel}>열람일자</span> |{' '}
                        {apply.readAt ? convertDate(apply.readAt) : '미열람'}
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              {applies.length === 0 && (
                <li className={styles.emptyMessage}>지원 내역이 없습니다.</li>
              )}
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
      </div>
    </MyPageLayout>
  );
};

export default AffiliatedJobApplications;

