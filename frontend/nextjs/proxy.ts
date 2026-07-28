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
  // 길찾기 리다이렉트 — 프로젝트 목록이 비로그인 공개라 여기도 공개여야 한다(막으면 로그인으로 튕김)
  '/directions',
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
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 이미 로그인했으면 로그인/회원가입/계정복구 재진입 차단
  if (token && AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (token && PERSONAL_ONLY.some((p) => pathname.startsWith(p)) && userType !== 'PERSONAL') {
    return NextResponse.redirect(new URL('/mypage', req.url))
  }

  if (token && COMPANY_ONLY.some((p) => pathname.startsWith(p)) && userType !== 'COMPANY') {
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
