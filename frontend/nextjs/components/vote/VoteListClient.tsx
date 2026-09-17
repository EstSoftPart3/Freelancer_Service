'use client'
import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import CommonPagination from '@/components/community/CommonPagination'
import VoteCard from '@/components/vote/VoteCard'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import { VOTE_CATEGORIES, type VoteListItem, type VoteListResponse } from '@/components/vote/types'

const PAGE_SIZE = 9

interface Props {
  initialData: VoteListResponse | null
}

export default function VoteListClient({ initialData }: Props) {
  const { authChecked, isLoggedIn } = useUserStore()
  const [votes, setVotes] = useState<VoteListItem[]>(initialData?.votes ?? [])
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<number | null>(null)
  const [totalPages, setTotalPages] = useState(
    initialData ? Math.max(1, Math.ceil(initialData.totalElements / PAGE_SIZE)) : 1,
  )
  const [isLoading, setIsLoading] = useState(false)
  // 페이지 버튼을 연달아 누르면 먼저 보낸 느린 요청이 나중 요청보다 늦게 응답할 수 있다 —
  // 응답 순서가 아니라 "가장 마지막으로 보낸 요청"만 반영한다(BoardListClient와 같은 패턴).
  const requestSeqRef = useRef(0)

  const fetchPage = useCallback(async (p: number, categoryFilter: number | null) => {
    const seq = ++requestSeqRef.current
    setIsLoading(true)
    try {
      const categoryQs = categoryFilter != null ? `&category=${categoryFilter}` : ''
      const { data } = await api.get<{ output: VoteListResponse }>(
        `/votes?page=${p}&size=${PAGE_SIZE}&sortType=latest${categoryQs}`,
      )
      if (seq !== requestSeqRef.current) return
      setVotes(data.output.votes)
      setTotalPages(Math.max(1, Math.ceil(data.output.totalElements / PAGE_SIZE)))
      setPage(p)
    } catch {
      if (seq !== requestSeqRef.current) return
      alertStore.show('투표 목록을 불러올 수 없습니다.', 'danger')
    } finally {
      if (seq === requestSeqRef.current) setIsLoading(false)
    }
  }, [])

  const handleCategoryChange = (c: number | null) => {
    setCategory(c)
    fetchPage(1, c)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">투표</h1>
        {authChecked && isLoggedIn() && (
          <Link
            href="/vote/register"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            투표 만들기
          </Link>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            category === null ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-muted'
          }`}
        >
          전체
        </button>
        {VOTE_CATEGORIES.map((c) => (
          <button
            key={c.commonCodeSq}
            onClick={() => handleCategoryChange(c.commonCodeSq)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c.commonCodeSq ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-muted'
            }`}
          >
            {c.commonCodeNm}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">불러오는 중...</div>
      ) : votes.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          아직 등록된 투표가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {votes.map((v) => (
            <VoteCard key={v.voteSq} vote={v} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <CommonPagination currentPage={page} totalPages={totalPages} onPageChange={(p) => fetchPage(p, category)} />
      )}
    </div>
  )
}
