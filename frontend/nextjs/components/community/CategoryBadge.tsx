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
export function BoardTypeBadge({ type }: { type: 'board' | 'qna' | 'notice' | 'voc' }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium leading-none text-muted-foreground">
      {BOARD_TYPE_LABEL[type]}
    </span>
  )
}

/**
 * 비공개 글 뱃지 (고객의 소리 전용).
 * 목록에 이 뱃지가 보인다는 것은 곧 "내 글이거나 내가 관리자"라는 뜻이다 —
 * 남의 비공개 글은 서버 목록 쿼리에서 아예 빠지기 때문이다.
 */
export function SecretBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium leading-none text-muted-foreground">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2.5 w-2.5">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      비공개
    </span>
  )
}
