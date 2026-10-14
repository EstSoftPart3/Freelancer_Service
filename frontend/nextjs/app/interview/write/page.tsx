import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import InterviewWriteForm from '@/components/interview/InterviewWriteForm'
import { InfoTooltip } from '@/components/ui/tooltip'
import { INTERVIEW_DISCLAIMER, INTERVIEW_INTRO_TIP } from '@/components/community/boardMeta'

export const metadata: Metadata = { title: '면접후기 작성', robots: { index: false } }

export default function InterviewWritePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 flex items-center gap-1.5 text-2xl font-bold">
        면접후기 작성
        <InfoTooltip label="면접후기 안내">{INTERVIEW_INTRO_TIP}</InfoTooltip>
      </h1>
      <p className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0" />
        {INTERVIEW_DISCLAIMER}
      </p>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <InterviewWriteForm />
      </div>
    </div>
  )
}
