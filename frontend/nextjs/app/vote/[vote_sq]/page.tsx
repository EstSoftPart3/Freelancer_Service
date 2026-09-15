import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getVoteDetail } from '@/lib/fetchers'
import VoteDetailClient from '@/components/vote/VoteDetailClient'

interface Props {
  params: Promise<{ vote_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vote_sq } = await params
  // 확실히 삭제/존재하지 않는 투표만 색인 제외 — 일시적 조회 실패는 noindex 하지 않는다
  const { data: vote, confirmedMissing } = await getVoteDetail(vote_sq)
  if (!vote) return { title: '투표', robots: { index: confirmedMissing ? false : undefined } }
  return { title: `${vote.voteTtl} | 투표` }
}

export default async function VoteDetailPage({ params }: Props) {
  const { vote_sq } = await params
  // generateMetadata와 React cache()로 공유 — 실제 API 호출은 요청당 1회
  const { data: vote, confirmedMissing } = await getVoteDetail(vote_sq)
  // 확실히 없는 투표일 때만 404 — 백엔드 일시 장애 시에는 클라이언트에서 재시도한다
  if (confirmedMissing) notFound()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <VoteDetailClient voteSq={Number(vote_sq)} initialData={vote} />
      </div>
    </div>
  )
}
