import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '프로젝트',
  description: '소규모 턴키 등 프로젝트 의뢰, 스터디·협업 팀원모집을 나누는 공간.',
  path: '/teamup',
})

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function TeamupPage({ searchParams }: Props) {
  const params = await searchParams
  const category = Number(params.category)
  const categoryQs = Number.isInteger(category) && category > 0 ? `&category=${category}` : ''

  const initial = await safeGet<BoardListResponse | null>(
    `/teamup?page=1&size=10&sortType=latest${categoryQs}`,
    null,
  )
  const titleAction = (
    <Link
      href="/projects"
      className="salary-cta group flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
    >
      프로젝트 공고 바로가기
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
  return (
    <Suspense>
      <BoardListClient boardCategory="teamup" initialData={initial} titleAction={titleAction} />
    </Suspense>
  )
}
