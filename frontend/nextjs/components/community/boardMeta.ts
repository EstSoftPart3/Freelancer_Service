// 목록 테이블(BoardTable)·모바일 카드(BoardCardList)가 공유하는 표시용 메타 유틸.
import type { BoardItem } from '@/types'

export type BoardType = 'board' | 'qna' | 'notice' | 'all'

export function fmtDate(iso: string) {
  const d = new Date(iso)
  const yy = String(d.getFullYear()).slice(-2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export const STATUS: Record<number, { label: string; cls: string }> = {
  1501: { label: '진행중', cls: 'bg-yellow-100 text-yellow-800' },
  1502: { label: '채택완료', cls: 'bg-green-100 text-green-800' },
  1503: { label: '자체해결', cls: 'bg-gray-100 text-gray-700' },
  1504: { label: '미해결', cls: 'bg-red-100 text-red-700' },
}

export const BOARD_TYPE_LABEL: Record<'board' | 'qna' | 'notice', string> = {
  board: '일반',
  qna: 'Q&A',
  notice: '공지',
}

// 전체보기(all)에서는 항목별 boardType이 채워지고, 개별 게시판에서는 목록 타입을 그대로 쓴다.
export function resolveBoardType(item: BoardItem, listType: BoardType): 'board' | 'qna' | 'notice' {
  return item.boardType ?? (listType === 'all' ? 'board' : listType)
}

// ── 게시판 카테고리 (공통코드 3200 하위) ──────────────────────────────────
// 목록은 GET /community/board-categories 가 정본이다. 아래 상수는 서버 응답을 기다리는 동안의
// 초기 렌더용 폴백일 뿐이므로, 카테고리를 추가할 때 이 배열을 고치는 것이 아니라 공통코드에 넣는다.
export interface BoardCategory {
  commonCodeSq: number
  commonCodeNm: string
}

export const BOARD_CATEGORY_FALLBACK: readonly BoardCategory[] = [
  { commonCodeSq: 3201, commonCodeNm: '자유' },
  { commonCodeSq: 3202, commonCodeNm: '일반' },
  { commonCodeSq: 3203, commonCodeNm: '현장정보' },
  { commonCodeSq: 3204, commonCodeNm: '기능요청' },
]

/** 현장정보 — 작성 폼에서 기본 양식을 주입하는 카테고리. boardTemplates 와 짝을 이룬다. */
export const CATEGORY_FIELD_INFO = 3203
