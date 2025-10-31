import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useAlert } from '@/contexts/AlertContext'
import { api } from '@/lib/axios'
import styles from './CommonHeader.module.css'

export default function CommonHeader() {
  const router = useRouter()
  const { user, isLoggedIn, clearUser } = useAuth()
  const { showAlert } = useAlert()

  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false)
  
  const headerRef = useRef(null)
  const notificationDropdownRef = useRef(null)
  const userDropdownRef = useRef(null)

  // 현재 경로
  const currentPath = router.pathname

  // 각 메뉴의 활성 여부 판별
  const isAffiliationActive = currentPath.startsWith('/affiliation')
  const isProjectActive = currentPath.startsWith('/project')
  const isCommunityActive = currentPath.startsWith('/board') || currentPath.startsWith('/qna')

  // 모바일 메뉴 닫기
  const closeMenu = () => {
    const navCollapse = document.querySelector('.header-nav-main nav.collapse')
    if (navCollapse && navCollapse.classList.contains('show')) {
      const collapseInstance = window.bootstrap?.Collapse?.getInstance(navCollapse)
      if (collapseInstance) {
        collapseInstance.hide()
      }
    }
  }

  // 외부 클릭 시 메뉴 닫기
  const handleClickOutside = (event) => {
    if (headerRef.current && !headerRef.current.contains(event.target)) {
      closeMenu()
    }
  }

  // 커뮤니티 드롭다운 토글
  const toggleCommunityDropdown = () => {
    setIsCommunityDropdownOpen(!isCommunityDropdownOpen)
  }

  // 로그아웃
  const logout = async () => {
    await api.$post('/logout', {})

    // 1. 아이디 저장값만 따로 저장
    const savedPersonalId = localStorage.getItem('savedPersonalId')
    const savedCompanyId = localStorage.getItem('savedCompanyId')
    const savedLoginType = localStorage.getItem('savedLoginType')

    // 2. 로컬스토리지 전체 초기화
    localStorage.clear()

    // 3. 아이디 저장값 복원
    if (savedPersonalId) localStorage.setItem('savedPersonalId', savedPersonalId)
    if (savedCompanyId) localStorage.setItem('savedCompanyId', savedCompanyId)
    if (savedLoginType) localStorage.setItem('savedLoginType', savedLoginType)

    // 4. Context 상태 초기화
    clearUser()
    showAlert('로그아웃되었습니다.', 'success')
    
    // 5. 메인 페이지로 이동
    router.push('/')
  }

  // 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 경로 변경 시 메뉴 닫기
  useEffect(() => {
    closeMenu()
    setIsCommunityDropdownOpen(false)
  }, [currentPath])

  return (
    <header
      id="header"
      ref={headerRef}
      className="header-effect-shrink header-spacing"
      data-plugin-options='{"stickyEnabled": true}'
    >
      {isLoggedIn ? (
        /* 로그인 상태 */
        <div className={`${styles.headerBody} border-0`}>
          <div className="header-container container">
            <div className="header-row justify-content-between">
              <div className="header-left d-flex align-items-center">
                <a
                  href="/"
                  className={`text-primary fs-3 text-decoration-none ${styles.home}`}
                  onClick={(e) => {
                    e.preventDefault()
                    closeMenu()
                    router.push('/')
                  }}
                >
                  Freelancer<br />
                  Service
                </a>
              </div>
              <div className="d-flex align-items-center">
                <div className="header-nav header-nav-line header-nav-top-line header-nav-top-line-with-border order-2 order-lg-1">
                  <div className="header-nav-main header-nav-main-square header-nav-main-effect-2 header-nav-main-sub-effect-1">
                    <nav className="collapse">
                      <ul className="nav nav-pills" id="mainNav">
                        <li className="dropdown">
                          <a
                            href="/affiliation"
                            className={`dropdown-item dropdown-toggle ${isAffiliationActive ? 'active current-page-active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/affiliation')
                            }}
                          >
                            소속
                            <i className="fas fa-chevron-down"></i>
                          </a>
                        </li>
                        <li className="dropdown">
                          <a
                            href="/project"
                            className={`dropdown-item dropdown-toggle ${isProjectActive ? 'active current-page-active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/project')
                            }}
                          >
                            프로젝트
                            <i className="fas fa-chevron-down"></i>
                          </a>
                        </li>
                        <li className={`dropdown ${isCommunityDropdownOpen ? 'open' : ''}`}>
                          <a
                            href="#"
                            className={`dropdown-item dropdown-toggle ${isCommunityActive ? 'active current-page-active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              toggleCommunityDropdown()
                            }}
                            data-community-toggle
                          >
                            커뮤니티
                            <i className="fas fa-chevron-down"></i>
                          </a>
                          <ul className="dropdown-menu">
                            <li>
                              <a
                                href="/board"
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push('/board')
                                }}
                              >
                                일반 게시판
                              </a>
                            </li>
                            <li>
                              <a
                                href="/qna"
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push('/qna')
                                }}
                              >
                                Q&A 게시판
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <button
                    className="btn header-btn-collapse-nav"
                    data-bs-toggle="collapse"
                    data-bs-target=".header-nav-main nav"
                  >
                    <i className="fas fa-bars"></i>
                  </button>
                </div>
                <div className="header-nav-features header-nav-features-no-border header-nav-features-lg-show-border order-1 order-lg-2">
                  <div className="header-nav-feature d-inline-flex gap-2 align-items-center">
                    {/* 알림 드롭다운 */}
                    <div className="dropdown" ref={notificationDropdownRef}>
                      <a
                        href="#"
                        role="button"
                        className="btn btn-light d-flex justify-content-center align-items-center position-relative dropdown-toggle no-caret"
                        id="notificationDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                      >
                        <i className="bi bi-bell fs-5"></i>
                        <span
                          className="position-absolute border border-light rounded-circle"
                          style={{
                            top: '-1px',
                            right: '-1px',
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'var(--bs-primary)',
                            opacity: '0.85'
                          }}
                        ></span>
                      </a>
                      <div
                        className="dropdown-menu dropdown-menu-end p-2 shadow"
                        aria-labelledby="notificationDropdown"
                        style={{ minWidth: '250px' }}
                      >
                        <div className="dropdown-item small text-muted">
                          🔧 준비 중입니다.
                        </div>
                      </div>
                    </div>

                    {/* 유저 드롭다운 */}
                    <div className="dropdown" ref={userDropdownRef}>
                      <a
                        href="#"
                        role="button"
                        className="btn btn-light d-flex align-items-center gap-2 px-3 py-1 dropdown-toggle"
                        style={{ height: '36px', borderRadius: '50px' }}
                        id="userDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-person-circle fs-5"></i>
                        <span>{user.userNm}</span>
                      </a>
                      <ul
                        className="dropdown-menu dropdown-menu-end mt-2"
                        aria-labelledby="userDropdown"
                        style={{ minWidth: '150px' }}
                      >
                        <li>
                          <a 
                            href="/mypage" 
                            className="dropdown-item"
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/mypage')
                            }}
                          >
                            마이페이지
                          </a>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); logout() }}>
                            로그아웃
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 비로그인 상태 */
        <div className={`${styles.headerBody} border-0`}>
          <div className="header-container container">
            <div className="header-row justify-content-between">
              <div className="header-left d-flex align-items-center">
                <a
                  href="/"
                  className={`text-primary fs-3 text-decoration-none ${styles.home}`}
                  onClick={(e) => {
                    e.preventDefault()
                    closeMenu()
                    router.push('/')
                  }}
                >
                  Freelancer<br />
                  Service
                </a>
              </div>

              <div className="d-flex align-items-center">
                {/* 네비게이션 메뉴 */}
                <div className="header-nav header-nav-line header-nav-top-line header-nav-top-line-with-border order-2 order-lg-1">
                  <div className="header-nav-main header-nav-main-square header-nav-main-effect-2 header-nav-main-sub-effect-1">
                    <nav className="collapse">
                      <ul className="nav nav-pills" id="mainNav">
                        <li className="dropdown">
                          <a
                            href="/affiliation"
                            className={`dropdown-item dropdown-toggle ${isAffiliationActive ? 'active current-page-active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/affiliation')
                            }}
                          >
                            소속
                            <i className="fas fa-chevron-down"></i>
                          </a>
                        </li>
                        <li className="dropdown">
                          <a
                            href="/project"
                            className={`dropdown-item dropdown-toggle ${isProjectActive ? 'active current-page-active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              router.push('/project')
                            }}
                          >
                            프로젝트
                            <i className="fas fa-chevron-down"></i>
                          </a>
                        </li>
                        <li className={`dropdown ${isCommunityDropdownOpen ? 'open' : ''}`}>
                          <a
                            href="#"
                            className={`dropdown-item dropdown-toggle ${isCommunityActive ? 'active current-page-active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault()
                              toggleCommunityDropdown()
                            }}
                            data-community-toggle
                          >
                            커뮤니티
                            <i className="fas fa-chevron-down"></i>
                          </a>
                          <ul className="dropdown-menu">
                            <li>
                              <a
                                href="/board"
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push('/board')
                                }}
                              >
                                일반 게시판
                              </a>
                            </li>
                            <li>
                              <a
                                href="/qna"
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push('/qna')
                                }}
                              >
                                Q&A 게시판
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <button
                    className="btn header-btn-collapse-nav"
                    data-bs-toggle="collapse"
                    data-bs-target=".header-nav-main nav"
                  >
                    <i className="fas fa-bars"></i>
                  </button>
                </div>

                {/* 로그인 링크 */}
                <div className="header-nav-features header-nav-features-no-border header-nav-features-lg-show-border order-1 order-lg-2">
                  <div className="header-nav-feature d-inline-flex">
                    <a 
                      href="/auth/login" 
                      className="text-muted text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push('/auth/login')
                      }}
                    >
                      로그인
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}


