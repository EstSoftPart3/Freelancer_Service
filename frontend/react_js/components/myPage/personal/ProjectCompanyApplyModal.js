import { api } from '@/lib/axios';
import skillIconMap from '@/lib/skillIconMap';
import { useEffect, useState } from 'react';
import { useAlertStore } from '../../../store/alertStore';
import { useModalStore } from '../../../store/modalStore';
import CommonConfirmModal from '../common/CommonConfirmModal';
import ResumeDetailModal from '../common/ResumeDetailModal';
import CompanyMembers from './CompanyMembers';
import styles from './ProjectApplyStatusModal.module.css';
import ResumeSelectModal from '@/components/myPage/common/ResumeSelectModal';
import { useAuth } from '@/contexts/AuthContext';

const ProjectCompanyApplyModal = ({ projectSq, projectTitle, onToggle }) => {
  const modalStore = useModalStore();
  const alertStore = useAlertStore();
  const { user } = useAuth()

  const [searchType, setSearchType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [inputText, setInputText] = useState('');
  const [companyMembers, setCompanyMembers] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState({});
  const [resumeSelect, setResumeSelect] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showRepModal, setShowRepModal] = useState(false);
  const [repProps, setRepProps] = useState(null);

  // 기업 소속 인원 목록 조회
  const fetchCompanyMembers = async () => {
    try {
      const res = await api.$get(
        `/companies?page=${currentPage}&size=${pageSize}&searchType=${searchType}&keyword=${searchText}`
      );
      setCompanyMembers(res.output.members || []);
      setTotalPages(res.output.totalPages || 1);
      console.log(res.output)
    } catch (error) {
      console.error('기업 소속 인원 불러오기 실패', error);
      setCompanyMembers([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchCompanyMembers();
  }, [])

  // 검색
  const search = () => {
    setSearchText(inputText)
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

  // 선택하기 - 이력서 선택 안됐을 경우 어떻게 할지 생각해보기
  const handleSelect = (userSq, resumeSq, userNm) => {
    if (!resumeSq) return;
    setSelectedMembers(prev => {
      const currentList = prev[currentPage] || [];
      let newCurrentList;
      if (currentList.some(member => member.userSq === userSq)) {
        newCurrentList = currentList.filter(member => member.userSq !== userSq);
      } else {
        newCurrentList = [...currentList, {userSq, resumeSq, userNm}];
      }
      return {
        ...prev,
        [currentPage]: newCurrentList
      }
    })
  }

  // 이력서 선택 모달 열기
  const openResumeSelectModal = (userSq) => {
    if (!user?.userSq) {
      alertStore.show('로그인 후 이용해주세요.', 'danger')
      return
    }
    setResumeSelect(userSq);
    setShowModal(true);
  }

  // 불합격 확인 모달 -> 이력서 변경 모달로 바꾸자
  const openStatusFailureModal = (applicationSq) => {
    modalStore.openModal(CommonConfirmModal, {
      message: '해당 지원자를 불합격 처리하겠습니까?',
      onConfirm: async () => {
        await updateStatus(applicationSq, '불합격');
        modalStore.closeModal();
      },
    });
  };

  // 대표 이력서 상세 보기
  const openRepResumeDetailModal = (resumeSq, projectSq, applicationSq) => {
    setRepProps({
      resumeSq,
      projectSq,
      applicationSq,
      isFromApplicationList: true,
      api: api,
      skillIconMap: skillIconMap,
      onClose: () => setShowRepModal(false),
    })
    setShowRepModal(true);
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

  // 상태별 버튼 렌더링 -> 선택하기 / 선택됨 두 가지로 변경
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
        <div className={`${styles['interview-wrapper']} position-relative d-inline-block`}>
          <div
            className={`${styles['interview-tooltip']} position-absolute bg-white border p-2 rounded shadow-sm text-dark ${styles['font-weight-semibold']}`}
            style={{
              bottom: '80%',
              left: '50%',
              transform: 'translateX(-60%)',
              whiteSpace: 'nowrap',
            }}
          >
            {formatDate(applicant.appStatusVo.interviewDt)}
          </div>
          <span className={`btn btn-light btn-sm ${styles.interview}`}>인터뷰 확정</span>
        </div>
      );
    } else if (status === '지원취소') {
      return <span className="btn btn-light btn-sm">지원 취소됨</span>;
    }
    return null;
  };

  // 지원하기
  const handleApply = async () => {
    console.log(selectedMembers)
    const selectedMembersResumeSq = Object.values(selectedMembers).flat().map(member => member.resumeSq);
    console.log(selectedMembersResumeSq);
    try {
      const response = await api.$post(`/projects/applications/${projectSq}`, {
        resumeSq: selectedMembersResumeSq,
        projectApplicationTyp: "COMPANY"
      })
      alertStore.show('기업 지원이 완료됏습니다.', 'success')
      console.log('기업 지원이 완료됐습니다.', response)
    } catch(error) {
      alertStore.show('기업 지원에 실패했습니다.', 'danger')
      console.log(error)
    }
  }

  // 이력서 변경시 기존에 선택된게 있으면 제거
  const deleteSelectedMember = (userSq) => {
    console.log('deleteselected', userSq)
    if (!userSq) return;
    setSelectedMembers(prev => {
      const currentList = prev[currentPage] || [];
      let newCurrentList;
      if (currentList.some(member => member.userSq === userSq)) {
        newCurrentList = currentList.filter(member => member.userSq !== userSq);
      }
      return {
        ...prev,
        [currentPage]: newCurrentList
      }
    })
  }

  // 지원 현황 props
  const props = {
    projectSq,
    companyMembers,
    currentPageSelectedMembers: selectedMembers[currentPage],
    openRepResumeDetailModal,
    openResumeSelectModal,
    generateIconUrl,
    handleSelect,
  }

  const resumeProps = {
    userSq: resumeSelect,
    role: 'COMPANY',
    onConfirm: () => deleteSelectedMember(resumeSelect),
    onClose:
      () => {
        setShowModal(false);
        fetchCompanyMembers()
      }
  }

  useEffect(() => {console.log('selectedMembers',selectedMembers)}, [selectedMembers])

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h3 className="modal-title">소속 인원 리스트</h3>
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
        <div className="container py-1">

          {/* 필터 UI */}
          <div className="row align-items-center">
            {/* 우측 셀렉트 + 검색 */}
            <div className="d-flex justify-content-end gap-2">
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
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                type="text"
                className="form-control form-control-sm w-auto"
                placeholder="검색어 입력"
              />
              <button className="btn btn-primary btn-sm" onClick={search}>
                검색
              </button>
            </div>
          </div>
          {/* 선택한 인원 목록 */}
          <div className="row">
            <div className="col-12 d-flex justify-content-start pt-2 mt-1">
              <div className='d-flex flex-column'>
                <p>현재 선택한 인원 : </p>
                <div className='d-flex gap-2'>
                  {Object.values(selectedMembers).flat().map((member) => (
                    <span
                      key={member.resumeSq}
                      className="btn btn-rounded btn-light btn-sm px-3 py-2"
                    >
                      {member.userNm}
                      <i
                        className="fas fa-times ms-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelect(member.userSq, member.resumeSq, member.userNm)}
                      ></i>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col" style={{ padding: 0 }}>
              <hr className="my-4" />
            </div>
          </div>
          {/* 지원자 현황 목록 */}
          <CompanyMembers {...props} />
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
      <div className="modal-footer">
        <button type="button" className="btn btn-primary" onClick={handleApply}>
          지원하기
        </button>
        <button type="button" className="btn btn-light" onClick={closeModal}>
          닫기
        </button>
      </div>
    {/* 대표 이력서 열람 */}
    {showRepModal && (
      <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1049 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg h-75">
          <ResumeDetailModal {...repProps}/>
        </div>
      </div>
    )}
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
    </div>
  );
};

export default ProjectCompanyApplyModal;

