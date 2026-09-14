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
  const { data } = await safeGetDetailed(path, fallback, opts)
  return data
}

/**
 * 상세 조회용 — 데이터 없음의 "이유"까지 함께 준다.
 *
 * 백엔드는 삭제/미존재 게시글·공고도 (컨트롤러가 던지는 IllegalArgumentException 이
 * GlobalExceptionHandler 에서 400 으로 매핑돼) HTTP 400 으로 응답한다. 이걸 네트워크 오류나
 * 5xx 와 구분하지 않고 똑같이 "없음" 취급하면, 백엔드가 일시적으로 응답 못 하는 순간에
 * generateMetadata 가 정상 게시글까지 robots noindex 로 내보낼 수 있다 — 4xx(진짜 없음/
 * 잘못된 요청)만 "확실히 없음"으로 보고, 5xx·네트워크 오류는 "일시적 실패"로 구분한다.
 */
export async function safeGetDetailed<T>(
  path: string,
  fallback: T,
  opts?: { revalidate?: number },
): Promise<{ data: T; confirmedMissing: boolean }> {
  try {
    // revalidate 지정 시 fetch 캐시(ISR)를 써서 sitemap/RSS처럼 자주 불리는 라우트가 백엔드를 폭격하지 않게 한다.
    const res = await fetch(
      `${baseUrl}${path}`,
      opts?.revalidate != null ? { next: { revalidate: opts.revalidate } } : { cache: 'no-store' },
    )
    if (res.status >= 400 && res.status < 500) return { data: fallback, confirmedMissing: true }
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
    const data = (await res.json()) as { output: T }
    return { data: data.output ?? fallback, confirmedMissing: false }
  } catch (err) {
    console.error(`[server-fetch] ${path} 조회 실패`, err)
    return { data: fallback, confirmedMissing: false }
  }
}

// generateMetadata 와 페이지 본문이 React cache() 로 같은 요청 안에서 dedupe 되도록,
// 자원마다 이 detailed 버전 하나만 두고 본문 쪽은 .data 만 꺼내 쓴다(별도 wrapper 를
// 또 두면 같은 자원을 캐시 키가 달라 두 번 fetch 하게 된다).
export const getBoardDetail = cache((sq: string) => safeGetDetailed<BoardDetail | null>(`/board/${sq}`, null))
export const getQnaDetail = cache((sq: string) => safeGetDetailed<BoardDetail | null>(`/qna/${sq}`, null))
export const getNoticeDetail = cache((sq: string) => safeGetDetailed<BoardDetail | null>(`/notice/${sq}`, null))
export const getProjectDetail = cache((sq: string) =>
  safeGetDetailed<ProjectDetail | null>(`/projects/${sq}/details`, null))
