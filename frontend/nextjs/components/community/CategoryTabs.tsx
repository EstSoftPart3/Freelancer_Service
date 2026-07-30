'use client'
import type { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useCommunityStore } from '@/stores/communityStore'
import { useUserStore } from '@/stores/userStore'

const TABS = [
  { label: '전체보기', href: '/community/list' },
  { label: '일반게시판', href: '/board' },
  { label: 'Q&A 게시판', href: '/qna' },
  // 고객의 소리는 목록부터 로그인이 필요하다(비공개 글이 섞여 있어 공개 목록이 성립하지 않는다).
  // 비로그인에게 탭을 보여주면 누르는 순간 로그인 화면으로 튕기므로 아예 숨긴다.
  { label: '고객의 소리', href: '/voc', authOnly: true },
]

interface Props {
  // 탭 줄 오른쪽에 붙는 필터·검색 영역 — 모바일에서는 다음 줄 전체폭으로 내려간다.
  rightSlot?: ReactNode
}

export default function CategoryTabs({ rightSlot }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { sort, searchType, keyword, status } = useCommunityStore()
  // authChecked 전에는 로그인 여부를 단정하지 않는다 — SSR과 첫 렌더가 갈리면 hydration이 깨진다.
  const { isLoggedIn, authChecked } = useUserStore()
  const visibleTabs = TABS.filter((t) => !t.authOnly || (authChecked && isLoggedIn()))

  const go = (href: string) => {
    const qs = new URLSearchParams({ sort, searchType })
    if (keyword.trim()) qs.set('keyword', keyword.trim())
    if (href === '/qna' && status !== 'all') qs.set('status', status)
    router.push(`${href}?${qs.toString()}`)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 pb-1">
      <div className="flex gap-2 overflow-x-auto">
        {visibleTabs.map((t) => {
          const active = pathname === t.href
          return (
            <button
              key={t.href}
              type="button"
              onClick={() => go(t.href)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {rightSlot && (
        <div className="ml-auto flex w-full flex-wrap items-center gap-2 md:w-auto">{rightSlot}</div>
      )}
    </div>
  )
}
