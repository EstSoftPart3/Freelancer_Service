import type { Metadata } from 'next'
import VoteCreateForm from '@/components/vote/VoteCreateForm'

export const metadata: Metadata = { title: '투표 만들기', robots: { index: false } }

export default function VoteRegisterPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">투표 만들기</h1>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <VoteCreateForm />
      </div>
    </div>
  )
}
