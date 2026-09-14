import type { Metadata } from 'next'
import InterviewWriteForm from '@/components/interview/InterviewWriteForm'
import { InfoTooltip } from '@/components/ui/tooltip'
import { INTERVIEW_INTRO_TIP } from '@/components/community/boardMeta'

export const metadata: Metadata = { title: '면접후기 작성', robots: { index: false } }

export default function InterviewWritePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-1.5 text-2xl font-bold">
        면접후기 작성
        <InfoTooltip label="면접후기 안내">{INTERVIEW_INTRO_TIP}</InfoTooltip>
      </h1>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <InterviewWriteForm />
      </div>
    </div>
  )
}
