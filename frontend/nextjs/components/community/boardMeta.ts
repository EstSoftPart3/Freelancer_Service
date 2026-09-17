// 목록 테이블(BoardTable)·모바일 카드(BoardCardList)가 공유하는 표시용 메타 유틸.
import type { BoardItem } from '@/types'

// Phase2 게시판 전면 재설계(2026-09) — 대분류(게시판 종류)가 4종에서 9종으로 늘었다.
// career/tech/company/teamup/lounge는 CommunityBoardController가 처리하는 신설 5종이고,
// board/qna는 데이터를 전부 이관한 뒤 비활성화된 옛 종류(빈 껍데기, 라우트는 당분간 유지).
// 'answer'는 게시판 종류가 아니라 QnA류 상세에서 답변 카드를 그릴 때만 쓰는 표시용 값이다
// (BoardPost.tsx). 목록·라우트 축(BoardType)과 섞이지 않도록 별도 유니온으로 둔다.
export type BoardType =
  | 'board' | 'qna' | 'notice' | 'voc' | 'all'
  | 'career' | 'tech' | 'company' | 'teamup' | 'lounge'
export type BoardPostDisplayType = BoardType | 'answer'

// 답변+채택을 지원하는 게시판 종류 — 백엔드 BoardTypeCode.supportsAnswer와 짝을 이룬다.
// 이 목록에 있는 종류만 QnaDetailClient(답변 오케스트레이터)로 상세를 그린다.
export const ANSWER_SUPPORTED_TYPES: readonly BoardType[] = ['qna', 'career', 'tech']

export function supportsAnswer(boardType: BoardType): boolean {
  return ANSWER_SUPPORTED_TYPES.includes(boardType)
}

// 기술 태그를 붙일 수 있는 게시판 종류 — 백엔드 BoardTypeCode.supportsSkillTag와 짝을 이룬다.
const SKILL_TAG_SUPPORTED_TYPES: readonly BoardType[] = ['qna', 'tech']

export function supportsSkillTag(boardType: BoardType): boolean {
  return SKILL_TAG_SUPPORTED_TYPES.includes(boardType)
}

// 중분류(카테고리)를 갖는 게시판 종류 — BOARD_CATEGORY_FALLBACK에 항목이 있는 종류와 같다.
export function hasCategory(boardType: BoardType): boolean {
  return boardType in BOARD_CATEGORY_FALLBACK
}

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

export const BOARD_TYPE_LABEL: Record<Exclude<BoardType, 'all'>, string> = {
  board: '일반',
  qna: 'Q&A',
  notice: '공지',
  voc: '고객의 소리',
  career: '커리어소통',
  tech: '기술소통',
  company: '요즘회사',
  teamup: '프로젝트',
  lounge: '라운지',
}

// 목록 페이지 상단 제목 — BOARD_TYPE_LABEL(뱃지용 짧은 라벨)과 달리 페이지 타이틀이라 문구가 조금 더 길다.
export const BOARD_PAGE_TITLE: Record<BoardType, string> = {
  all: '커뮤니티 전체글',
  board: '일반 게시판',
  qna: 'QnA 게시판',
  notice: '공지사항',
  voc: '고객의 소리',
  career: '커리어소통',
  tech: '기술소통',
  company: '요즘회사',
  teamup: '프로젝트',
  lounge: '라운지(자유게시판)',
}

// 전체보기(all)에서는 항목별 boardType이 채워지고, 개별 게시판에서는 목록 타입을 그대로 쓴다.
// 고객의 소리는 전체보기(/community/boards)에 아예 포함되지 않으므로 여기서 'voc'가 나오는 것은
// /voc 목록에서 호출한 경우뿐이다.
export function resolveBoardType(item: BoardItem, listType: BoardType): Exclude<BoardType, 'all'> {
  return item.boardType ?? (listType === 'all' ? 'board' : (listType as Exclude<BoardType, 'all'>))
}

