const STORAGE_KEY = 'seed:recent-batches'
const MAX_BATCHES = 20

export interface SeedBatch {
  /** 브라우저 안에서 배치를 구분하는 값. 등록 시각을 그대로 쓴다. */
  executedAt: string
  boardSqs: number[]
  boards: number
  answers: number
  comments: number
}

/**
 * 등록 회차 기록.
 *
 * <b>왜 브라우저에 두는가</b> — 회수를 "방금 넣은 것만" 으로 좁히려면 등록된 게시글 번호가
 * 필요한데, 그걸 DB 에 남기려면 컬럼이나 테이블이 하나 더 필요하다(공용 DB 스키마 변경은
 * 승인이 필요한 무거운 절차다). 번호만 브라우저가 들고 있으면 스키마를 건드리지 않아도 된다.
 *
 * 기록이 사라져도 광역 회수(봇 계정 전체)라는 최후 수단이 남아 있으므로 안전하다.
 *
 * <b>작성일시로는 대신할 수 없다</b> — 시드는 작성일시를 과거로 흩뿌리기 때문에
 * "오늘 넣은 것" 을 기간으로 골라낼 수 없다.
 */
export function loadBatches(): SeedBatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SeedBatch[]) : []
  } catch {
    return []
  }
}

export function saveBatch(batch: SeedBatch): SeedBatch[] {
  const next = [batch, ...loadBatches()].slice(0, MAX_BATCHES)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 저장 실패해도 등록 자체는 끝난 상태다. 광역 회수로 되돌릴 수 있다.
  }
  return next
}

export function removeBatch(executedAt: string): SeedBatch[] {
  const next = loadBatches().filter((b) => b.executedAt !== executedAt)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 무시 — 목록 표시용일 뿐이다
  }
  return next
}
