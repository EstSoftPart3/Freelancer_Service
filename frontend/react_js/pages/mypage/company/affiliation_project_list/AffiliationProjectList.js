import ProjectApplyStatusModal from '@/components/myPage/personal/ProjectApplyStatusModal';
import { api } from '@/lib/axios';
import { useModalStore } from '@/store/modalStore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import MyPageLayout from '../../MyPageLayout';
import './AffiliationProjectList.module.css';

// skillIconMap import - 경로는 프로젝트에 맞게 조정

const AffiliationProjectList = () => {
  const router = useRouter();
  const modalStore = useModalStore();

  // State 관리
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentStatusCnt, setCurrentStatusCnt] = useState({});
  const [searchType, setSearchType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [userType] = useState('COMPANY'); // userStore에서 가져오도록 수정 필요

  // 검색 옵션
  const searchOptions = [
    { value: 'all', label: '전체' },
    { value: 'title', label: '제목' },
    { value: 'content', label: '내용' },
  ];

  // 필터 계산 (useMemo로 computed 대체)
  const filters = useMemo(
    () => [
      {
        type: 'all',
        label: '전체',
        count: currentStatusCnt.allCount ?? 0,
      },
      {
        type: 'recruiting',
        label: '채용중',
        count: currentStatusCnt.recruiting ?? 0,
      },
      {
        type: 'closed',
        label: '지원 마감',
        count: currentStatusCnt.closed ?? 0,
      },
      {
        type: 'scheduled',
        label: '예정',
        count: currentStatusCnt.scheduled ?? 0,
      },
    ],
    [currentStatusCnt]
  );

  // 필터링된 프로젝트 (computed 대체)
  const filteredProjects = useMemo(() => {
    if (currentFilter === 'all') return projects;
    return projects.filter((post) => {
      const status = getPostStatus(post).status;
      return (
        (currentFilter === 'recruiting' && status === '채용중') ||
        (currentFilter === 'closed' && status === '채용종료') ||
        (currentFilter === 'scheduled' && status === '채용예정')
      );
    });
  }, [projects, currentFilter]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCompanyProjectList();
    fetchStatusCounts();
  }, []);

  // currentPage, currentFilter, searchType, searchText 변경 시 재조회
  useEffect(() => {
    fetchCompanyProjectList();
  }, [currentPage, currentFilter]);

  // 상태 카운트 조회
  const fetchStatusCounts = async () => {
    try {
      const params = {
        keyword: searchText || null,
        searchType: searchType || null,
        status: currentFilter !== 'all' ? currentFilter : null,
      };

      const response = await api.$get('/projects/companies/status', { params });

      setCurrentStatusCnt(response.output || {});
    } catch (error) {
      console.error('상태 카운트 조회 실패:', error);
    }
  };

  // 프로젝트 목록 조회
  const fetchCompanyProjectList = async () => {
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        searchType: searchType,
        keyword: searchText,
        status: currentFilter,
      };

      const response = await api.$get('/projects/companies', { params });

      setProjects(response.output.projects || []);

      const pages = response.output.totalPages;
      setTotalPages(pages > 0 ? pages : 1);

      if (currentPage > pages && pages > 0) {
        setCurrentPage(1);
      }

      // 상태 카운트도 함께 업데이트
      fetchStatusCounts();
    } catch (error) {
      console.error('❌ 프로젝트 목록 불러오기 실패', error);
    }
  };

  // 프로젝트 삭제 확인
  const confirmDelete = (projectSq) => {
    const confirmed = window.confirm(
      '한 번 삭제한 프로젝트는 복구할 수 없습니다. 삭제하시겠습니까?'
    );

    if (confirmed) {
      deleteCompanyProject(projectSq);
    }
  };

  // 프로젝트 삭제
  const deleteCompanyProject = async (projectSq) => {
    try {
      await api.$delete(`/projects/${projectSq}`);

      alert('프로젝트가 삭제되었습니다.');
      
      // 현재 페이지의 마지막 항목을 삭제한 경우
      if (projects.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchCompanyProjectList();
      }
    } catch (error) {
      console.error('❌ 프로젝트 삭제 실패', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  // 프로젝트 상태 계산 (D-day)
  const getPostStatus = (post) => {
    const today = new Date();
    const start = new Date(post.recruitStartDt);
    const end = new Date(post.recruitEndDt);

    if (today < start) {
      return { status: '채용예정' };
    } else if (today > end) {
      return { status: '채용종료' };
    } else {
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      return { status: '채용중', dDay: `D-${diff}` };
    }
  };

  // 스킬 아이콘 URL 생성
  const generateIconUrl = (name) => {
    // skillIconMap 사용 - 실제 구현에 맞게 수정
    const key = name?.toLowerCase().replace(/[\s.]+/g, '');
    // return skillIconMap[key] || skillIconMap.default;
    return null; // 임시
  };

  // 검색
  const search = () => {
    setCurrentPage(1);
    fetchCompanyProjectList();
  };

  // 필터 설정
  const setFilter = (type) => {
    setCurrentFilter(type);
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

  // 지원현황 모달 열기
  const openUserApplyModal = (projectSq, projectTtl) => {
    modalStore.openModal(ProjectApplyStatusModal, {
      projectSq,
      projectTitle: projectTtl,
      onToggle: modalStore.setToggle,
      size: 'modalHuge'
    })
  };

  // 페이지 번호 배열
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <MyPageLayout userType="COMPANY">
      <div className="affiliation-project-list-container">
      <div className="row">
        <div className="col">
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            프로젝트 공고 목록
          </h4>
        </div>
      </div>

      {/* 필터 UI */}
      <div className="row align-items-center mt-3 mb-2">
        {/* 좌측 토글 버튼 */}
        <div className="col-md-6 d-flex gap-2 filter-buttons">
          {filters.map((filter) => (
            <button
              key={filter.type}
              className={`btn btn-primary fw-bold px-2 py-2 d-flex align-items-center gap-2 fs-6 ${
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
        <div className="col-md-6 d-flex justify-content-end gap-2 search-group">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="form-select form-select-sm w-auto"
          >
            {searchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && search()}
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
        <div className="col pt-2 mt-1">
          <hr className="my-2" />
        </div>
      </div>

      <div className="row">
        <div className="col">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-5 text-muted">
              검색 조건을 만족하는 프로젝트가 없습니다.
            </div>
          ) : (
            <ul className="simple-post-list m-0 position-relative">
              {filteredProjects.map((post, index) => (
                <li
                  key={index}
                  style={{ borderBottom: '1px rgb(230, 230, 230) solid' }}
                >
                  <div className="post-info position-relative">
                    {/* 제목 + 회사명 + 지원상태 버튼 */}
                    <div className="d-flex justify-content-between align-items-center gap-2 post-header">
                      <div className="d-flex gap-2 post-title-group">
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            goToProjectSpec(post);
                          }}
                          href="#"
                          className="text-5 m-0"
                        >
                          {post.projectTtl} /
                        </a>
                        <span className="text-5 m-0">{post.companyNm}</span>
                      </div>
                      <div className="d-flex gap-2 post-actions">
                        <span
                          className={`btn ${
                            getPostStatus(post).status === '채용중'
                              ? 'btn-primary'
                              : 'btn-light'
                          } btn-sm`}
                        >
                          {getPostStatus(post).status}
                          {getPostStatus(post).status === '채용중' && (
                            <span className="badge bg-white text-primary fw-bold px-2 py-1 ms-1">
                              {getPostStatus(post).dDay}
                            </span>
                          )}
                        </span>
                        <Link
                          href={`/mypage/project_post?projectSq=${post.projectSq}`}
                          className="btn btn-outline btn-primary btn-sm"
                        >
                          수정
                        </Link>
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            confirmDelete(post.projectSq);
                          }}
                          href="#"
                          className="btn btn-outline btn-primary btn-sm"
                        >
                          삭제
                        </a>
                      </div>
                    </div>

                    {/* 등록일자 + 지원자 수 */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          등록일자
                        </span>
                        | {post.projectCreatedDt}
                      </div>
                      <div className="d-flex align-items-center gap-2 text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          지원자 수
                        </span>
                        | {post.applicantCnt}
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            openUserApplyModal(post.projectSq, post.projectTtl);
                          }}
                          href="#"
                          className="btn btn-outline btn-primary btn-sm"
                        >
                          지원현황 바로가기
                        </a>
                      </div>
                    </div>

                    {/* 지원 자격 + 채용기간 */}
                    <div className="d-flex justify-content-between align-items-center mt-2 post-details">
                      <div
                        className="post-meta text-4 me-3 flex-grow-1"
                        style={{ minWidth: 0 }}
                      >
                        {/* 지원 자격 */}
                        <div className="mb-1">
                          <span className="text-dark text-uppercase font-weight-semibold">
                            지원 자격
                          </span>
                          | {post.address} / {post.devGradeNm} /{' '}
                          {post.requiredEduLvl}
                        </div>

                        {/* 기술 스택 */}
                        <div className="d-flex flex-wrap gap-2">
                          <span className="text-dark text-uppercase font-weight-semibold">
                            사용 기술
                          </span>
                          <span className="text-muted">|</span>

                          {post.reqSkills &&
                            post.reqSkills.map((skill, idx) => (
                              <span
                                key={idx}
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
                      <div className="post-meta text-4 recruit-period">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          채용기간
                        </span>
                        | {post.recruitStartDt} ~ {post.recruitEndDt}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 프로젝트 등록하기 버튼 */}
          <div className="d-flex justify-content-end mt-4 mb-5">
            <Link
              href="/mypage/project_post"
              className="btn btn-primary px-4 py-2"
            >
              프로젝트 등록하기
            </Link>
          </div>

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="mt-5 py-5">
              <ul className="pagination float-end">
                <li
                  className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                >
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
          )}
        </div>
      </div>
    </div>
    </MyPageLayout>
  );
};

export default AffiliationProjectList;

