// 카테고리별 게시글 기본 양식.
//
// Quill(react-quill-new)의 clipboard.dangerouslyPasteHTML로 주입되므로 Quill이 다룰 수 있는
// 태그만 쓴다 — <table>·<div>는 Quill 기본 포맷이 아니어서 붙여넣는 순간 구조가 뭉개진다.
// <p>/<strong>/<ul>/<li> 조합으로 충분하고, 사용자가 지우고 다시 쓰기도 쉽다.
//
// 3203(옛 "현장정보")은 BOARD_CATEGORY_FALLBACK(클라이언트 초기 렌더용 폴백 상수)에서는
// 빠졌지만, 실제 카테고리 자체는 없어지지 않았다 — 일반게시판(board, 1401)은 새 게시판
// 종류처럼 자기 코드를 parent로 카테고리를 새로 두지 않고 예전 그대로 공통코드 3200 그룹
// 아래에 남아 있고(BoardService.activeCategoryCds 참고), 그 그룹은 여전히 활성이라
// GET /community/board-categories?boardType=board 가 3203을 그대로 내려준다.
// 그래서 이 카테고리는 지금도 /board/register에서 선택 가능하고, 여기서 양식을 지워버리면
// "현장정보"를 고른 사용자만 조용히 자동 양식을 잃는다.
const FIELD_INFO_TEMPLATE = [
  '<p><strong>■ 현장명</strong></p>',
  '<p><br></p>',
  '<p><strong>■ 위치</strong></p>',
  '<p><br></p>',
  '<p><strong>■ 공정 · 업무</strong></p>',
  '<p><br></p>',
  '<p><strong>■ 근무 조건</strong></p>',
  '<ul><li>기간 : </li><li>근무 시간 : </li><li>단가 · 급여 : </li></ul>',
  '<p><strong>■ 참고 사항</strong></p>',
  '<p><br></p>',
].join('')

const CATEGORY_FIELD_INFO = 3203

const TEMPLATES: Record<number, string> = {
  [CATEGORY_FIELD_INFO]: FIELD_INFO_TEMPLATE,
}

/** 해당 카테고리에 기본 양식이 있으면 HTML을, 없으면 null. */
export function templateFor(categoryCd: number | null): string | null {
  if (categoryCd === null) return null
  return TEMPLATES[categoryCd] ?? null
}
