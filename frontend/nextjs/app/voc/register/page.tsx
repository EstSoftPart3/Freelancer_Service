import type { Metadata } from 'next'
import BoardPostForm from '@/components/community/BoardPostForm'

// 로그인 필요한 작성 폼 — 색인 불필요 (robots.txt disallow와 이중 방어)
export const metadata: Metadata = { title: '고객의 소리 등록', robots: { index: false } }

export default function VocRegisterPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">고객의 소리 등록</h1>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <BoardPostForm boardCategory="voc" />
      </div>
    </div>
  )
}
