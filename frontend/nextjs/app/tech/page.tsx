import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '기술소통',
  description: '개발·AI 등 기술 이야기와 질문·답변을 나누는 공간.',
  path: '/tech',
})

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function TechPage({ searchParams }: Props) {
  const params = await searchParams
  const category = Number(params.category)
  const categoryQs = Number.isInteger(category) && category > 0 ? `&category=${category}` : ''

  const initial = await safeGet<BoardListResponse | null>(
    `/tech?page=1&size=10&sortType=latest${categoryQs}`,
    null,
  )
  return <Suspense><BoardListClient boardCategory="tech" initialData={initial} /></Suspense>
}
