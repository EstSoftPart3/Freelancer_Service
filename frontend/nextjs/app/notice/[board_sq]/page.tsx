import type { Metadata } from 'next'
import BoardDetailClient from '@/components/community/BoardDetailClient'
import JsonLd from '@/components/seo/JsonLd'
import { getNoticeDetail } from '@/lib/fetchers'
import { buildPageMetadata, stripHtmlToExcerpt } from '@/lib/seo'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

interface Props {
  params: Promise<{ board_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board_sq } = await params
  const notice = await getNoticeDetail(board_sq)
  // 삭제/존재하지 않는 글은 색인 제외
  if (!notice) return { title: '공지사항', robots: { index: false } }
  return buildPageMetadata({
    title: notice.ttl,
    description: stripHtmlToExcerpt(notice.description),
    path: `/notice/${board_sq}`,
    ogType: 'article',
    publishedTime: notice.createdAt,
  })
}

export default async function NoticeDetailPage({ params }: Props) {
  const { board_sq } = await params
  // generateMetadata와 React cache()로 공유 — 실제 API 호출은 요청당 1회
  const notice = await getNoticeDetail(board_sq)
  return (
    <>
      {notice && (
        <>
          <JsonLd data={articleJsonLd(notice, `/notice/${board_sq}`)} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '공지사항', path: '/notice' },
              { name: notice.ttl, path: `/notice/${board_sq}` },
            ])}
          />
        </>
      )}
      <BoardDetailClient boardSq={board_sq} boardCategory="notice" initialData={notice} />
    </>
  )
}
