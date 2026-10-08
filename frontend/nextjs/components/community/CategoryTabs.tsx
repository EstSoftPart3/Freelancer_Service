'use client'
import type { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useCommunityStore } from '@/stores/communityStore'
import { supportsAnswer, type BoardType } from '@/components/community/boardMeta'

// Phase2 게시판 전면 재설계(2026-09) — 일반게시판/QnA는 데이터를 전부 이관하고 비활성화됐다.
// 실제 게시판 종류인 6대분류(투표 제외)를 여기서 직접 보여준다.
const TABS = [
  { label: '전체보기', href: '/community/list' },
  { label: '커리어소통', href: '/career' },
  { label: '기술소통', href: '/tech' },
  { label: '요즘회사', href: '/company' },
  { label: '프로젝트', href: '/teamup' },
  { label: '라운지', href: '/lounge' },
  { label: '투표', href: '/vote' },
  // 고객의 소리는 목록부터 로그인이 필요하지만(비로그인은 누르면 로그인 화면으로 간다) 탭은 늘 보인다 —
  // 로그인 확인(/me) 뒤에 끼워 넣으면 탭 줄이 늘어나 아래 내용이 42px 밀린다(CLS).
  { label: '고객의 소리', href: '/voc' },
]

interface Props {
  // 탭 줄 오른쪽에 붙는 필터·검색 영역 — 모바일에서는 다음 줄 전체폭으로 내려간다.
  rightSlot?: ReactNode
}

export default function CategoryTabs({ rightSlot }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { sort, searchType, keyword, status } = useCommunityStore()

  const go = (href: string) => {
    const qs = new URLSearchParams({ sort, searchType })
    if (keyword.trim()) qs.set('keyword', keyword.trim())
    // 채택상태 필터는 답변을 지원하는 게시판(커리어소통·기술소통)에서만 의미가 있다.
    if (supportsAnswer(href.slice(1) as BoardType) && status !== 'all') qs.set('status', status)
    router.push(`${href}?${qs.toString()}`)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 pb-1">
      {/* 가로 스크롤은 숨은 탭이 보이지 않아 좁은 화면에서는 줄을 바꾼다(PC는 한 줄에 다 들어간다) */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
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
