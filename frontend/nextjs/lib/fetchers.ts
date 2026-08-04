// 서버 전용 공개 GET 헬퍼 — 인증 불필요한 조회를 백엔드에 직접 native fetch.
// generateMetadata·본문 SSR·JSON-LD가 같은 요청에서 같은 API를 최대 3번 부를 수 있어
// React cache()로 요청 단위 dedupe한다(요청당 실제 호출 1회).
// 실패 시 fallback을 반환해 SSR 실패가 페이지 장애로 번지지 않게 한다(클라이언트 CSR로 폴백).
import { cache } from 'react'
import type { BoardDetail, ProjectDetail } from '@/types'

// 서버 전용이므로 컨테이너 내부 주소를 우선 쓴다(공개 도메인이면 Cloudflare 를 한 바퀴 돈다).
const baseUrl =
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8080/api'

export async function safeGet<T>(path: string, fallback: T, opts?: { revalidate?: number }): Promise<T> {
  try {
    // revalidate 지정 시 fetch 캐시(ISR)를 써서 sitemap/RSS처럼 자주 불리는 라우트가 백엔드를 폭격하지 않게 한다.
    const res = await fetch(
      `${baseUrl}${path}`,
      opts?.revalidate != null ? { next: { revalidate: opts.revalidate } } : { cache: 'no-store' },
    )
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
    const data = (await res.json()) as { output: T }
    return data.output ?? fallback
  } catch (err) {
    console.error(`[server-fetch] ${path} 조회 실패`, err)
    return fallback
  }
}

export const getBoardDetail = cache((sq: string) => safeGet<BoardDetail | null>(`/board/${sq}`, null))
export const getQnaDetail = cache((sq: string) => safeGet<BoardDetail | null>(`/qna/${sq}`, null))
export const getNoticeDetail = cache((sq: string) => safeGet<BoardDetail | null>(`/notice/${sq}`, null))
export const getProjectDetail = cache((sq: string) => safeGet<ProjectDetail | null>(`/projects/${sq}/details`, null))
