// 공통코드 3250(IT) / 3251(일반) — parent 1410(투표_카테고리). FO(components/vote/types.ts)와
// 값이 동일해야 한다 — 백엔드 VoteService.VALID_CATEGORY_CODES 가 이 두 코드만 허용한다.
export const VOTE_CATEGORIES = [
  { code: 3250, label: 'IT' },
  { code: 3251, label: '일반' },
] as const

export function voteCategoryLabel(code?: number | null): string {
  return VOTE_CATEGORIES.find((c) => c.code === code)?.label ?? '-'
}
