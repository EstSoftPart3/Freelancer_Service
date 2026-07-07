// 커뮤니티 허브(/community) 서버 컴포넌트 초기 데이터용 fetch 헬퍼.
// 선례: app/board/[board_sq]/page.tsx의 generateMetadata — 서버에서는 인증 불필요한
// 공개 GET만 native fetch로 직접 호출한다(클라이언트 상호작용은 기존 axios lib/api.ts 유지).
import type { BoardItem, BoardListResponse, CommunityBestItem } from '@/types'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api'

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${baseUrl}${path}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
    const data = (await res.json()) as { output: T }
    return data.output ?? fallback
  } catch (err) {
    console.error(`[community] ${path} 조회 실패`, err)
    return fallback
  }
}

export function fetchCommunityBest(period: 'daily' | 'weekly' | 'monthly' | 'all', size: number) {
  return safeGet<CommunityBestItem[]>(`/community/best?period=${period}&size=${size}`, [])
}

export async function fetchLatestBoards(size: number): Promise<BoardItem[]> {
  const res = await safeGet<BoardListResponse>(
    `/community/boards?boardType=all&page=1&size=${size}&sortType=latest`,
    { boards: [], totalElements: 0 },
  )
  return res.boards
}

export interface SkillTagShortcut {
  skillTagSq: number
  skillTagNm: string
}

export async function fetchSkillTagShortcuts(): Promise<SkillTagShortcut[]> {
  const list = await safeGet<{ skillTagSq: number; skillTagNm: string; skillTagLvl: number }[]>(
    '/board/skill-tags',
    [],
  )
  return list.filter((t) => t.skillTagLvl !== 1).map((t) => ({ skillTagSq: t.skillTagSq, skillTagNm: t.skillTagNm }))
}
