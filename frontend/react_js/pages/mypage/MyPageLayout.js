import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import CommonPageHeader from '@/components/common/CommonPageHeader';
import MyPageSideBar from '@/components/myPage/MyPageSideBar';
import styles from './MyPageLayout.module.css';

export default function MyPageLayout({ children, userType: propUserType }) {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  // prop으로 받은 userType이 있으면 우선 사용, 없으면 AuthContext의 user.userType 사용
  const userType = propUserType || user.userType || 'PERSONAL';

  // Vue의 computed headerInfo와 동일한 로직
  const headerInfo = useMemo(() => {
    const pathname = router.pathname;

    switch (pathname) {
      case '/mypage':
        return {
          title: '마이페이지',
          strongText: '',
          breadcrumbs: [{ text: '마이페이지' }],
        };
      case '/mypage/informationEdit':
        return {
          title: '회원',
          strongText: '정보 수정',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '회원정보수정' },
          ],
        };
      case '/mypage/calendar':
        return {
          title: '일정',
          strongText: '캘린더',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '일정 캘린더' },
          ],
        };
      case '/mypage/withdraw':
        return {
          title: '회원',
          strongText: '탈퇴',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '회원탈퇴' },
          ],
        };
      case '/mypage/personal/AffiliatedJobApplications':
        return {
          title: '소속',
          strongText: '지원 내역',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '소속 지원 내역' },
          ],
        };
      case '/mypage/personal/AffiliatedScrap':
        return {
          title: '소속',
          strongText: '스크랩',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '소속 스크랩' },
          ],
        };
      case '/mypage/personal/resum_list':
        return {
          title: '이력서',
          strongText: '목록',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '이력서 목록' },
          ],
        };
      case '/mypage/personal/resume_form':
        return {
          title: '이력서',
          strongText: '등록하기',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '이력서 등록' },
          ],
        };
      case '/mypage/personal/resume_form_edit':
        return {
          title: '이력서',
          strongText: '수정하기',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '이력서 수정' },
          ],
        };
      case '/mypage/personal/AppliedProjects':
        return {
          title: '프로젝트',
          strongText: '지원 현황',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 지원 현황' },
          ],
        };
      case '/mypage/Project_scrap':
        return {
          title: '프로젝트',
          strongText: '스크랩',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 스크랩' },
          ],
        };
      case '/mypage/company/Affiliation_edit':
        return {
          title: '기업',
          strongText: '소속 정보 수정',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '소속 정보 수정' },
          ],
        };
      case '/mypage/company/Affiliated_members':
        return {
          title: '기업',
          strongText: '소속 인원 목록',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '소속 인원 목록' },
          ],
        };
      case '/mypage/company/Affiliation_applicant_list':
        return {
          title: '기업',
          strongText: '지원자 목록',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '지원자 목록' },
          ],
        };
      case '/mypage/company/affiliation_project_list':
        return {
          title: '기업',
          strongText: '프로젝트 관리',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 관리' },
          ],
        };
      case '/mypage/projectPost':
        return {
          title: '프로젝트',
          strongText: '등록',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 등록' },
          ],
        };
      case '/mypage/projectPostEdit':
        return {
          title: '프로젝트',
          strongText: '수정',
          breadcrumbs: [
            { text: '마이페이지', link: '/mypage' },
            { text: '프로젝트 수정' },
          ],
        };
      case '/mypage/calendar':
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
  }, [router.pathname]);

  return (
    <section>
      {/* 현재 라우트에 따라 다르게 보여지는 헤더 */}
      <CommonPageHeader
        title={headerInfo.title}
        strongText={headerInfo.strongText}
        breadcrumbs={headerInfo.breadcrumbs}
      />

      <div className="container pt-3 pb-2">
        {/* Off-canvas menu button for mobile */}
        <button
          className="btn btn-primary d-lg-none mb-3"
          onClick={() => setIsOffcanvasOpen(true)}
        >
          마이페이지 메뉴
        </button>

        <div className="row pt-2">
          {/* Sidebar for desktop */}
          <div className="col-lg-3 order-2 order-lg-1 mt-4 mt-lg-0 d-none d-lg-block">
            <MyPageSideBar userType={userType} />
          </div>

          {/* Main content */}
          <div className="col-lg-9 order-1 order-lg-2">
            {children}
          </div>
        </div>
      </div>

      {/* Off-canvas Sidebar for mobile */}
      <div
        className={`${styles.offcanvasSidebar} ${isOffcanvasOpen ? styles.open : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsOffcanvasOpen(false);
          }
        }}
      >
        <div className={styles.offcanvasContent}>
          <button 
            className={styles.btnClose}
            onClick={() => setIsOffcanvasOpen(false)}
          >
            X
          </button>
          <MyPageSideBar 
            userType={userType}
            onNavigate={() => setIsOffcanvasOpen(false)} 
          />
        </div>
      </div>
    </section>
  );
}

