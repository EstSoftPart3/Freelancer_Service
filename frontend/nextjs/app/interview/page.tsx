import type { Metadata } from 'next'
import { safeGet } from '@/lib/fetchers'
import InterviewListClient from '@/components/interview/InterviewListClient'
import type { InterviewListResponse } from '@/components/interview/types'

export const metadata: Metadata = { title: '면접후기 | 커뮤니티' }

export default async function InterviewPage() {
  const initialData = await safeGet<InterviewListResponse | null>(
    '/interviews?page=1&size=12&sortType=latest',
    null,
  )

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <InterviewListClient initialData={initialData} />
    </div>
  )
}
