import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoardListClient from '@/components/community/BoardListClient'

// 로그인 전용 화면이라 색인 대상이 아니다. 다른 게시판과 달리 서버에서 첫 페이지를
// 미리 조회하지 않는다 — safeGet 은 토큰 없이 호출하므로 여기서는 401만 받고,
// 무엇보다 SSR 캐시에 남의 비공개 글이 섞여 들어갈 여지를 만들지 않기 위해서다.
export const metadata: Metadata = { title: '고객의 소리', robots: { index: false } }

export default function VocPage() {
  return (
    <Suspense>
      <BoardListClient boardCategory="voc" />
    </Suspense>
  )
}
