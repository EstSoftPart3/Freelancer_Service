import type { Metadata } from 'next'
import BoardDetailClient from '@/components/community/BoardDetailClient'
import JsonLd from '@/components/seo/JsonLd'
import { getBoardDetail } from '@/lib/fetchers'
import { buildPageMetadata, stripHtmlToExcerpt } from '@/lib/seo'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

interface Props {
  params: Promise<{ board_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board_sq } = await params
  const board = await getBoardDetail(board_sq)
  // 삭제/존재하지 않는 글은 색인 제외
  if (!board) return { title: '게시글', robots: { index: false } }
  return buildPageMetadata({
    title: board.ttl,
    description: stripHtmlToExcerpt(board.description),
    path: `/board/${board_sq}`,
    ogType: 'article',
    publishedTime: board.createdAt,
  })
}

export default async function BoardDetailPage({ params }: Props) {
  const { board_sq } = await params
  // generateMetadata와 React cache()로 공유 — 실제 API 호출은 요청당 1회
  const board = await getBoardDetail(board_sq)
  return (
    <>
      {board && (
        <>
          <JsonLd data={articleJsonLd(board, `/board/${board_sq}`)} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '일반 게시판', path: '/board' },
              { name: board.ttl, path: `/board/${board_sq}` },
            ])}
          />
        </>
      )}
      <BoardDetailClient boardSq={board_sq} boardCategory="board" initialData={board} />
    </>
  )
}
