import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '커뮤니티 전체글',
  description: '커뮤니티 전체 게시글 — 일반 게시판과 QnA를 한 곳에서 모아보기.',
  path: '/community/list',
})

export default async function CommunityListPage() {
  // 첫 페이지(기본 정렬)를 서버에서 조회해 초기 HTML에 목록 포함 — 크롤러가 상세 링크를 발견하는 경로
  const initial = await safeGet<BoardListResponse | null>(
    '/community/boards?boardType=all&page=1&size=10&sortType=latest',
    null,
  )
  return <Suspense><BoardListClient boardCategory="all" initialData={initial} /></Suspense>
}
