import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'

export const metadata: Metadata = { title: 'QnA 게시판' }

export default function QnaPage() {
  return <Suspense><BoardListClient boardCategory="qna" /></Suspense>
}
