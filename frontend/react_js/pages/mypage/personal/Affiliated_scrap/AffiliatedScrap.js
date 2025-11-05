import { useState, useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';
import { useAlertStore } from '@/store/alertStore';
import { api } from '@/lib/axios';
import AffiliationRecruitModal from '@/components/affiliation/AffiliationRecruitModal';
import CommonConfirmModal from '@/components/myPage/common/CommonConfirmModal';
import MyPageLayout from '../../MyPageLayout';
import styles from './AffiliatedScrap.module.css';

const AffiliatedScrap = () => {
  const { openModal, closeModal } = useModalStore();
  const alertStore = useAlertStore();

  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [scraps, setScraps] = useState([]);

  const size = 10;

  // 스크랩 목록 조회
  const getScrapList = async () => {
    try {
      const searchFilter =
        !keyword || keyword.trim() === ''
          ? ''
          : `&searchType=${searchType}&keyword=${keyword}`;

      const res = await api.$get(
        `/mypage/applications/scraps?page=${currentPage}&size=${size}${searchFilter}`
      );

      if (res.status === 'OK') {
        const totalCnt = res.output.totalElements;

        setScraps(res.output.companies);
        setTotalElements(totalCnt);

        if (totalCnt === 0) {
          setTotalPages(1);
        } else {
          setTotalPages(Math.floor((totalCnt + size - 1) / size));
        }
      }
    } catch (error) {
      alertStore.show('스크랩 내역을 불러올 수 없습니다.', 'danger');
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
      message: `해당 스크랩 내역을 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          const res = await api.$post(`/affiliation/${id}/scrap`);
          if (res.status === 'OK') {
            alertStore.show('스크랩이 삭제되었습니다.', 'success');
            getScrapList();
          }
        } catch (error) {
          alertStore.show('스크랩 내역 삭제에 실패했습니다.', 'danger');
        }
      },
    });
  };

  // 검색
  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로
    getScrapList();
  };

  // 엔터키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 초기 로드 및 페이지 변경 시 재조회
  useEffect(() => {
    getScrapList();
  }, [currentPage]);

  return (
    <MyPageLayout userType="PERSONAL">
    <div>
      <div className="row">
        <div className="col">
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            소속 스크랩 내역
          </h4>
        </div>
      </div>

      {/* 필터 UI */}
      <div className="row align-items-center mt-3 mb-2">
        <div className="col-md-12 d-flex justify-content-end gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="form-select form-select-sm w-auto"
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
            className="form-control form-control-sm w-auto"
            placeholder="검색어 입력"
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSearch}
          >
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
          {scraps.length === 0 ? (
            <div className="text-center text-muted py-5">
              스크랩 내역이 없습니다.
            </div>
          ) : (
            <ul className="simple-post-list m-0 position-relative">
              {scraps.map((scrap) => (
                <li
                  key={scrap.id}
                  style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
                >
                  <div className="post-info position-relative">
                    {/* 제목 + 회사명 + 지원상태 버튼 */}
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <div className="d-flex gap-2">
                        <a
                          href="#"
                          className="text-6 m-0"
                          onClick={(e) => {
                            e.preventDefault();
                            clickDetail(scrap);
                          }}
                        >
                          {scrap.companyNm}
                        </a>
                      </div>
                      <div className="d-flex gap-2">
                        <span
                          className={`btn btn-sm ${
                            scrap.isRecruitingYn === 'N'
                              ? 'btn-light'
                              : 'btn-primary'
                          }`}
                        >
                          {scrap.isRecruitingYn === 'Y' ? '모집 중' : '모집 마감'}
                        </span>
                        <a
                          href="#"
                          className="btn btn-outline btn-primary btn-sm"
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
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="post-meta text-4 text-end ms-auto">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          소속 직원 수
                        </span>
                        | {scrap.memberCnt}
                      </div>
                    </div>

                    {/* 지원자격/개업일자 */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          태그
                        </span>
                        | {scrap.tags?.join(' / ')}
                      </div>
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          개업일자
                        </span>
                        | {scrap.openDt}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-end mt-4">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                  >
                    &laquo;
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
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </a>
                  </li>
                ))}
                <li
                  className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                  >
                    &raquo;
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
    </MyPageLayout>
  );
};

export default AffiliatedScrap;

