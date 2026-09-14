import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getVoteDetail } from '@/lib/fetchers'
import VoteDetailClient from '@/components/vote/VoteDetailClient'

interface Props {
  params: Promise<{ vote_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vote_sq } = await params
  const vote = await getVoteDetail(vote_sq)
  return { title: vote ? `${vote.voteTtl} | 투표` : '투표' }
}

export default async function VoteDetailPage({ params }: Props) {
  const { vote_sq } = await params
  const vote = await getVoteDetail(vote_sq)
  if (!vote) notFound()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <VoteDetailClient voteSq={Number(vote_sq)} initialData={vote} />
      </div>
    </div>
  )
}
