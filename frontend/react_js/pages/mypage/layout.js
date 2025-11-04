import { useState, useMemo } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router-dom';
import MyPageSideBar from '../../components/myPage/MyPageSideBar';
import CommonPageHeader from '../../components/common/CommonPageHeader';
import './layout.css';

const MyPageLayout = () => {
  const location = useLocation();
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  // 현재 경로에 따라 라우트 이름 결정
  const getRouteName = () => {
    const path = location.pathname;
    
    if (path === '/mypage' || path === '/mypage/information-edit') return 'InformationEdit';
    if (path === '/mypage/withdraw') return 'Withdraw';
    if (path === '/mypage/affiliated/job-applications') return 'AffiliatedJobApplications';
    if (path === '/mypage/affiliated/scrap') return 'AffiliatedScrap';
    if (path === '/mypage/resume/list') return 'ResumeList';
    if (path === '/mypage/resume/new') return 'ResumeFormNew';
    if (path.includes('/mypage/resume/edit')) return 'ResumeFormEdit';
    if (path === '/mypage/applied-projects') return 'appliedProjects';
    if (path === '/mypage/project-scrap') return 'projectScrap';
    if (path === '/mypage/affiliation/edit') return 'AffiliationEdit';
    if (path === '/mypage/affiliated/members') return 'AffiliatedMembers';
    if (path === '/mypage/affiliation/applicant-list') return 'AffiliationApplicantList';
    if (path === '/mypage/affiliation/project-list') return 'AffiliationProjectList';
    if (path === '/mypage/project/post') return 'ProjectPostPage';
    if (path.includes('/mypage/project/post/')) return 'ProjectPostPageWithId';
    if (path === '/mypage/calendar') return 'CalendarPage';
    
    return 'MypageDefault';
  };

  // 헤더 정보 계산
  const headerInfo = useMemo(() => {
    const routeName = getRouteName();

    switch (routeName) {
      case 'MypageDefault':
      case 'InformationEdit':
        return {
          title: '회원',
          strongText: '정보 수정',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '회원정보수정' },
          ],
        };
      case 'Withdraw':
        return {
          title: '회원',
          strongText: '탈퇴',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '회원탈퇴' },
          ],
        };
      case 'AffiliatedJobApplications':
        return {
          title: '기업',
          strongText: '지원자 관리',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '지원자 관리' },
          ],
        };
      case 'AffiliatedScrap':
        return {
          title: '기업',
          strongText: '스크랩',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '기업 스크랩' },
          ],
        };
      case 'ResumeList':
        return {
          title: '이력서',
          strongText: '목록',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '이력서 목록' },
          ],
        };
      case 'ResumeFormNew':
        return {
          title: '이력서',
          strongText: '등록하기',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '이력서 등록' },
          ],
        };
      case 'ResumeFormEdit':
        return {
          title: '이력서',
          strongText: '수정하기',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '이력서 수정' },
          ],
        };
      case 'appliedProjects':
        return {
          title: '프로젝트',
          strongText: '지원 현황',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '지원 현황' },
          ],
        };
      case 'projectScrap':
        return {
          title: '프로젝트',
          strongText: '스크랩',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 스크랩' },
          ],
        };
      case 'AffiliationEdit':
        return {
          title: '기업',
          strongText: '소속 정보 수정',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '소속 정보 수정' },
          ],
        };
      case 'AffiliatedMembers':
        return {
          title: '기업',
          strongText: '소속 인원 목록',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '소속 인원 목록' },
          ],
        };
      case 'AffiliationApplicantList':
        return {
          title: '기업',
          strongText: '지원자 목록',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '지원자 목록' },
          ],
        };
      case 'AffiliationProjectList':
        return {
          title: '기업',
          strongText: '프로젝트 관리',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 관리' },
          ],
        };
      case 'ProjectPostPage':
        return {
          title: '프로젝트',
          strongText: '등록',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 등록' },
          ],
        };
      case 'ProjectPostPageWithId':
        return {
          title: '프로젝트',
          strongText: '수정',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 수정' },
          ],
        };
      case 'CalendarPage':
        return {
          title: '일정',
          strongText: '캘린더',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '일정 캘린더' },
          ],
        };
      default:
        return {
          title: '마이페이지',
          strongText: '',
          breadcrumbs: [{ text: '마이페이지' }],
        };
    }
  }, [location.pathname]);

  // Offcanvas 외부 클릭 시 닫기
  const handleOffcanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOffcanvasOpen(false);
    }
  };

  return (
    <section>
      {/* 현재 라우트에 따라 다르게 보여지는 헤더 */}
      <CommonPageHeader
        title={headerInfo.title}
        strongText={headerInfo.strongText}
        breadcrumbs={headerInfo.breadcrumbs}
      />

      <div className="container pt-3 pb-2">
        {/* Off-canvas menu button */}
        <button
          className="btn btn-primary d-lg-none mb-3"
          onClick={() => setIsOffcanvasOpen(true)}
        >
          마이페이지 메뉴
        </button>

        <div className="row pt-2">
          {/* Sidebar for desktop */}
          <div className="col-lg-3 order-2 order-lg-1 mt-4 mt-lg-0 d-none d-lg-block">
            <MyPageSideBar />
          </div>

          {/* Main content */}
          <div className="col-lg-9 order-1 order-lg-2">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Off-canvas Sidebar for mobile */}
      <div
        className={`offcanvas-sidebar ${isOffcanvasOpen ? 'open' : ''}`}
        onClick={handleOffcanvasClick}
      >
        <div className="offcanvas-content">
          <button className="btn-close" onClick={() => setIsOffcanvasOpen(false)}>
            X
          </button>
          <MyPageSideBar onNavigate={() => setIsOffcanvasOpen(false)} />
        </div>
      </div>
    </section>
  );
};

export default MyPageLayout;

