import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '라운지',
  description: '말머리·잡담 등 주제 제한 없는 자유로운 이야기를 나누는 공간.',
  path: '/lounge',
})

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function LoungePage({ searchParams }: Props) {
  const params = await searchParams
  const category = Number(params.category)
  const categoryQs = Number.isInteger(category) && category > 0 ? `&category=${category}` : ''

  const initial = await safeGet<BoardListResponse | null>(
    `/lounge?page=1&size=10&sortType=latest${categoryQs}`,
    null,
  )
  return <Suspense><BoardListClient boardCategory="lounge" initialData={initial} /></Suspense>
}
