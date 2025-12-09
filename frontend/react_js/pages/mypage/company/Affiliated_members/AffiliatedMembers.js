import React, { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import MyPageLayout from '../../MyPageLayout';
import styles from './AffiliatedMembers.module.css';
import ResumeDetailModal from '@/components/myPage/common/ResumeDetailModal';
import { useModalStore } from '@/store/modalStore';
import skillIconMap from '@/lib/skillIconMap'
import ResumeSelectModal from '@/components/myPage/common/ResumeSelectModal';
import { useAuth } from '@/contexts/AuthContext';

const AffiliatedMembers = () => {

  const { user, isLoggedIn} = useAuth();
  const modalStore = useModalStore();

  // State 관리
  const [members, setMembers] = useState([]);
  const [searchType, setSearchType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [resumeClickSq, setResumeClickSq] = useState();

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
    const key = name.toLowerCase().replace(/[\s.]+/g, '')
    return skillIconMap[key] || skillIconMap.default
  }

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

  // 이력서 변경 모달 열기
  const openResumeSelectModal = (userSq) => {
    if (!isLoggedIn) {
      alertStore.show('로그인 후 이용해주세요.', 'danger')
      return
    }
    setResumeClickSq(userSq);
    setShowModal(true);
  }

  // 이력서 변경 모달 props
  const resumeProps = {
    userSq: resumeClickSq,
    role: 'COMPANY',
    onConfirm: fetchAffiliationMemberList,
    onClose: () => setShowModal(false)
  }

  // 이력서 상세보기 모달 열기
  const openResumeDetailModal = (resumeSq, projectSq, applicationSq) => {
    modalStore.openModal(ResumeDetailModal, {
      resumeSq,
      projectSq,
      applicationSq,
      isFromApplicationList: false,
      api: api,
      skillIconMap: skillIconMap,
    });
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
      <div className={styles['affiliated-members-container']}>
      <div className={styles.row}>
        <div className={styles.col}>
          <h4 className={styles['mb-3']} style={{ fontSize: '24px' }}>
            소속 인원 목록
          </h4>
        </div>
      </div>

      {/* 필터/검색 UI */}
      <div className={`${styles.row} ${styles['align-items-center']} ${styles['mt-3']} ${styles['mb-2']}`}>
        <div className={`${styles['col-md-12']} ${styles['d-flex']} ${styles['justify-content-end']} ${styles['gap-2']} ${styles['search-group']}`}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={`${styles['form-select']} ${styles['form-select-sm']} ${styles['w-auto']}`}
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
            className={`${styles['form-control']} ${styles['form-control-sm']} ${styles['w-auto']}`}
            placeholder="검색어 입력"
            style={{ fontSize: '14px', padding: '4px' }}
          />
          <button
            className={`${styles.btn} ${styles['btn-primary']} ${styles['btn-sm']}`}
            style={{ fontSize: '14px', padding: '4px' }}
            onClick={search}
          >
            검색
          </button>
        </div>
      </div>

      <div className={styles.row}>
        <div className={`${styles.col} ${styles['pt-2']} ${styles['mt-1']}`}>
          <hr className={styles['my-2']} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          {members.length === 0 ? (
            <div
              className={`${styles['text-muted']} ${styles['py-3']}`}
              style={{ fontSize: '14px' }}
            >
              소속 인원이 없습니다.
            </div>
          ) : (
            <ul className={`${styles['simple-post-list']} ${styles['m-0']} ${styles['position-relative']}`} style={{ padding: 0 }}>
              {members.map((member) => (
                <li
                  key={member.id || member.userSq}
                  className={`${styles['d-flex']} ${styles['flex-column']} ${styles['gap-2']} ${styles['member-item']}`}
                >
                  {/* 상단: 이름/소개 + 퇴사처리 버튼 */}
                  <div className={`${styles['d-flex']} ${styles['justify-content-between']} ${styles['align-items-center']}`}>
                    <div className={`${styles['d-flex']} ${styles['gap-2']} ${styles['align-items-center']} ${styles['member-info']}`}>
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          openResumeSelectModal(member.userSq);
                        }}
                        href="#"
                        className={`${styles['text-5']} ${styles['m-0']} ${styles['member-name']}`}
                      >
                        {member.userNm} /
                      </a>
                      <a
                        href="#"
                        className={`${styles['text-4']} ${styles['m-0']} ${styles['resume-title']}`}
                        onClick={(e) => {
                          e.preventDefault();
                          openResumeDetailModal(member.resumeSq);
                        }}
                      >
                        {member.resumeTtl}
                      </a>
                    </div>
                    {member.leavedYn === 401 ? (
                      <span
                        className={`${styles.btn} ${styles['btn-primary']} ${styles['btn-outline']} ${styles['btn-lg']} ${styles['fire-button']}`}
                        onClick={() => confirmFire(6, member.userSq)}
                      >
                        퇴사 처리
                      </span>
                    ) : (
                      <span className={`${styles.btn} ${styles['btn-light']} ${styles['btn-lg']} ${styles['fire-button']} ${styles.disabled}`}>
                        퇴사
                      </span>
                    )}
                  </div>

                  <div className={`${styles['d-flex']} ${styles['justify-content-between']} ${styles['align-items-center']} ${styles['member-details']}`}>
                    {/* 좌측: 경력 / 사용 기술 */}
                    <div className={`${styles['d-flex']} ${styles['align-items-center']} ${styles['gap-2']} ${styles['skills-section']}`}>
                      <div className={`${styles['post-meta']} ${styles['text-4']}`}>
                        <span className={`${styles['text-dark']} ${styles['text-uppercase']} ${styles['font-weight-semibold']}`}>
                          경력
                        </span>
                        &nbsp; | {member.careerYr}년차
                      </div>
                      <div className={`${styles['d-flex']} ${styles['align-items-center']} ${styles['gap-2']} ${styles['ms-3']} ${styles['skills-list']}`}>
                        <span className={`${styles['text-dark']} ${styles['text-uppercase']} ${styles['font-weight-semibold']}`}>
                          사용 기술
                        </span>
                        |
                        {member.skillTagNms &&
                          member.skillTagNms.map((skill, index) => (
                            <div
                              key={index}
                              className={`${styles.btn} ${styles['d-flex']} ${styles['align-items-center']} ${styles['gap-2']} ${styles['border-0']} ${styles['skill-tag']}`}
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
                    <div className={`${styles['text-muted']} ${styles['date-info']}`} style={{ whiteSpace: 'nowrap' }}>
                      <span className={`${styles['text-dark']} ${styles['text-uppercase']} ${styles['font-weight-semibold']}`}>
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
            <div className={styles['mt-5']}>
              <ul className={`${styles.pagination} ${styles['float-end']}`}>
                <li
                  className={`${styles['page-item']} ${currentPage === 1 ? styles.disabled : ''}`}
                >
                  <a
                    className={styles['page-link']}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      changePage(currentPage - 1);
                    }}
                  >
                    <i className={styles.fas + ' fa-angle-left'}></i>
                  </a>
                </li>
                {pageNumbers.map((page) => (
                  <li
                    key={page}
                    className={`${styles['page-item']} ${
                      currentPage === page ? styles.active : ''
                    }`}
                  >
                    <a
                      className={styles['page-link']}
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
                  className={`${styles['page-item']} ${
                    currentPage === totalPages ? styles.disabled : ''
                  }`}
                >
                  <a
                    className={styles['page-link']}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      changePage(currentPage + 1);
                    }}
                  >
                    <i className={styles.fas + ' fa-angle-right'}></i>
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
    {/* 이력서 변경 모달 열기 */}
    {showModal && (
      <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1049 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <ResumeSelectModal {...resumeProps}/>
        </div>
      </div>
    )}
    </MyPageLayout>
  );
};

export default AffiliatedMembers;

