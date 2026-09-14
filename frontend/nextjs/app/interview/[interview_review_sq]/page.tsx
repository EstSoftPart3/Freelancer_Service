import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getInterviewReviewDetail } from '@/lib/fetchers'
import InterviewDetailClient from '@/components/interview/InterviewDetailClient'

interface Props {
  params: Promise<{ interview_review_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { interview_review_sq } = await params
  const review = await getInterviewReviewDetail(interview_review_sq)
  return { title: review ? `${review.companyNm} 면접후기 | 면접후기` : '면접후기' }
}

export default async function InterviewDetailPage({ params }: Props) {
  const { interview_review_sq } = await params
  const review = await getInterviewReviewDetail(interview_review_sq)
  if (!review) notFound()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <InterviewDetailClient interviewReviewSq={Number(interview_review_sq)} initialData={review} />
      </div>
    </div>
  )
}
