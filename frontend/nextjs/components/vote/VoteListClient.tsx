'use client'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import CommonPagination from '@/components/community/CommonPagination'
import VoteCard from '@/components/vote/VoteCard'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { VoteListItem, VoteListResponse } from '@/components/vote/types'

const PAGE_SIZE = 9

interface Props {
  initialData: VoteListResponse | null
}

export default function VoteListClient({ initialData }: Props) {
  const { authChecked, isLoggedIn } = useUserStore()
  const [votes, setVotes] = useState<VoteListItem[]>(initialData?.votes ?? [])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(
    initialData ? Math.max(1, Math.ceil(initialData.totalElements / PAGE_SIZE)) : 1,
  )
  const [isLoading, setIsLoading] = useState(false)

  const fetchPage = useCallback(async (p: number) => {
    setIsLoading(true)
    try {
      const { data } = await api.get<{ output: VoteListResponse }>(
        `/votes?page=${p}&size=${PAGE_SIZE}&sortType=latest`,
      )
      setVotes(data.output.votes)
      setTotalPages(Math.max(1, Math.ceil(data.output.totalElements / PAGE_SIZE)))
      setPage(p)
    } catch {
      alertStore.show('투표 목록을 불러올 수 없습니다.', 'danger')
    } finally {
      setIsLoading(false)
    }
  }, [])

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
        <CommonPagination currentPage={page} totalPages={totalPages} onPageChange={fetchPage} />
      )}
    </div>
  )
}
