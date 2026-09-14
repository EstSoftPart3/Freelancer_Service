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
  const board = await getCommunityBoardDetail('lounge', board_sq)
  if (!board) return { title: '게시글', robots: { index: false } }
  return buildPageMetadata({
    title: board.ttl,
    description: stripHtmlToExcerpt(board.description),
    path: `/lounge/${board_sq}`,
    ogType: 'article',
    publishedTime: board.createdAt,
  })
}

export default async function LoungeDetailPage({ params }: Props) {
  const { board_sq } = await params
  const board = await getCommunityBoardDetail('lounge', board_sq)
  return (
    <>
      {board && (
        <>
          <JsonLd data={articleJsonLd(board, `/lounge/${board_sq}`)} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '라운지', path: '/lounge' },
              { name: board.ttl, path: `/lounge/${board_sq}` },
            ])}
          />
        </>
      )}
      <BoardDetailClient boardSq={board_sq} boardCategory="lounge" initialData={board} />
    </>
  )
}
