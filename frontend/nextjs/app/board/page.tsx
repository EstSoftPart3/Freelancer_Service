import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '일반 게시판',
  description: '개발자 자유 게시판 — 개발, 커리어, 프리랜서 생활 이야기를 나누는 공간.',
  path: '/board',
})

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function BoardPage({ searchParams }: Props) {
  const params = await searchParams
  // 서버 fetch URL에 붙는 값이라 문자열을 그대로 흘리지 않고 정수만 통과시킨다.
  const category = Number(params.category)
  const categoryQs = Number.isInteger(category) && category > 0 ? `&category=${category}` : ''

  // 첫 페이지(기본 정렬)를 서버에서 조회해 초기 HTML에 목록 포함 — 크롤러가 상세 링크를 발견하는 경로
  const initial = await safeGet<BoardListResponse | null>(
    `/board?page=1&size=10&sortType=latest${categoryQs}`,
    null,
  )
  return <Suspense><BoardListClient boardCategory="board" initialData={initial} /></Suspense>
}
