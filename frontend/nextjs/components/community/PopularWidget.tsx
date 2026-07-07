'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import type { CommunityBestItem } from '@/types'

type Period = 'daily' | 'weekly' | 'monthly'

const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: 'daily', label: '지금 인기' },
  { value: 'weekly', label: '주간 인기' },
  { value: 'monthly', label: '월간 인기' },
]

interface Props {
  title?: string
  size?: number
  showTabs?: boolean
  initialPeriod?: Period
  initialItems?: CommunityBestItem[]
}

export default function PopularWidget({
  title = '인기 게시물',
  size = 10,
  showTabs = true,
  initialPeriod = 'daily',
  initialItems,
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
        <h3 className="text-sm font-semibold">{title}</h3>
        {showTabs && (
          <div className="flex gap-1 text-xs">
            {PERIOD_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setPeriod(t.value)}
                className={`rounded-full px-2 py-1 cursor-pointer transition-colors ${
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
        <ol className="space-y-2">
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
