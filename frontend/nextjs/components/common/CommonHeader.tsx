'use client'
// Mirrors vue_js/src/fo/components/common/CommonHeader.vue
// shadcn/ui 4.7+ = Base UI 기반 → asChild 없음, 컴포넌트 직접 스타일링
//
// Phase2 개편: 1단(로고만) + 2단(전체 네비 한 줄) 구조로 분리. 연봉계산기·연봉순위표를
// 굵게 강조하고, 커뮤니티는 가로 메가메뉴로, 기업서비스는 별도 드롭다운으로 뺐다.
// "소속"은 "파트너"로 라벨만 바꿨다(라우트는 그대로 /affiliation).
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Calculator, ChevronDown, LogOut, Menu, Search, TrendingUp, User, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Notification {
  notificationSq: number
  notificationContentTxt: string
  notificationReadYn: 'Y' | 'N'
  notificationTargetUrl?: string
  notificationCreatedAtDtm?: string
}

function clearAuthCookies() {
  document.cookie = 'accessToken=; Max-Age=0; path=/'
  document.cookie = 'refreshToken=; Max-Age=0; path=/'
  document.cookie = 'userType=; Max-Age=0; path=/'
}

// 백엔드가 알림 targetUrl을 Vue 라우터 camelCase로 저장 → Next kebab 라우트와 불일치(하드 404).
// 단순 camelCase→kebab이 아니라(예: affiliationProjectList → affiliation-projects) 명시적 매핑 필요.
const NOTI_LEGACY_MYPAGE_MAP: Record<string, string> = {
  appliedProjects: 'applied-projects',
  affiliationProjectList: 'affiliation-projects',
  affiliationApplicantList: 'affiliation-applicants',
  affiliatedMembers: 'affiliated-members',
  affiliatedJobApplications: 'affiliated-job-applications',
}

function normalizeNotificationUrl(url?: string): string {
  if (!url) return '#'
  const [path, query] = url.split('?')
  const match = path.match(/^\/mypage\/([^/]+)$/)
  if (match) {
    const kebab = NOTI_LEGACY_MYPAGE_MAP[match[1]]
    if (kebab) {
      const rebuilt = `/mypage/${kebab}`
      return query ? `${rebuilt}?${query}` : rebuilt
    }
  }
  return url
}

// 커뮤니티 메가메뉴 — 대분류 6 + 소분류. 실제 카테고리 재설계(백엔드 공통코드)는 아직 안 됐으므로
// 소분류 링크는 우선 /community 로 보내고 tab/sub 쿼리만 붙여둔다(추후 게시판 개편 때 실제 필터로 연결).
const COMMUNITY_MEGA: { key: string; label: string; subs: string[] }[] = [
  { key: 'career', label: '커리어/소통', subs: ['연봉', '이직', '면접'] },
  { key: 'tech', label: '기술/소통', subs: ['개발', 'AI'] },
  { key: 'company', label: '요즘회사', subs: [] },
  { key: 'project', label: '프로젝트', subs: [] },
  { key: 'lounge', label: '라운지(자유)', subs: ['말머리', '잡담'] },
  { key: 'vote', label: '투표', subs: [] },
]

function communityHref(tab: string, sub?: string) {
  if (tab === 'vote') return '/vote'
  if (tab === 'project') return '/projects'
  const params = new URLSearchParams({ tab })
  if (sub) params.set('sub', sub)
  return `/community?${params.toString()}`
}

