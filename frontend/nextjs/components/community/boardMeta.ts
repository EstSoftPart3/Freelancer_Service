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
