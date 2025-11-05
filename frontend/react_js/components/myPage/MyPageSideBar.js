import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './MyPageSideBar.module.css';

export default function MyPageSideBar({ onNavigate, userType = 'PERSONAL' }) {
  const router = useRouter();

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const isActiveLink = (path) => {
    return router.pathname === path;
  };

  // Company Sidebar
  if (userType === 'COMPANY') {
    return (
      <aside className={`${styles.sidebar} company`}>
        <h5 className="font-weight-semi-bold">마이 페이지</h5>
        <ul className="nav nav-list flex-column mb-5">
          <li className="nav-item">
            <span className="nav-link">소속 공고 관리</span>
            <ul>
              <li className="nav-item">
                <Link 
                  href="/mypage/company/Affiliation_edit" 
                  className={`nav-link ${isActiveLink('/mypage/company/Affiliation_edit') ? styles.active : ''}`}
                  onClick={handleNavigate}
                >
                  소속 정보 수정
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  href="/mypage/company/Affiliated_members" 
                  className={`nav-link ${isActiveLink('/mypage/company/Affiliated_members') ? styles.active : ''}`}
                  onClick={handleNavigate}
                >
                  소속 인원 목록
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  href="/mypage/company/Affiliation_applicant_list" 
                  className={`nav-link ${isActiveLink('/mypage/company/Affiliation_applicant_list') ? styles.active : ''}`}
                  onClick={handleNavigate}
                >
                  지원자 현황
                </Link>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <span className="nav-link">프로젝트 관리</span>
            <ul>
            <li className="nav-item">
              <Link 
                href="/mypage/company/affiliation_project_list" 
                className={`nav-link ${isActiveLink('/mypage/company/affiliation_project_list') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                프로젝트 공고 목록
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/mypage/personal/AppliedProjects" 
                className={`nav-link ${isActiveLink('/mypage/personal/AppliedProjects') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                지원 내역
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/mypage/company/project_scrap" 
                className={`nav-link ${isActiveLink('/mypage/company/project_scrap') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                스크랩 내역
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <span className="nav-link">일정 관리</span>
            <ul>
              <li className="nav-item">
                <Link 
                  href="/mypage/calendar" 
                  className={`nav-link ${isActiveLink('/mypage/calendar') ? styles.active : ''}`}
                  onClick={handleNavigate}
                >
                  캘린더
                </Link>
              </li>
            </ul>
          </li>
          <li className="nav-item">
            <span className="nav-link">회원 정보 관리</span>
            <ul>
              <li className="nav-item">
                <Link 
                  href="/mypage/informationEdit" 
                  className={`nav-link ${isActiveLink('/mypage/informationEdit') ? styles.active : ''}`}
                  onClick={handleNavigate}
                >
                  회원 정보 수정
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  href="/mypage/withdraw" 
                  className={`nav-link ${isActiveLink('/mypage/withdraw') ? styles.active : ''}`}
                  onClick={handleNavigate}
                >
                  회원 탈퇴
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </aside>
    );
  }

  // Personal Sidebar
  return (
    <aside className={styles.sidebar}>
      <h5 className="font-weight-semi-bold">마이 페이지</h5>
      <ul className="nav nav-list flex-column mb-5">
        <li className="nav-item">
          <span className="nav-link">이력서 관리</span>
          <ul>
            <li className="nav-item">
              <Link 
                href="/mypage/personal/resume_form" 
                className={`nav-link ${isActiveLink('/mypage/personal/resume_form') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                이력서 등록
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/mypage/personal/resum_list" 
                className={`nav-link ${isActiveLink('/mypage/personal/resum_list') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                이력서 목록
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <span className="nav-link">소속 관리</span>
          <ul>
            <li className="nav-item">
              <Link 
                href="/affiliation" 
                className={`nav-link ${isActiveLink('/affiliation') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                기업 공고 조회
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/mypage/personal/AffiliatedJobApplications" 
                className={`nav-link ${isActiveLink('/mypage/personal/AffiliatedJobApplications') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                지원 내역
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/mypage/personal/AffiliatedScrap" 
                className={`nav-link ${isActiveLink('/mypage/personal/AffiliatedScrap') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                스크랩 내역
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <span className="nav-link">프로젝트 관리</span>
          <ul>
            <li className="nav-item">
              <Link 
                href="/project" 
                className={`nav-link ${isActiveLink('/project') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                프로젝트 공고 조회
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/mypage/personal/AppliedProjects" 
                className={`nav-link ${isActiveLink('/mypage/personal/AppliedProjects') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                지원 내역
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/mypage/personal/Project_scrap" 
                className={`nav-link ${isActiveLink('/mypage/personal/Project_scrap') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                스크랩 내역
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <span className="nav-link">일정 관리</span>
          <ul>
            <li className="nav-item">
              <Link 
                href="/mypage/calendar" 
                className={`nav-link ${isActiveLink('/mypage/calendar') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                캘린더
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <span className="nav-link">회원 정보 관리</span>
          <ul>
            <li className="nav-item">
              <Link 
                href="/mypage/informationEdit" 
                className={`nav-link ${isActiveLink('/mypage/informationEdit') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                회원 정보 수정
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/mypage/withdraw" 
                className={`nav-link ${isActiveLink('/mypage/withdraw') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                회원 탈퇴
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </aside>
  );
}

