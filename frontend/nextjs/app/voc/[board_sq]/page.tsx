import type { Metadata } from 'next'
import { Suspense } from 'react'
import VocDetailClient from '@/components/community/VocDetailClient'

// 비공개 글이 섞이는 화면이라 SSR 프리페치도 JSON-LD도 두지 않는다.
// 서버 프리페치는 토큰 없이 나가 401만 받을 뿐이고, 구조화 데이터는 색인을 유도하는 신호다.
export const metadata: Metadata = { title: '고객의 소리', robots: { index: false } }

interface Props {
  params: Promise<{ board_sq: string }>
}

export default async function VocDetailPage({ params }: Props) {
  const { board_sq } = await params
  return (
    <Suspense>
      <VocDetailClient boardSq={board_sq} />
    </Suspense>
  )
}
