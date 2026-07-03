'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const PERSONAL_NAV: NavGroup[] = [
  {
    title: '일정 관리',
    items: [{ href: '/mypage/calendar', label: '캘린더 보기' }],
  },
  {
    title: '이력서 관리',
    items: [
      { href: '/mypage/resume/new', label: '이력서 등록' },
      { href: '/mypage/resume', label: '이력서 목록' },
    ],
  },
  {
    title: '소속 관리',
    items: [
      { href: '/mypage/affiliated-info', label: '소속 정보' },
      { href: '/mypage/affiliated-job-applications', label: '지원 내역' },
      { href: '/mypage/affiliated-scrap', label: '스크랩 내역' },
    ],
  },
  {
    title: '프로젝트 관리',
    items: [
      { href: '/mypage/applied-projects', label: '지원 내역' },
      { href: '/mypage/project-scrap', label: '스크랩 내역' },
    ],
  },
  {
    title: '회원 정보 관리',
    items: [
      { href: '/mypage/information-edit', label: '회원 정보 수정' },
      { href: '/mypage/withdraw', label: '회원 탈퇴' },
    ],
  },
]

const COMPANY_NAV: NavGroup[] = [
  {
    title: '일정 관리',
    items: [{ href: '/mypage/calendar', label: '캘린더 보기' }],
  },
  {
    title: '소속 공고 관리',
    items: [
      { href: '/mypage/affiliation-edit', label: '소속 정보 수정' },
      { href: '/mypage/affiliated-members', label: '소속 인원 목록' },
      { href: '/mypage/affiliation-applicants', label: '지원자 현황' },
    ],
  },
  {
    title: '프로젝트 관리',
    items: [
      { href: '/mypage/affiliation-projects', label: '프로젝트 공고 목록' },
      { href: '/mypage/applied-projects', label: '지원 내역' },
      { href: '/mypage/project-scrap', label: '스크랩 내역' },
    ],
  },
  {
    title: '회원 정보 관리',
    items: [
      { href: '/mypage/information-edit', label: '회원 정보 수정' },
      { href: '/mypage/withdraw', label: '회원 탈퇴' },
    ],
  },
]

interface Props {
  onNavigate?: () => void
}

export default function MyPageSidebar({ onNavigate }: Props) {
  const pathname = usePathname()
  const { getUserType } = useUserStore()
  const userType = getUserType()
  const navGroups = userType === 'COMPANY' ? COMPANY_NAV : PERSONAL_NAV

  // Vue router-link-exact-active와 동일하게 정확 일치만 강조한다.
  // (startsWith를 쓰면 /mypage/resume/new 에서 '/mypage/resume'(이력서 목록)까지 활성화됨)
  function isActive(href: string) {
    if (href === '/mypage/information-edit') {
      return pathname === '/mypage' || pathname === '/mypage/information-edit'
    }
    return pathname === href
  }

  return (
    <nav className="space-y-6">
      <h2 className="font-bold text-lg">마이페이지</h2>
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="text-sm font-semibold text-foreground px-2">{group.title}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'block px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-muted',
                    isActive(item.href)
                      ? 'font-semibold text-primary bg-muted'
                      : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
