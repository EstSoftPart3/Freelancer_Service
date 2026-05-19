import type { Metadata } from 'next'
import BoardPostForm from '@/components/community/BoardPostForm'

export const metadata: Metadata = { title: '게시글 등록' }

export default function BoardRegisterPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">게시글 등록</h1>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <BoardPostForm boardCategory="board" />
      </div>
    </div>
  )
}
