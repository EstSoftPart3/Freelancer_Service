import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata, SITE_NAME } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: '공지사항',
  description: `${SITE_NAME} 서비스 공지사항과 업데이트 소식.`,
  path: '/notice',
})

export default async function NoticePage() {
  // 첫 페이지(기본 정렬)를 서버에서 조회해 초기 HTML에 목록 포함 — 크롤러가 상세 링크를 발견하는 경로
  const initial = await safeGet<BoardListResponse | null>('/notice?page=1&size=10&sortType=latest', null)
  return <Suspense><BoardListClient boardCategory="notice" initialData={initial} /></Suspense>
}