/**
 * 이 항목의 상세로 들어갈 수 있는지.
 *
 * 고객의 소리 비공개 글은 목록에 남기되(다른 사람도 문의를 남기고 있다는 것이 보여야 한다)
 * 내용은 작성자와 운영자만 본다. 서버도 상세 조회를 403으로 막지만, 링크를 눌러 에러를 보는 것보다
 * 애초에 잠긴 항목으로 그리는 편이 낫다.
 */
export function canOpenDetail(item: BoardItem, viewerSq?: number): boolean {
  if (!item.secret) return true
  return viewerSq != null && item.userSq === viewerSq
}

// ── 게시판 중분류(카테고리) ──────────────────────────────────────────────
// Phase2 재설계 이후 중분류는 공통코드 3200 그룹 아래 평평하게 있지 않고, 각 대분류 게시판
// 코드(1405 커리어소통 등)를 parent로 둔다. 목록은 GET /community/board-categories?boardType=
// 가 정본이다. 아래 상수는 응답을 기다리는 동안의 초기 렌더용 폴백일 뿐이므로, 중분류를
// 추가할 때는 이 배열이 아니라 공통코드에 넣는다.
export interface BoardCategory {
  commonCodeSq: number
  commonCodeNm: string
}

// 중분류가 있는 게시판만 키를 갖는다(요즘회사는 단일 게시판이라 중분류가 없다).
export const BOARD_CATEGORY_FALLBACK: Partial<Record<BoardType, readonly BoardCategory[]>> = {
  career: [
    { commonCodeSq: 3210, commonCodeNm: '연봉' },
    { commonCodeSq: 3211, commonCodeNm: '이직' },
  ],
  tech: [
    { commonCodeSq: 3220, commonCodeNm: '개발' },
    { commonCodeSq: 3221, commonCodeNm: 'AI' },
  ],
  teamup: [
    { commonCodeSq: 3230, commonCodeNm: '프로젝트 의뢰' },
    { commonCodeSq: 3231, commonCodeNm: '팀원모집' },
  ],
  lounge: [
    { commonCodeSq: 3240, commonCodeNm: '유머' },
    { commonCodeSq: 3241, commonCodeNm: '일상' },
  ],
}

// 카테고리별 안내. 라벨은 공통코드가 정본이지만 이 설명문은 UI 문구라 코드에 둔다.
// 코드에 없는 카테고리는 설명 없이 이름만 노출된다(추가해도 화면이 깨지지 않는다).
export const BOARD_CATEGORY_TIPS: Record<number, string> = {
  3210: '연봉, 연봉협상, 성과급, 이직 후 연봉 등을 나누는 곳입니다.',
  3211: '이직고민, 이직후기, 회사추천, 퇴사이야기 등을 나누는 곳입니다.',
  3220: '개발방법, 개발환경, 생산성, 개발도구 등을 나누는 곳입니다.',
  3221: 'AI개발, LLM, GPT, Cursor, Claude 등을 나누는 곳입니다.',
  3230: '스타트업, 소규모 턴키 등 프로젝트를 의뢰하고 싶을 때 남기는 곳입니다.',
  3231: '스터디, 협업프로젝트 등 팀원을 모집할 때 남기는 곳입니다.',
  3240: '개발자 밈, 웃긴 이야기 등 유머를 나누는 곳입니다.',
  3241: '일상 이야기, 소소한 잡담을 나누는 곳입니다.',
}

/** 중분류가 없는 게시판(요즘회사)·별도 도메인(면접후기) 안내 — commonCodeSq가 없어 위 맵과 분리한다. */
export const BOARD_INTRO_TIPS: Partial<Record<BoardType, string>> = {
  company: '회사생활, 개발문화, 워라밸, 재택근무 등 회사 이야기를 나누는 곳입니다.',
}
export const INTERVIEW_INTRO_TIP =
  '면접후기, 면접질문, 코딩테스트, 면접결과 등 면접 경험을 나누는 곳입니다.'
