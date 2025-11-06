import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/axios';
import { useModalStore } from '@/store/modalStore';
import { useAlertStore } from '@/store/alertStore';
import AffiliationRecruitModal from '@/components/affiliation/AffiliationRecruitModal';
import CommonConfirmModal from '@/components/myPage/common/CommonConfirmModal';
import MyPageLayout from '../../MyPageLayout';
import styles from './AffiliatedScrap.module.css';

const AffiliatedScrap = () => {
  const { openModal } = useModalStore();
  const alertStore = useAlertStore();
  const { user } = useAuth();
  const userType = user?.userType || 'PERSONAL';

  // State 관리
  const [scraps, setScraps] = useState([]);
  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const size = 10;

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    getScrapList();
  }, []);

  // currentPage 변경 시 재조회
  useEffect(() => {
    getScrapList();
  }, [currentPage]);

  // 스크랩 목록 조회
  const getScrapList = async () => {
    try {
      const searchFilter =
        !keyword || keyword.trim() === ''
          ? ''
          : `&searchType=${searchType}&keyword=${keyword}`;

      const response = await api.$get(
        `/mypage/applications/scraps?page=${currentPage}&size=${size}${searchFilter}`
      );

      if (response.status === 'OK') {
        const output = response.output;
        const totalCnt = output.totalElements;

        setScraps(output.companies || []);
        setTotalElements(totalCnt);

        const pages = totalCnt === 0 ? 1 : Math.floor((totalCnt + size - 1) / size);
        setTotalPages(pages);
      }
    } catch (error) {
      console.error('스크랩 내역 조회 실패:', error);
      alertStore.show('스크랩 내역을 불러올 수 없습니다.', 'danger');
    }
  };

  // 검색
  const handleSearch = () => {
    setCurrentPage(1);
    getScrapList();
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 소속 신청하기 모달 열기
  const clickDetail = (afltnInfo) => {
    openModal(AffiliationRecruitModal, {
      afltnInfo: afltnInfo,
      onConfirm: () => {
        getScrapList();
      },
    });
  };

  // 스크랩 삭제
  const removeScrap = (id) => {
    openModal(CommonConfirmModal, {
      title: '소속 스크랩 삭제',
      message: '해당 스크랩 내역을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          const response = await api.$post(`/affiliation/${id}/scrap`);

          if (response.status === 'OK') {
            alertStore.show('스크랩이 삭제되었습니다.', 'success');
            getScrapList();
          }
        } catch (error) {
          console.error('스크랩 삭제 실패:', error);
          alertStore.show('스크랩 내역 삭제에 실패했습니다.', 'danger');
        }
      },
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
    <MyPageLayout userType={userType}>
      <div className={styles.container}>
        {/* 페이지 제목 */}
        <div className={styles.row}>
          <div className={styles.col}>
            <h4 className={styles.title}>소속 스크랩 내역</h4>
          </div>
        </div>

        {/* 검색 UI */}
        <div className={`${styles.row} ${styles.searchRow}`}>
          <div className={`${styles.col} ${styles.searchGroup}`}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className={styles.searchSelect}
            >
              <option value="all">전체</option>
              <option value="company">회사명</option>
              <option value="tag">태그</option>
              <option value="content">소개</option>
            </select>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              type="text"
              className={styles.searchInput}
              placeholder="검색어 입력"
            />
            <button
              type="button"
              className={styles.searchBtn}
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 스크랩 목록 */}
        <div className={styles.row}>
          <div className={styles.col}>
            <ul className={styles.postList}>
              {scraps.map((scrap) => (
                <li key={scrap.id} className={styles.postItem}>
                  <div className={styles.postInfo}>
                    {/* 회사명 + 모집 상태 버튼 */}
                    <div className={styles.postHeader}>
                      <div className={styles.postTitleGroup}>
                        <a
                          href="#"
                          className={styles.companyName}
                          onClick={(e) => {
                            e.preventDefault();
                            clickDetail(scrap);
                          }}
                        >
                          {scrap.companyNm}
                        </a>
                      </div>
                      <div className={styles.actionButtons}>
                        <span
                          className={
                            scrap.isRecruitingYn === 'N'
                              ? styles.statusClosed
                              : styles.statusRecruiting
                          }
                        >
                          {scrap.isRecruitingYn === 'Y' ? '모집 중' : '모집 마감'}
                        </span>
                        <a
                          href="#"
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.preventDefault();
                            removeScrap(scrap.sq);
                          }}
                        >
                          삭제
                        </a>
                      </div>
                    </div>

                    {/* 직원수 */}
                    <div className={styles.metaRow}>
                      <div className={`${styles.meta} ${styles.metaRight}`}>
                        <span className={styles.metaLabel}>소속 직원 수</span> |{' '}
                        {scrap.memberCnt}
                      </div>
                    </div>

                    {/* 태그 / 개업일자 */}
                    <div className={styles.metaRow}>
                      <div className={styles.meta}>
                        <span className={styles.metaLabel}>태그</span> |{' '}
                        {scrap.tags?.join(' / ')}
                      </div>
                      <div className={styles.meta}>
                        <span className={styles.metaLabel}>개업일자</span> |{' '}
                        {scrap.openDt}
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              {scraps.length === 0 && (
                <li className={styles.emptyMessage}>스크랩 내역이 없습니다.</li>
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

export default AffiliatedScrap;

