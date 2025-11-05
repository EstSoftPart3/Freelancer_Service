import React, { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import MyPageLayout from '../../MyPageLayout';
import './AffiliatedMembers.module.css';

// skillIconMap import - 경로는 프로젝트에 맞게 조정
// import iconMap from '../../../../assets/skillIconMap';

const AffiliatedMembers = () => {
  // State 관리
  const [members, setMembers] = useState([]);
  const [searchType, setSearchType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAffiliationMemberList();
  }, []);

  // 페이지 변경 시 데이터 재조회
  useEffect(() => {
    fetchAffiliationMemberList();
  }, [currentPage]);

  // 소속 인원 목록 조회
  const fetchAffiliationMemberList = async () => {
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        searchType: searchType === 'all' ? null : searchType,
        keyword: searchText.trim() || null,
      };

      const response = await api.$get('/companies', { params });

      const output = response.output;
      console.log('output', output);

      setMembers(output.members || []);
      setCurrentPage(output.page || 1);
      setTotalPages(Math.max(1, output.totalPages || 1));
    } catch (error) {
      console.error('소속 인원 목록 조회 실패:', error);
      alert('소속 인원 목록을 불러오는데 실패했습니다.');
    }
  };

  // 스킬 아이콘 가져오기
  const getSkillIcon = (name) => {
    // iconMap 사용 - 실제 구현에 맞게 수정
    const key = name?.toLowerCase().replace(/[\s.]+/g, '');
    // return iconMap[key] || iconMap.default;
    return null; // 임시
  };

  // 검색
  const search = () => {
    setCurrentPage(1);
    fetchAffiliationMemberList();
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  // 페이지 변경
  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 이력서 선택 모달 열기
  const openResumeSelectModal = (memberSq) => {
    // 모달 구현 필요
    alert(`이력서 선택 모달 구현 필요\nUser SQ: ${memberSq}`);
    // 실제 구현:
    // setModalData({
    //   type: 'resumeSelect',
    //   userSq: memberSq,
    //   role: 'COMPANY',
    //   onConfirm: fetchAffiliationMemberList,
    // });
  };

  // 이력서 상세보기 모달
  const openResumeDetail = (resumeSq) => {
    console.log('resumeSq', resumeSq);
    // 모달 구현 필요
    alert(`이력서 상세보기 모달 구현 필요\nResume SQ: ${resumeSq}`);
    // 실제 구현:
    // setModalData({
    //   type: 'resumeDetail',
    //   resumeSq: resumeSq,
    // });
  };

  // 퇴사 처리
  const fireMember = async (companySq, userSq) => {
    try {
      await api.$patch(
        `/companies/${companySq}`,
        {
          userSq: userSq,
          newStatus: '퇴사',
        }
      );

      alert('퇴사 처리가 완료되었습니다.');
      fetchAffiliationMemberList();
    } catch (error) {
      console.error('퇴사 처리 실패:', error);
      alert('퇴사 처리에 실패했습니다.');
    }
  };

  // 퇴사 처리 확인
  const confirmFire = (companySq, userSq) => {
    const confirmed = window.confirm('해당 인원을 퇴사처리 하겠습니까?');

    if (confirmed) {
      fireMember(companySq, userSq);
    }
  };

  // 페이지 번호 배열
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <MyPageLayout userType="COMPANY">
      <div className="affiliated-members-container">
      <div className="row">
        <div className="col">
          <h4 className="mb-3" style={{ fontSize: '24px' }}>
            소속 인원 목록
          </h4>
        </div>
      </div>

      {/* 필터/검색 UI */}
      <div className="row align-items-center mt-3 mb-2">
        <div className="col-md-12 d-flex justify-content-end gap-2 search-group">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="form-select form-select-sm w-auto"
            style={{ fontSize: '14px', padding: '4px' }}
          >
            <option value="all">전체</option>
            <option value="name">이름</option>
            <option value="skill">사용 기술</option>
          </select>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="검색어 입력"
            style={{ fontSize: '14px', padding: '4px' }}
          />
          <button
            className="btn btn-primary btn-sm"
            style={{ fontSize: '14px', padding: '4px' }}
            onClick={search}
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
          {members.length === 0 ? (
            <div
              className="text-muted py-3"
              style={{ fontSize: '14px' }}
            >
              소속 인원이 없습니다.
            </div>
          ) : (
            <ul className="simple-post-list m-0 position-relative" style={{ padding: 0 }}>
              {members.map((member) => (
                <li
                  key={member.id || member.userSq}
                  className="d-flex flex-column gap-2 member-item"
                >
                  {/* 상단: 이름/소개 + 퇴사처리 버튼 */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2 align-items-center member-info">
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          openResumeSelectModal(member.userSq);
                        }}
                        href="#"
                        className="text-5 m-0 member-name"
                      >
                        {member.userNm} /
                      </a>
                      <a
                        href="#"
                        className="text-4 m-0 resume-title"
                        onClick={(e) => {
                          e.preventDefault();
                          openResumeDetail(member.resumeSq);
                        }}
                      >
                        {member.resumeTtl}
                      </a>
                    </div>
                    {member.leavedYn === 401 ? (
                      <span
                        className="btn btn-primary btn-outline btn-lg fire-button"
                        onClick={() => confirmFire(6, member.userSq)}
                      >
                        퇴사 처리
                      </span>
                    ) : (
                      <span className="btn btn-light btn-lg fire-button disabled">
                        퇴사
                      </span>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center member-details">
                    {/* 좌측: 경력 / 사용 기술 */}
                    <div className="d-flex align-items-center gap-2 skills-section">
                      <div className="post-meta text-4">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          경력
                        </span>
                        | {member.careerYr}년차
                      </div>
                      <div className="d-flex align-items-center gap-2 ms-3 skills-list">
                        <span className="text-dark text-uppercase font-weight-semibold">
                          사용 기술
                        </span>
                        |
                        {member.skillTagNms &&
                          member.skillTagNms.map((skill, index) => (
                            <div
                              key={index}
                              className="btn d-flex align-items-center gap-2 border-0 skill-tag"
                            >
                              {getSkillIcon(skill) && (
                                <img
                                  src={getSkillIcon(skill)}
                                  width="16"
                                  alt={skill}
                                />
                              )}
                              {skill}
                            </div>
                          ))}
                      </div>
                    </div>
                    {/* 우측: 입사일자/퇴사일자 */}
                    <div className="text-muted date-info" style={{ whiteSpace: 'nowrap' }}>
                      <span className="text-dark text-uppercase font-weight-semibold">
                        {member.careerEndDt ? '퇴사일자' : '입사일자'}
                      </span>
                      | {member.careerEndDt || member.careerStartDt}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="mt-5">
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

export default AffiliatedMembers;

