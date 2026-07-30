// 카테고리·게시판유형 뱃지 — 목록(데스크톱/모바일)과 상세가 같은 모양을 쓰도록 한 곳에 모았다.
// 세 군데에 각자 클래스를 박아두면 한쪽만 고쳐져 모양이 갈라진다.
import { BOARD_TYPE_LABEL } from '@/components/community/boardMeta'

/**
 * 게시판 카테고리 뱃지.
 * 미분류(null)면 아무것도 그리지 않는다 — 카테고리 도입 전 글을 '자유'로 승격하지 않기 위함이다.
 */
export function CategoryBadge({ name }: { name?: string | null }) {
  if (!name) return null
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-xs font-medium leading-none text-primary">
      {name}
    </span>
  )
}

/**
 * 게시판 유형(일반/Q&A/공지) 뱃지.
 * 전체보기처럼 유형이 섞이는 목록에서만 쓴다 — 카테고리가 없는 Q&A 행에도 뱃지가 하나는 붙어야
 * 어떤 줄에만 뱃지가 달린 들쭉날쭉한 목록이 되지 않는다.
 */
export function BoardTypeBadge({ type }: { type: 'board' | 'qna' | 'notice' }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium leading-none text-muted-foreground">
      {BOARD_TYPE_LABEL[type]}
    </span>
  )
}
