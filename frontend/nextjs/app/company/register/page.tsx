import type { Metadata } from 'next'
import BoardPostForm from '@/components/community/BoardPostForm'
import { InfoTooltip } from '@/components/ui/tooltip'
import { BOARD_INTRO_TIPS } from '@/components/community/boardMeta'

export const metadata: Metadata = { title: '요즘회사 등록', robots: { index: false } }

export default function CompanyRegisterPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-1.5 text-2xl font-bold">
        요즘회사 등록
        <InfoTooltip label="요즘회사 안내">{BOARD_INTRO_TIPS.company}</InfoTooltip>
      </h1>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <BoardPostForm boardCategory="company" />
      </div>
    </div>
  )
}
