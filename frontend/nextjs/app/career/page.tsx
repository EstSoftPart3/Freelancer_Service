import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '커리어소통',
  description: '연봉·이직·면접 등 커리어 이야기를 나누는 공간.',
  path: '/career',
})

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function CareerPage({ searchParams }: Props) {
  const params = await searchParams
  const category = Number(params.category)
  const categoryQs = Number.isInteger(category) && category > 0 ? `&category=${category}` : ''

  const initial = await safeGet<BoardListResponse | null>(
    `/career?page=1&size=10&sortType=latest${categoryQs}`,
    null,
  )
  return <Suspense><BoardListClient boardCategory="career" initialData={initial} /></Suspense>
}
