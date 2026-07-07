import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { safeGet } from '@/lib/fetchers'
import type { BoardListResponse } from '@/types'

// 1시간 캐시 — 매 크롤러 요청마다 백엔드 전체 목록을 순회하지 않도록.
export const revalidate = 3600

const PAGE_SIZE = 500
// 폭주 방지 상한: 5만 URL(sitemap 프로토콜 한도) 근접 시 generateSitemaps() 분할로 전환할 것.
const MAX_PAGES = 100

interface ProjectSitemapItem {
  projectSq: number
  projectCreatedDt?: string
}

interface ProjectListOutput {
  totalCount?: number
  totalElements?: number
  projects?: ProjectSitemapItem[]
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

// 페이지네이션 목록 API를 끝까지 순회. 실패 페이지는 safeGet이 빈 목록으로 폴백하므로
// sitemap 생성 자체는 API 장애에도 500이 나지 않는다(그 회차엔 일부 URL 누락만).
async function fetchAllPages<T>(
  buildPath: (page: number) => string,
  extract: (output: BoardListResponse) => { items: T[]; total: number },
): Promise<T[]> {
  const acc: T[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const output = await safeGet<BoardListResponse>(
      buildPath(page),
      { boards: [], totalElements: 0 },
      { revalidate },
    )
    const { items, total } = extract(output)
    acc.push(...items)
    if (page * PAGE_SIZE >= total || items.length === 0) break
  }
  return acc
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/affiliation`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/community`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/community/list`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/board`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/qna`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/notice`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  // 게시글(board+qna 통합)·공지·프로젝트 상세 URL — 순차 조회 대신 병렬
  const [boards, notices, projects] = await Promise.all([
    fetchAllPages(
      (p) => `/community/boards?boardType=all&page=${p}&size=${PAGE_SIZE}&sortType=latest`,
      (o) => ({ items: o.boards ?? [], total: o.totalElements ?? 0 }),
    ),
    fetchAllPages(
      (p) => `/notice?page=${p}&size=${PAGE_SIZE}&sortType=latest`,
      (o) => ({ items: o.boards ?? [], total: o.totalElements ?? 0 }),
    ),
    (async () => {
      const acc: ProjectSitemapItem[] = []
      for (let page = 1; page <= MAX_PAGES; page++) {
        const output = await safeGet<ProjectListOutput>(
          `/projects?page=${page}&size=${PAGE_SIZE}`,
          {},
          { revalidate },
        )
        const items = output.projects ?? []
        acc.push(...items)
        const total = output.totalCount ?? output.totalElements ?? 0
        if (page * PAGE_SIZE >= total || items.length === 0) break
      }
      return acc
    })(),
  ])

  const boardRoutes: MetadataRoute.Sitemap = boards.map((b) => ({
    // 통합 목록의 boardType으로 상세 경로 분기 ('board' | 'qna')
    url: `${SITE_URL}/${b.boardType === 'qna' ? 'qna' : 'board'}/${b.sq}`,
    lastModified: toDate(b.createdAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const noticeRoutes: MetadataRoute.Sitemap = notices.map((n) => ({
    url: `${SITE_URL}/notice/${n.sq}`,
    lastModified: toDate(n.createdAt),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  // 프로젝트 상세는 비로그인 대표 경로인 /projects/user/만 수록 (company 뷰는 canonical로 통일)
  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/user/${p.projectSq}`,
    lastModified: toDate(p.projectCreatedDt),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticRoutes, ...projectRoutes, ...boardRoutes, ...noticeRoutes]
}
