import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '요즘회사',
  description: '요즘 다니는 회사, 재직 후기, 사내 분위기 이야기를 나누는 공간.',
  path: '/company',
})

export default async function CompanyPage() {
  const initial = await safeGet<BoardListResponse | null>('/company?page=1&size=10&sortType=latest', null)
  return <Suspense><BoardListClient boardCategory="company" initialData={initial} /></Suspense>
}
