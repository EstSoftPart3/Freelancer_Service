'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import BestCriteriaInfo from '@/components/community/BestCriteriaInfo'
import type { CommunityBestItem } from '@/types'

type Period = 'daily' | 'weekly' | 'monthly'

const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: 'daily', label: '지금 인기' },
  { value: 'weekly', label: '주간 인기' },
  { value: 'monthly', label: '월간 인기' },
]

// 백엔드 findBestBoards의 DATE_SUB INTERVAL과 일치시킨다
const PERIOD_DAYS: Record<Period, number> = { daily: 1, weekly: 7, monthly: 30 }

interface Props {
  // 미지정 시 제목 없이 탭만 한 줄로 노출 (목록 사이드바용)
  title?: string
  size?: number
  showTabs?: boolean
  initialPeriod?: Period
  initialItems?: CommunityBestItem[]
  // true면 리스트에 max-height + 세로 스크롤 적용 (허브 우측 추천글용)
  scrollable?: boolean
}

export default function PopularWidget({
  title,
  size = 10,
  showTabs = true,
  initialPeriod = 'daily',
  initialItems,
  scrollable = false,
}: Props) {
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [items, setItems] = useState<CommunityBestItem[]>(initialItems ?? [])
  const [loading, setLoading] = useState(!initialItems)

  useEffect(() => {
    // 최초 렌더에서 서버가 내려준 initialItems(=initialPeriod)를 그대로 쓰고,
    // 그 이후 탭 전환에서만 클라이언트 fetch를 수행한다.
    if (initialItems && period === initialPeriod) return

    let cancelled = false
    setLoading(true)
    api
      .get<{ output: CommunityBestItem[] }>('/community/best', { params: { period, size } })
      .then(({ data }) => { if (!cancelled) setItems(data.output ?? []) })
      .catch(() => { if (!cancelled) setItems([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, size])

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          {title && <h3 className="truncate text-sm font-semibold">{title}</h3>}
          {/* 탭이 있으면 탭 자체가 기준을 드러내므로, 탭이 없을 때만 현재 기간을 안내한다 */}
          <BestCriteriaInfo
            note={showTabs ? undefined : `이 목록은 ${PERIOD_TABS.find((t) => t.value === period)?.label}(최근 ${PERIOD_DAYS[period]}일 작성글) 기준입니다.`}
          />
        </div>
        {showTabs && (
          <div className="flex gap-1 text-xs">
            {PERIOD_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setPeriod(t.value)}
                className={`whitespace-nowrap rounded-full px-2 py-1 cursor-pointer transition-colors ${
                  period === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="py-6 text-center text-xs text-muted-foreground">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">게시글이 없습니다.</p>
      ) : (
        <ol className={`space-y-2 ${scrollable ? 'max-h-[420px] overflow-y-auto pr-1' : ''}`}>
          {items.map((item, i) => (
            <li key={`${item.boardType}-${item.sq}`} className="flex items-start gap-2 text-sm">
              <span className="w-4 shrink-0 font-bold text-primary">{i + 1}</span>
              <Link
                href={`/${item.boardType}/${item.sq}`}
                className="min-w-0 flex-1 truncate hover:text-primary hover:underline"
              >
                {item.ttl}
              </Link>
              {item.commentCnt > 0 && (
                <span className="shrink-0 text-xs text-muted-foreground">{item.commentCnt}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