export default function CommonHeader() {
  const pathname = usePathname()
  const router = useRouter()
  // 헤더는 본인에게만 보이는 개인 영역이라 실명을 쓴다(공개 노출 지점이 아니다).
  // 커뮤니티 게시글·댓글 등 남에게 보이는 곳만 닉네임으로 치환했다.
  const { userNm, isLoggedIn, clearUser, authChecked } = useUserStore()
  const loggedIn = isLoggedIn()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMobileCommunityOpen(false)
  }, [pathname])

  useEffect(() => {
    if (loggedIn) {
      fetchNotifications()
      fetchUnreadCount()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [loggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get<Notification[]>('/notifications')
      setNotifications(data)
    } catch {
      console.error('[Header] 알림 목록 조회 실패')
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get<number>('/notifications/unread-count')
      setUnreadCount(data)
    } catch {
      console.error('[Header] 알림 개수 조회 실패')
    }
  }

  const markAsRead = async (noti: Notification) => {
    if (noti.notificationReadYn === 'Y') return
    try {
      await api.patch(`/notifications/${noti.notificationSq}`)
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationSq === noti.notificationSq ? { ...n, notificationReadYn: 'Y' } : n,
        ),
      )
      await fetchUnreadCount()
    } catch {
      console.error('[Header] 알림 읽음 처리 실패')
    }
  }

  const deleteNoti = async (sq: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${sq}`)
      setNotifications((prev) => prev.filter((n) => n.notificationSq !== sq))
      await fetchUnreadCount()
    } catch {
      console.error('[Header] 알림 삭제 실패')
    }
  }

  const markAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.patch('/notifications')
      setNotifications((prev) => prev.map((n) => ({ ...n, notificationReadYn: 'Y' })))
      setUnreadCount(0)
    } catch {
      console.error('[Header] 알림 모두 읽음 처리 실패')
    }
  }

  const deleteAllNoti = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.delete('/notifications')
      setNotifications([])
      setUnreadCount(0)
    } catch {
      console.error('[Header] 알림 전체 삭제 실패')
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout', {})
    } catch {
      // 서버 실패해도 클라이언트 상태 초기화
    }
    clearUser()
    clearAuthCookies()
    // GA4: logout
    window.location.href = '/?logout=true'
  }

  const isActive = (paths: string[]) => paths.some((p) => pathname.startsWith(p))
  // 곡선이 있는 버튼 형태 — 활성 탭은 은은한 배경, 나머지는 hover 시에만 배경이 뜬다
  const navCls = (active: boolean) =>
    cn(
      'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'border-primary/30 bg-primary/10 text-primary'
        : 'border-border bg-muted/60 text-foreground/70 hover:border-foreground/20 hover:bg-muted hover:text-foreground',
    )

  // 커뮤니티 전체글 검색으로 보낸다 — BoardListClient가 ?keyword= 를 그대로 받아 검색한다.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchTerm.trim()
    if (!q) return
    router.push(`/community/list?keyword=${encodeURIComponent(q)}`)
  }

  // 알림 팝오버 내용 (로그인 시 공용)
  const NotificationPanel = (
    <PopoverContent className="w-80 p-0" align="end">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
        <h6 className="font-semibold">알림</h6>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
          <Button variant="outline" size="xs" onClick={markAllAsRead}>모두 읽음</Button>
          <Button variant="destructive" size="xs" onClick={deleteAllNoti}>전체 삭제</Button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((noti) => (
            <div
              key={noti.notificationSq}
              onClick={() => markAsRead(noti)}
              className={cn(
                'cursor-pointer border-b px-4 py-3 transition-colors hover:bg-muted/50',
                noti.notificationReadYn === 'N'
                  ? 'border-l-2 border-l-primary bg-blue-50/50'
                  : 'opacity-80',
              )}
            >
              <Link href={normalizeNotificationUrl(noti.notificationTargetUrl)} className="block no-underline">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'break-all text-xs leading-relaxed',
                      noti.notificationReadYn === 'N'
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {noti.notificationContentTxt}
                  </p>
                  <button
                    onClick={(e) => deleteNoti(noti.notificationSq, e)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {noti.notificationCreatedAtDtm?.split('T')[0] ?? ''}
                </p>
              </Link>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-40" />
            <p className="text-sm">새로운 알림이 없습니다.</p>
          </div>
        )}
      </div>
    </PopoverContent>
  )

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full bg-background transition-shadow duration-300',
        scrolled ? 'shadow-md border-b' : 'border-b',
      )}
    >
      {/* 1단 — 로고만 */}
      <div className="border-b">
        <div className="container mx-auto flex h-12 items-center px-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Ctrl + F 홈">
            <img
              src="/img/brand/logo-horizontal.png"
              alt="Ctrl + F"
              width={167}
              height={28}
              className="h-6 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* 2단 — 전체 네비 한 줄 (좌: 메뉴, 우: 검색·로그인·기업서비스) */}
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <nav className="hidden min-w-0 items-center gap-2 md:flex">
          {/* 연봉계산기·연봉순위표 — 클릭을 유도하는 강조 버튼. 나머지 메뉴와 확실히 구분되도록
              색을 넣고, hover 시 살짝 떠오르며 아이콘이 반응한다. */}
          <Link
            href="/salary/calculator"
            className="salary-cta group flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            <Calculator className="h-4 w-4 transition-transform duration-200 group-hover:rotate-[-8deg]" />
            연봉계산기
          </Link>
          <Link
            href="/salary/ranking"
            className="salary-cta group flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            <TrendingUp className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            연봉순위표
          </Link>

          <span className="mx-1 h-4 w-px shrink-0 bg-border" aria-hidden />

          {/* 커뮤니티 메가메뉴 */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors',
                isActive(['/community', '/board', '/qna', '/voc', '/vote'])
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-muted/60 text-foreground/70 hover:border-foreground/20 hover:bg-muted hover:text-foreground',
              )}
            >
              커뮤니티 <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[720px] max-w-[calc(100vw-2rem)] p-5">
              <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                {COMMUNITY_MEGA.map((col) => (
                  <div key={col.key}>
                    <Link
                      href={communityHref(col.key)}
                      className="mb-2 block text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {col.label}
                    </Link>
                    {col.subs.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {col.subs.map((sub) => (
                          <li key={sub}>
                            <Link
                              href={communityHref(col.key, sub)}
                              className="text-sm text-muted-foreground hover:text-foreground"
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t pt-3">
                <Link href="/community" className="text-sm font-medium text-primary hover:underline">
                  커뮤니티 홈 전체 보기
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/interview" className={cn('shrink-0', navCls(isActive(['/interview'])))}>면접후기</Link>
          <Link href="/projects" className={cn('shrink-0', navCls(isActive(['/projects'])))}>프로젝트</Link>
          <Link href="/affiliation" className={cn('shrink-0', navCls(isActive(['/affiliation'])))}>파트너</Link>
          <Link href="/notice" className={cn('shrink-0', navCls(isActive(['/notice'])))}>공지사항</Link>
        </nav>

        {/* 우측 액션 */}
        <div className="flex shrink-0 items-center gap-3">
          {/* 검색 — 아이콘 + 밑줄만 */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <label className="flex items-center gap-1.5 border-b border-input px-0.5 py-1 text-sm text-muted-foreground transition-colors focus-within:border-foreground focus-within:text-foreground">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground lg:w-40"
              />
            </label>
          </form>

          {loggedIn ? (
            <>
              {/* 알림 팝오버 */}
              <Popover>
                <PopoverTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    'relative',
                  )}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </PopoverTrigger>
                {NotificationPanel}
              </Popover>

              {/* 유저 드롭다운 (데스크탑) */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'hidden gap-2 rounded-full md:flex',
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>{userNm}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/mypage')}>
                    마이페이지
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : authChecked ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                로그인
              </Link>
              <Link href="/sign-up" className="text-sm text-muted-foreground hover:text-foreground">
                회원가입
              </Link>
            </div>
          ) : null}

          {/* 기업서비스 — 클릭 시 실제로 있는 기업 기능만 나열 */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: 'outline' }), 'hidden md:inline-flex')}
            >
              기업서비스
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <DropdownMenuItem
                className="flex-col items-start gap-0.5 py-2"
                onClick={() => router.push('/login?loginType=COMPANY')}
              >
                <span className="font-medium">기업 로그인</span>
                <span className="text-xs text-muted-foreground">기업 회원으로 로그인합니다</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex-col items-start gap-0.5 py-2"
                onClick={() => router.push('/sign-up?loginType=COMPANY')}
              >
                <span className="font-medium">기업 회원가입</span>
                <span className="text-xs text-muted-foreground">사업자등록번호로 기업 회원을 만듭니다</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex-col items-start gap-0.5 py-2"
                onClick={() => router.push('/mypage/project-post')}
              >
                <span className="font-medium">프로젝트 공고 관리</span>
                <span className="text-xs text-muted-foreground">등록 · 수정 · 지원자 확인</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex-col items-start gap-0.5 py-2"
                onClick={() => router.push('/mypage/affiliation-edit')}
              >
                <span className="font-medium">파트너 모집 관리</span>
                <span className="text-xs text-muted-foreground">소속 정보 · 인원 · 지원자 현황</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 모바일 Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="flex w-80 flex-col overflow-y-auto pt-10">
              <Link href="/" className="mb-4 flex items-center" aria-label="Ctrl + F 홈">
                <img
                  src="/img/brand/logo-horizontal.png"
                  alt="Ctrl + F"
                  width={167}
                  height={28}
                  className="h-7 w-auto"
                />
              </Link>

              <div className="mb-4 flex gap-2">
                <Link
                  href="/salary/calculator"
                  className="salary-cta flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-3 py-2 text-center text-sm font-bold text-white"
                >
                  <Calculator className="h-4 w-4" />
                  연봉계산기
                </Link>
                <Link
                  href="/salary/ranking"
                  className="salary-cta flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-3 py-2 text-center text-sm font-bold text-white"
                >
                  <TrendingUp className="h-4 w-4" />
                  연봉순위표
                </Link>
              </div>

              <nav className="flex flex-col gap-1">
                <button
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium',
                    isActive(['/community', '/board', '/qna', '/vote'])
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted',
                  )}
                  onClick={() => setMobileCommunityOpen((v) => !v)}
                >
                  커뮤니티
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', mobileCommunityOpen && 'rotate-180')}
                  />
                </button>
                {mobileCommunityOpen && (
                  <div className="ml-4 flex flex-col gap-2 border-l pl-3">
                    {COMMUNITY_MEGA.map((col) => (
                      <div key={col.key}>
                        <Link href={communityHref(col.key)} className="block rounded-md py-1 text-sm font-semibold hover:bg-muted">
                          {col.label}
                        </Link>
                        {col.subs.length > 0 && (
                          <div className="ml-2 flex flex-col">
                            {col.subs.map((sub) => (
                              <Link
                                key={sub}
                                href={communityHref(col.key, sub)}
                                className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/interview"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium',
                    isActive(['/interview']) ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  면접후기
                </Link>
                <Link
                  href="/projects"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium',
                    isActive(['/projects']) ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  프로젝트
                </Link>
                <Link
                  href="/affiliation"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium',
                    isActive(['/affiliation']) ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  파트너
                </Link>
                <Link
                  href="/notice"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium',
                    isActive(['/notice']) ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  공지사항
                </Link>
              </nav>

              <div className="mt-4 border-t pt-4">
                <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">기업서비스</p>
                <div className="flex flex-col gap-1">
                  <Link href="/login?loginType=COMPANY" className="rounded-md px-3 py-2 text-sm hover:bg-muted">기업 로그인</Link>
                  <Link href="/sign-up?loginType=COMPANY" className="rounded-md px-3 py-2 text-sm hover:bg-muted">기업 회원가입</Link>
                  <Link href="/mypage/project-post" className="rounded-md px-3 py-2 text-sm hover:bg-muted">프로젝트 공고 관리</Link>
                  <Link href="/mypage/affiliation-edit" className="rounded-md px-3 py-2 text-sm hover:bg-muted">파트너 모집 관리</Link>
                </div>
              </div>

              <div className="mt-auto border-t pt-4">
                {loggedIn ? (
                  <>
                    <Link
                      href="/mypage"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <User className="h-4 w-4" />
                      {userNm} · 마이페이지
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </button>
                  </>
                ) : authChecked ? (
                  <div className="flex gap-2">
                    <Link href="/login" className="flex-1 rounded-md px-3 py-2 text-center text-sm font-medium hover:bg-muted">
                      로그인
                    </Link>
                    <Link href="/sign-up" className="flex-1 rounded-md px-3 py-2 text-center text-sm font-medium hover:bg-muted">
                      회원가입
                    </Link>
                  </div>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
