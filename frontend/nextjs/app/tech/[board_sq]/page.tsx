import type { Metadata } from 'next'
import { Suspense } from 'react'
import QnaDetailClient from '@/components/community/QnaDetailClient'
import JsonLd from '@/components/seo/JsonLd'
import { getCommunityBoardDetail } from '@/lib/fetchers'
import { buildPageMetadata, stripHtmlToExcerpt } from '@/lib/seo'
import { discussionForumPostingJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

interface Props {
  params: Promise<{ board_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board_sq } = await params
  const board = await getCommunityBoardDetail('tech', board_sq)
  if (!board) return { title: '게시글', robots: { index: false } }
  return buildPageMetadata({
    title: board.ttl,
    description: stripHtmlToExcerpt(board.description),
    path: `/tech/${board_sq}`,
    ogType: 'article',
    publishedTime: board.createdAt,
  })
}

export default async function TechDetailPage({ params }: Props) {
  const { board_sq } = await params
  const board = await getCommunityBoardDetail('tech', board_sq)
  return (
    <>
      {board && (
        <>
          <JsonLd data={discussionForumPostingJsonLd(board, `/tech/${board_sq}`)} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '기술소통', path: '/tech' },
              { name: board.ttl, path: `/tech/${board_sq}` },
            ])}
          />
        </>
      )}
      <Suspense>
        <QnaDetailClient boardSq={board_sq} boardType="tech" initialData={board} />
      </Suspense>
    </>
  )
}
