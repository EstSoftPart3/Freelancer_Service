import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'
import { buildPageMetadata } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

export const metadata: Metadata = buildPageMetadata({
  title: 'QnA 게시판',
  description: '개발 기술 질문과 답변 — 궁금한 것을 묻고 채택된 답변을 확인하세요.',
  path: '/qna',
})

export default async function QnaPage() {
  // 첫 페이지(기본 정렬)를 서버에서 조회해 초기 HTML에 목록 포함 — 크롤러가 상세 링크를 발견하는 경로
  const initial = await safeGet<BoardListResponse | null>('/qna?page=1&size=10&sortType=latest', null)
  return <Suspense><BoardListClient boardCategory="qna" initialData={initial} /></Suspense>
}
