import { useState, useEffect, useMemo } from 'react';
import { useModalStore } from '../../../store/modalStore';
import { useAlertStore } from '../../../store/alertStore';
import AffiliationRequestDetailModal from '../../../components/myPage/personal/AffiliationRequestDetailModal';
import CommonConfirmModal from '../../../components/common/CommonConfirmModal';
import CommonPagination from '../../../components/common/CommonPagination';
import api from '../../../utils/api';
import './AffiliatedJobApplications.css';

const AffiliatedJobApplications = () => {
  const modalStore = useModalStore();
  const alertStore = useAlertStore();

  const [readType, setReadType] = useState('all');
  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [readElements, setReadElements] = useState(0);
  const [unreadElements, setUnreadElements] = useState(0);
  const [applies, setApplies] = useState([]);

  const size = 10;

  // 필터 목록
  const filters = useMemo(
    () => [
      { type: 'all', label: '전체', count: totalElements },
      { type: 'read', label: '열람', count: readElements },
      { type: 'unread', label: '미열람', count: unreadElements },
    ],
    [totalElements, readElements, unreadElements]
  );

  // 지원 현황 조회
  const getApplies = async () => {
    try {
      const searchFilter =
        !keyword || keyword.trim() === ''
          ? ''
          : `&searchType=${searchType}&keyword=${keyword}`;
      const readFilter =
        !readType || readType === 'all' ? '' : `&readType=${readType}`;

      const res = await api.get(
        `/mypage/applications/user?page=${currentPage}&size=${size}${searchFilter}${readFilter}`
      );

      if (res.status === 'OK') {
        const totalCnt = res.output.totalElements;
        const unreadCnt = res.output.totalElements - res.output.readElements;
        const readCnt = res.output.readElements;

        setApplies(res.output.applies);
        setTotalElements(totalCnt);
        setReadElements(readCnt);
        setUnreadElements(unreadCnt);

        let calculatedPages = 1;

        if (readType === 'read') {
          if (!readCnt || !size || size <= 0) {
            calculatedPages = 1;
          } else {
            calculatedPages = Math.floor((readCnt + size - 1) / size);
          }
        } else if (readType === 'unread') {
          if (!unreadCnt || !size || size <= 0) {
            calculatedPages = 1;
          } else {
            calculatedPages = Math.floor((unreadCnt + size - 1) / size);
          }
        } else {
          if (!totalCnt || !size || size <= 0) {
            calculatedPages = 1;
          } else {
            calculatedPages = Math.floor((totalCnt + size - 1) / size);
          }
        }

        setTotalPages(calculatedPages);
      }
    } catch (error) {
      alertStore.show('지원 현황을 불러올 수 없습니다.', 'danger');
    }
  };

  // 날짜 변환
  const convertDate = (createdAt) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    return `${year}.${month}.${day}`;
  };

  // 필터 변경
  const handleSetFilter = (type) => {
    setReadType(type);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  // 검색
  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로
    getApplies();
  };

  // 엔터키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 지원 취소
  const cancelApply = (id) => {
    modalStore.openModal(CommonConfirmModal, {
      title: '지원 상태 변경',
      message: `해당 소속에 지원 취소하시겠습니까?`,
      onConfirm: async () => {
        try {
          const res = await api.patch(`/mypage/applications/${id}`);
          if (res.status === 'OK') {
            alertStore.show('지원 취소되었습니다.', 'success');
            getApplies();
          }
        } catch (error) {
          alertStore.show('지원 취소에 실패했습니다.', 'danger');
        }
        modalStore.closeModal();
      },
    });
  };

  // 상세 모달 열기
  const openDetailModal = (applicationSq) => {
    modalStore.openModal(AffiliationRequestDetailModal, {
      applicationSq,
    });
  };

  // 초기 로드 및 필터/페이지 변경 시 재조회
  useEffect(() => {
    getApplies();
  }, [currentPage, readType]);

  // 검색어 또는 검색 타입 변경 시에는 수동 검색 버튼 클릭 필요
  // (자동 검색을 원하면 useEffect에 searchType, keyword 추가)

  return (
    <div>
      <div className="row">
        <div className="col">
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            소속 공고 지원 현황
          </h4>
        </div>
      </div>

      {/* 필터 UI */}
      <div className="row align-items-center mt-3 mb-2">
        {/* 좌측 토글 버튼 */}
        <div className="col-md-6 d-flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.type}
              className={`btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2 fs-6 ${
                readType === filter.type ? 'active' : ''
              }`}
              onClick={() => handleSetFilter(filter.type)}
            >
              {filter.label}
              <span className="badge bg-white text-primary fw-bold px-2 py-1">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* 우측 셀렉트 + 검색 */}
        <div className="col-md-6 d-flex justify-content-end gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="form-select form-select-sm w-auto"
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
          {applies.length === 0 ? (
            <div className="text-center text-muted py-5">
              조건에 맞는 지원 현황이 없습니다.
            </div>
          ) : (
            <ul className="simple-post-list m-0 position-relative">
              {applies.map((apply) => (
                <li
                  key={apply.applicationSq}
                  style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
                >
                  <div className="post-info position-relative">
                    {/* 제목 + 회사명 + 지원상태 버튼 */}
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="text-5 m-0 text-primary btn-link"
                          onClick={() => openDetailModal(apply.applicationSq)}
                        >
                          {apply.companyNm}
                        </button>
                      </div>
                      <div className="d-flex gap-2">
                        {apply.isDeleted === 'Y' ? (
                          <span className="btn btn-light btn-sm">지원 취소 완료</span>
                        ) : apply.statusCd === 501 ? (
                          <>
                            <span className="btn btn-primary btn-sm">지원중</span>
                            <button
                              type="button"
                              className="btn btn-outline btn-primary btn-sm"
                              onClick={() => cancelApply(apply.applicationSq)}
                            >
                              지원 취소
                            </button>
                          </>
                        ) : (
                          <>
                            {apply.statusCd === 502 && (
                              <span className="btn btn-light btn-sm">합격</span>
                            )}
                            {apply.statusCd === 503 && (
                              <span className="btn btn-light btn-sm">불합격</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* 지원일자 + 지원자 수 */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          지원일자
                        </span>
                        | {convertDate(apply.createdAt)}
                      </div>
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          지원자 수
                        </span>
                        | {apply.applicantCnt}
                      </div>
                    </div>

                    {/* 지원 이력서 + 열람일자 */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          지원 이력서
                        </span>
                        | {apply.resumeTtl}
                      </div>
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          열람일자
                        </span>
                        | {apply.readAt ? convertDate(apply.readAt) : '미열람'}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 페이징 */}
          <CommonPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default AffiliatedJobApplications;

