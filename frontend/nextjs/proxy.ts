// Next.js 16: proxy.ts (renamed from middleware.ts)
// Mirrors vue_js/src/fo/router/index.js — beforeEach auth/role guards
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/sign-up',
  '/find-account',
  '/reset-password',
  '/community',
  '/board',
  '/qna',
  '/notice',
  '/affiliation',
  '/projects',
  // Phase2 게시판 전면 재설계(2026-09) 신설 5종 — board/qna와 같은 이유로 공개
  '/career',
  '/tech',
  '/company',
  '/teamup',
  '/lounge',
  // Phase2 신규 화면 — 로그인 없이도 볼 수 있어야 하는 공개 화면
  '/salary',
  '/interview',
  '/vote',
]

// PUBLIC_PATHS 접두사 아래에 있지만 로그인 없이는 쓸 수 없는 작성 화면 — 비로그인이 긴 폼을
// 다 채운 뒤 제출에서야 401 로 튕기지 않도록 진입 시점에 로그인으로 보낸다.
const LOGIN_REQUIRED_PATHS = [
  '/board/register',
  '/qna/register',
  '/career/register',
  '/tech/register',
  '/company/register',
  '/teamup/register',
  '/lounge/register',
  '/vote/register',
  '/interview/write',
]

// 로그인 상태에서 진입하면 홈으로 돌려보낼 인증 전용 경로
const AUTH_ONLY_PATHS = ['/login', '/sign-up', '/find-account', '/reset-password']

// Vue 가드(router/index.js)에서 appliedProjects·projectScrap은 역할 제한이 없고
// COMPANY 사이드바도 두 메뉴를 노출하므로 PERSONAL 전용에서 제외한다.
const PERSONAL_ONLY = [
  '/mypage/affiliated-info',
  '/mypage/affiliated-scrap',
  '/mypage/affiliated-job-applications',
  '/mypage/resume',
]

const COMPANY_ONLY = [
  '/mypage/affiliation-edit',
  '/mypage/affiliated-members',
  '/mypage/affiliation-applicants',
  '/mypage/affiliation-projects',
  '/mypage/project-post',
]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('accessToken')?.value
  const userType = req.cookies.get('userType')?.value

  const isPublic =
    pathname === '/' ||
    (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) &&
      !LOGIN_REQUIRED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')))

  if (!isPublic && !token) {
    // 원래 가려던 화면을 ?redirect= 로 넘겨 로그인 후 되돌아오게 한다(LoginForm 이 내부 경로만 허용).
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // 이미 로그인했으면 로그인/회원가입/계정복구 재진입 차단.
  // 단, /login·/sign-up은 loginType 쿼리로 다른 회원 유형(개인↔기업)을 명시한 경우
  // 계정을 바꾸려는 의도이므로 통과시킨다 — LoginForm이 제출 시 기존 세션을 정리한다.
  if (token && AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    // loginType 을 명시한 경우에만 계정 전환으로 본다 — 생략된 채 /login 으로 오는 건 전환 의도가 아니므로
    // (기본값을 PERSONAL 로 간주하면 로그인한 기업회원이 평범한 /login 에 들어와도 통과돼 버린다) 홈으로 돌려보낸다.
    const requestedType = req.nextUrl.searchParams.get('loginType')
    const isAccountSwitch =
      (pathname === '/login' || pathname === '/sign-up') &&
      (requestedType === 'COMPANY' || requestedType === 'PERSONAL') &&
      requestedType !== userType
    if (!isAccountSwitch) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (
    token &&
    PERSONAL_ONLY.some((p) => pathname === p || pathname.startsWith(p + '/')) &&
    userType !== 'PERSONAL'
  ) {
    return NextResponse.redirect(new URL('/mypage', req.url))
  }

  if (
    token &&
    COMPANY_ONLY.some((p) => pathname === p || pathname.startsWith(p + '/')) &&
    userType !== 'COMPANY'
  ) {
    return NextResponse.redirect(new URL('/mypage', req.url))
  }

  // 프로젝트 상세: 로그인 상태에서 반대 역할 경로로 직접 진입하면 자기 역할 경로로 교정한다.
  // (Vue 원본은 role 불일치를 홈으로 차단했으나, /projects는 SEO 목적 public 유지 → 비로그인은 통과)
  if (token) {
    if (userType === 'COMPANY' && pathname.startsWith('/projects/user/')) {
      const url = req.nextUrl.clone()
      url.pathname = pathname.replace('/projects/user/', '/projects/company/')
      return NextResponse.redirect(url)
    }
    if (userType === 'PERSONAL' && pathname.startsWith('/projects/company/')) {
      const url = req.nextUrl.clone()
      url.pathname = pathname.replace('/projects/company/', '/projects/user/')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  // /api/* 는 rewrites 프록시 경로 — 미들웨어 가드 제외
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
