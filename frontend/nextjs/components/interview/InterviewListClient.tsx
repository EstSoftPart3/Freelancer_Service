'use client'
import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import CommonPagination from '@/components/community/CommonPagination'
import InterviewCard from '@/components/interview/InterviewCard'
import { InfoTooltip } from '@/components/ui/tooltip'
import { INTERVIEW_INTRO_TIP } from '@/components/community/boardMeta'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { InterviewListItem, InterviewListResponse } from '@/components/interview/types'

const PAGE_SIZE = 12

interface Props {
  initialData: InterviewListResponse | null
}

export default function InterviewListClient({ initialData }: Props) {
  const { authChecked, isLoggedIn } = useUserStore()
  const [reviews, setReviews] = useState<InterviewListItem[]>(initialData?.reviews ?? [])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(
    initialData ? Math.max(1, Math.ceil(initialData.totalElements / PAGE_SIZE)) : 1,
  )
  const [isLoading, setIsLoading] = useState(false)
  // 페이지 버튼을 연달아 누르면 먼저 보낸 느린 요청이 나중 요청보다 늦게 응답할 수 있다 —
  // 응답 순서가 아니라 "가장 마지막으로 보낸 요청"만 반영한다(BoardListClient와 같은 패턴).
  const requestSeqRef = useRef(0)

  const fetchPage = useCallback(async (p: number) => {
    const seq = ++requestSeqRef.current
    setIsLoading(true)
    try {
      const { data } = await api.get<{ output: InterviewListResponse }>(
        `/interviews?page=${p}&size=${PAGE_SIZE}&sortType=latest`,
      )
      if (seq !== requestSeqRef.current) return
      setReviews(data.output.reviews)
      setTotalPages(Math.max(1, Math.ceil(data.output.totalElements / PAGE_SIZE)))
      setPage(p)
    } catch {
      if (seq !== requestSeqRef.current) return
      alertStore.show('면접후기 목록을 불러올 수 없습니다.', 'danger')
    } finally {
      if (seq === requestSeqRef.current) setIsLoading(false)
    }
  }, [])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-1.5 text-2xl font-bold">
          면접후기
          <InfoTooltip label="면접후기 안내">{INTERVIEW_INTRO_TIP}</InfoTooltip>
        </h1>
        {authChecked && isLoggedIn() && (
          <Link
            href="/interview/write"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            면접후기 작성
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">불러오는 중...</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          아직 등록된 면접후기가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <InterviewCard key={r.interviewReviewSq} review={r} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <CommonPagination currentPage={page} totalPages={totalPages} onPageChange={fetchPage} />
      )}
    </div>
  )
}
