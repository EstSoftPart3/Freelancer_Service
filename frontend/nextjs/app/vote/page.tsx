import type { Metadata } from 'next'
import { safeGet } from '@/lib/fetchers'
import CategoryTabs from '@/components/community/CategoryTabs'
import VoteListClient from '@/components/vote/VoteListClient'
import type { VoteListResponse } from '@/components/vote/types'

export const metadata: Metadata = { title: '투표 | 커뮤니티' }

export default async function VotePage() {
  const initialData = await safeGet<VoteListResponse | null>('/votes?page=1&size=9&sortType=latest', null)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <CategoryTabs />
      <VoteListClient initialData={initialData} />
    </div>
  )
}
