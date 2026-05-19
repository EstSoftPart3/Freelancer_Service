import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'

export const metadata: Metadata = { title: '공지사항' }

export default function NoticePage() {
  return <Suspense><BoardListClient boardCategory="notice" /></Suspense>
}
