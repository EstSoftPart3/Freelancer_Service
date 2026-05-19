import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'

export const metadata: Metadata = { title: '일반 게시판' }

export default function BoardPage() {
  return <Suspense><BoardListClient boardCategory="board" /></Suspense>
}
