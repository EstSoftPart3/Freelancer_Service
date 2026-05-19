// Next.js 16: proxy.ts (renamed from middleware.ts)
// Mirrors vue_js/src/fo/router/index.js — beforeEach auth/role guards
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/sign-up',
  '/find-account',
  '/reset-password',
  '/board',
  '/qna',
  '/notice',
  '/affiliation',
  '/projects',
]

const PERSONAL_ONLY = [
  '/mypage/affiliated-info',
  '/mypage/affiliated-scrap',
  '/mypage/affiliated-job-applications',
  '/mypage/resume',
  '/mypage/applied-projects',
  '/mypage/project-scrap',
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

  if (token && PERSONAL_ONLY.some((p) => pathname.startsWith(p)) && userType !== 'PERSONAL') {
    return NextResponse.redirect(new URL('/mypage', req.url))
  }

  if (token && COMPANY_ONLY.some((p) => pathname.startsWith(p)) && userType !== 'COMPANY') {
    return NextResponse.redirect(new URL('/mypage', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // /api/* 는 rewrites 프록시 경로 — 미들웨어 가드 제외
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
