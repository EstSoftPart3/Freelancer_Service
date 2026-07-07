import type { Metadata } from 'next'
import { Suspense } from 'react'
import QnaDetailClient from '@/components/community/QnaDetailClient'
import JsonLd from '@/components/seo/JsonLd'
import { getQnaDetail } from '@/lib/fetchers'
import { buildPageMetadata, stripHtmlToExcerpt } from '@/lib/seo'
import { discussionForumPostingJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

interface Props {
  params: Promise<{ board_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board_sq } = await params
  const qna = await getQnaDetail(board_sq)
  // 삭제/존재하지 않는 글은 색인 제외
  if (!qna) return { title: 'QnA 상세', robots: { index: false } }
  return buildPageMetadata({
    title: qna.ttl,
    description: stripHtmlToExcerpt(qna.description),
    path: `/qna/${board_sq}`,
    ogType: 'article',
    publishedTime: qna.createdAt,
  })
}

export default async function QnaDetailPage({ params }: Props) {
  const { board_sq } = await params
  // generateMetadata와 React cache()로 공유 — 실제 API 호출은 요청당 1회
  const qna = await getQnaDetail(board_sq)
  return (
    <>
      {qna && (
        <>
          {/* QAPage는 답변 본문이 상세 응답에 없어 불가 — DiscussionForumPosting 사용 (lib/jsonld.ts 참고) */}
          <JsonLd data={discussionForumPostingJsonLd(qna, `/qna/${board_sq}`)} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: 'QnA 게시판', path: '/qna' },
              { name: qna.ttl, path: `/qna/${board_sq}` },
            ])}
          />
        </>
      )}
      <Suspense>
        <QnaDetailClient boardSq={board_sq} initialData={qna} />
      </Suspense>
    </>
  )
}
