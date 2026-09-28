import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getInterviewReviewDetail } from '@/lib/fetchers'
import InterviewDetailClient from '@/components/interview/InterviewDetailClient'

interface Props {
  params: Promise<{ interview_review_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { interview_review_sq } = await params
  // 확실히 삭제/존재하지 않는 면접후기만 색인 제외 — 일시적 조회 실패는 noindex 하지 않는다
  const { data: review, confirmedMissing } = await getInterviewReviewDetail(interview_review_sq)
  if (!review) return { title: '면접후기', robots: { index: confirmedMissing ? false : undefined } }
  return { title: `${review.companyNm} 면접후기 | 면접후기` }
}

export default async function InterviewDetailPage({ params }: Props) {
  const { interview_review_sq } = await params
  // generateMetadata와 React cache()로 공유 — 실제 API 호출은 요청당 1회
  const { data: review, confirmedMissing } = await getInterviewReviewDetail(interview_review_sq)
  // 확실히 없는 후기일 때만 404 — 백엔드 일시 장애 시에는 클라이언트에서 재시도한다
  if (confirmedMissing) notFound()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <InterviewDetailClient interviewReviewSq={Number(interview_review_sq)} initialData={review} />
      </div>
    </div>
  )
}
