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

// 3202 '일반'은 제외했다 — 게시판 이름이 "일반 게시판"이라 "일반 게시판의 일반 카테고리"가
// 무슨 뜻인지 설명할 수 없었다. 공통코드에서도 비활성 처리했으므로 서버 응답에도 오지 않는다.
export const BOARD_CATEGORY_FALLBACK: readonly BoardCategory[] = [
  { commonCodeSq: 3201, commonCodeNm: '자유' },
  { commonCodeSq: 3203, commonCodeNm: '현장정보' },
  { commonCodeSq: 3204, commonCodeNm: '기능요청' },
  { commonCodeSq: 3205, commonCodeNm: '정보' },
]

/** 현장정보 — 작성 폼에서 기본 양식을 주입하는 카테고리. boardTemplates 와 짝을 이룬다. */
export const CATEGORY_FIELD_INFO = 3203

// 카테고리별 안내. 라벨은 공통코드가 정본이지만 이 설명문은 UI 문구라 코드에 둔다.
// 코드에 없는 카테고리는 설명 없이 이름만 노출된다(추가해도 화면이 깨지지 않는다).
export const BOARD_CATEGORY_TIPS: Record<number, string> = {
  3201: '주제 제한 없는 이야기. 잡담·후기·질문 아닌 공유 글이 여기 옵니다.',
  3203: '일하는 현장 정보 공유. 선택하면 현장명·위치·근무 조건 양식이 자동으로 채워집니다.',
  3204: '이 서비스에 필요한 기능이나 개선 아이디어. 불편한 점 신고는 고객의 소리를 이용해주세요.',
  3205: '칼럼·업계 소식·참고 자료 공유. 읽을거리를 남기는 곳입니다.',
}
