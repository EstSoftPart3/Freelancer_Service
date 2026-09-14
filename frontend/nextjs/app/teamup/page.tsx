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
  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 pt-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/30 px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          프로젝트 공고 보러가기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <Suspense><BoardListClient boardCategory="teamup" initialData={initial} /></Suspense>
    </>
  )
}
