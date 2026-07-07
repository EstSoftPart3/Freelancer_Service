import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'

export const metadata: Metadata = { title: '커뮤니티 전체글' }

export default function CommunityListPage() {
  return <Suspense><BoardListClient boardCategory="all" /></Suspense>
}
