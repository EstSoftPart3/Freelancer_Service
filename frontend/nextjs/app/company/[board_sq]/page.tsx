import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import BoardDetailClient from '@/components/community/BoardDetailClient'
import { getCommunityBoardDetail } from '@/lib/fetchers'
import { buildPageMetadata, stripHtmlToExcerpt } from '@/lib/seo'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

interface Props {
  params: Promise<{ board_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board_sq } = await params
  // 확실히 삭제/존재하지 않는 글만 색인 제외 — 일시적 조회 실패는 noindex 하지 않는다
  const { data: board, confirmedMissing } = await getCommunityBoardDetail('company', board_sq)
  if (!board) return { title: '게시글', robots: { index: confirmedMissing ? false : undefined } }
  return buildPageMetadata({
    title: board.ttl,
    description: stripHtmlToExcerpt(board.description),
    path: `/company/${board_sq}`,
    ogType: 'article',
    publishedTime: board.createdAt,
  })
}

export default async function CompanyDetailPage({ params }: Props) {
  const { board_sq } = await params
  // generateMetadata와 React cache()로 공유 — 실제 API 호출은 요청당 1회
  const { data: board } = await getCommunityBoardDetail('company', board_sq)
  return (
    <>
      {board && (
        <>
          <JsonLd data={articleJsonLd(board, `/company/${board_sq}`)} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '요즘회사', path: '/company' },
              { name: board.ttl, path: `/company/${board_sq}` },
            ])}
          />
        </>
      )}
      <BoardDetailClient boardSq={board_sq} boardCategory="company" initialData={board} />
    </>
  )
}
