'use client'
// Mirrors vue_js/src/fo/components/common/CommonHeader.vue
// shadcn/ui 4.7+ = Base UI 기반 → asChild 없음, 컴포넌트 직접 스타일링
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, User, X } from 'lucide-react'
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
import { alertStore } from '@/stores/alertStore'
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

export default function CommonHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { userNm, isLoggedIn, clearUser, authChecked } = useUserStore()
  const loggedIn = isLoggedIn()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)

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
  const navCls = (active: boolean) =>
    `text-sm font-medium transition-colors hover:text-primary ${active ? 'text-primary' : 'text-foreground/70'}`

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
        scrolled ? 'shadow-md' : 'border-b',
      )}
      style={{ height: '64px' }}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="text-lg font-bold leading-tight text-primary">
          Freelancer<br />Service
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/affiliation" className={navCls(isActive(['/affiliation']))}>소속</Link>
          <Link href="/projects" className={navCls(isActive(['/projects']))}>프로젝트</Link>

          {/* 커뮤니티 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex items-center gap-1 text-sm font-medium outline-none transition-colors hover:text-primary',
                isActive(['/community', '/board', '/qna']) ? 'text-primary' : 'text-foreground/70',
              )}
            >
              커뮤니티 <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push('/community')}>
                커뮤니티 홈
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/board')}>
                일반 게시판
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/qna')}>
                Q&A 게시판
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/notice" className={navCls(isActive(['/notice']))}>공지사항</Link>
        </nav>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
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
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground hover:text-foreground md:block"
            >
              로그인
            </Link>
          ) : null}

          {/* 모바일 Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col pt-10">
              <Link href="/" className="mb-6 text-lg font-bold text-primary">
                Freelancer Service
              </Link>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/affiliation"
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium',
                    isActive(['/affiliation']) ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  소속
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
                <button
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium',
                    isActive(['/community', '/board', '/qna'])
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
                  <div className="ml-4 flex flex-col gap-1 border-l pl-3">
                    <Link href="/community" className="rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                      커뮤니티 홈
                    </Link>
                    <Link href="/board" className="rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                      일반 게시판
                    </Link>
                    <Link href="/qna" className="rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                      Q&A 게시판
                    </Link>
                  </div>
                )}
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
                  <Link href="/login" className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                    로그인
                  </Link>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
