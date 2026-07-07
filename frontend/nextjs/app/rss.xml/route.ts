// 커뮤니티 최신 게시글 RSS 2.0 피드 — 네이버 서치어드바이저 RSS 제출용(사이트맵 보완, 신규 글 수집 가속).
import { safeGet } from '@/lib/fetchers'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo'
import type { BoardListResponse } from '@/types'

export const revalidate = 600

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const res = await safeGet<BoardListResponse>(
    '/community/boards?boardType=all&page=1&size=50&sortType=latest',
    { boards: [], totalElements: 0 },
    { revalidate },
  )

  const items = res.boards
    .map((b) => {
      const link = `${SITE_URL}/${b.boardType === 'qna' ? 'qna' : 'board'}/${b.sq}`
      const pubDate = new Date(b.createdAt)
      return [
        '<item>',
        `<title>${escapeXml(b.ttl)}</title>`,
        `<link>${link}</link>`,
        `<guid isPermaLink="true">${link}</guid>`,
        `<description>${escapeXml(b.ttl)}</description>`,
        Number.isNaN(pubDate.getTime()) ? '' : `<pubDate>${pubDate.toUTCString()}</pubDate>`,
        '</item>',
      ].join('')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(SITE_NAME)} 커뮤니티</title>
<link>${SITE_URL}/community</link>
<description>${escapeXml(SITE_DESCRIPTION)} — 커뮤니티 최신 글</description>
<language>ko</language>
${items}
</channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
