import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/axios';
import MyPageLayout from '../../MyPageLayout';
import './ProjectScrap.module.css';

// skillIconMap import 경로는 프로젝트 구조에 맞게 조정하세요
// import skillIconMap from '../../../../assets/skillIconMap';

const ProjectScrap = () => {
  const router = useRouter();
  
  // State 관리
  const [scraps, setScraps] = useState([]);
  const [searchType, setSearchType] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userType, setUserType] = useState('PERSONAL'); // userStore에서 가져오도록 수정
  
  const itemsPerPage = 5;

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchScraps();
  }, [currentPage]);

  // 날짜 포맷 함수 (yyyy.MM.dd)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  // 프로젝트 상세 페이지로 이동
  const goToProjectDetail = (projectSq) => {
    if (userType === 'PERSONAL') {
      router.push(`/project/spec/user/${projectSq}`);
    } else if (userType === 'COMPANY') {
      router.push(`/project/spec/company/${projectSq}`);
    }
  };

  // API 호출 - 스크랩 목록 조회
  const fetchScraps = async () => {
    try {
      const params = {
        searchType: searchType,
        searchKeyword: searchKeyword,
        page: currentPage,
        size: itemsPerPage,
      };
      
      // API 호출 - 실제 엔드포인트와 인증 방식에 맞게 수정하세요
      const response = await api.$get('/mypage/projectScrap', { params });
      
      const output = response.output;
      setScraps(output.content || []);
      setTotalPages(Math.ceil((output.totalCount || 0) / itemsPerPage) || 1);
    } catch (error) {
      console.error('프로젝트 스크랩 조회 실패:', error);
    }
  };

  // 검색 처리
  const handleSearch = () => {
    setCurrentPage(1);
    fetchScraps();
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 스크랩 삭제
  const removeScrap = async (projectSq) => {
    try {
      const response = await api.$delete(`/mypage/projectScrap/${projectSq}`);
      
      if (response.status === 'OK') {
        // 마지막 페이지의 마지막 항목 삭제 시 이전 페이지로
        if (scraps.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          await fetchScraps();
        }
        alert('스크랩이 삭제되었습니다.');
      } else {
        alert('스크랩 삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('스크랩 삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  // 페이지 변경
  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 스킬 아이콘 URL 생성
  const generateIconUrl = (name) => {
    // skillIconMap 사용 - 실제 구현에 맞게 수정하세요
    const key = name.toLowerCase().replace(/[\s.]+/g, '');
    // return skillIconMap[key] || skillIconMap.default;
    return null; // 임시로 null 반환
  };

  // 페이지 번호 배열 생성
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <MyPageLayout userType="PERSONAL">
      <div className="project-scrap-container">
      <div className="row">
        <div className="col">
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            프로젝트 스크랩 내역
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
            <option value="전체">전체</option>
            <option value="제목">제목</option>
            <option value="회사명">회사명</option>
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
          <ul className="simple-post-list m-0 position-relative">
            {scraps.map((item) => (
              <li
                key={item.projectSq}
                style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
              >
                <div className="post-info position-relative">
                  {/* 제목 + 회사명 + 상태 */}
                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <div className="d-flex gap-2">
                      <a
                        href="#"
                        className="text-5 m-0"
                        onClick={(e) => {
                          e.preventDefault();
                          goToProjectDetail(item.projectSq);
                        }}
                      >
                        {item.projectTtl} /{' '}
                        <span style={{ fontSize: '1.25rem' }}>
                          {item.company.companyNm}
                        </span>
                      </a>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <span
                        className={`btn ${
                          item.dday >= 0 ? 'btn-primary' : 'btn-light'
                        } btn-sm`}
                      >
                        {item.dday >= 0 ? '채용중' : '채용 마감'}
                        {item.dday !== null && item.dday >= 0 && (
                          <span className="badge bg-white text-primary fw-bold px-2 py-1 ms-1">
                            D-{item.dday}
                          </span>
                        )}
                      </span>
                      <button
                        className="btn btn-outline btn-primary btn-sm"
                        onClick={() => removeScrap(item.projectSq)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 지원자 수 + 등록일 */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="post-meta text-4">
                      <span className="text-dark text-uppercase font-weight-semibold">
                        등록일자
                      </span>
                      | {formatDate(item.createdAt)}
                    </div>
                    <div className="post-meta text-4">
                      <span className="text-dark text-uppercase font-weight-semibold">
                        지원자 수
                      </span>
                      | {item.candidateCnt}
                    </div>
                  </div>

                  {/* 지원 자격 + 기간 */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div
                      className="post-meta text-4 me-3 flex-grow-1"
                      style={{ minWidth: 0 }}
                    >
                      <div className="mb-1">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          지원 자격
                        </span>
                        | {item.address.parentSigungu} {item.address.sigungu} /{' '}
                        {item.developerGrade} / {item.requiredEducation}
                      </div>

                      {/* 기술 스택 */}
                      <div className="d-flex flex-wrap gap-2">
                        {item.skillTags.map((skill, index) => (
                          <span
                            key={index}
                            className="badge bg-light text-dark px-2 py-1"
                          >
                            {generateIconUrl(skill) && (
                              <img
                                src={generateIconUrl(skill)}
                                width="24"
                                height="24"
                                alt={skill}
                              />
                            )}
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="post-meta text-4">
                      <span className="text-dark text-uppercase font-weight-semibold">
                        채용기간
                      </span>
                      | {item.recruitStartDt} ~ {item.recruitEndDt}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {scraps.length === 0 && (
              <li className="text-center py-5 text-muted">
                검색 결과가 없습니다.
              </li>
            )}
          </ul>

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
    </MyPageLayout>
  );
};

export default ProjectScrap;

