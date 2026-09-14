// 카테고리별 게시글 기본 양식.
//
// Quill(react-quill-new)의 clipboard.dangerouslyPasteHTML로 주입되므로 Quill이 다룰 수 있는
// 태그만 쓴다 — <table>·<div>는 Quill 기본 포맷이 아니어서 붙여넣는 순간 구조가 뭉개진다.
// <p>/<strong>/<ul>/<li> 조합으로 충분하고, 사용자가 지우고 다시 쓰기도 쉽다.
//
// 이전엔 CATEGORY_FIELD_INFO(3211, 옛 "현장정보")에 현장명·위치 양식을 자동 주입했지만,
// Phase2 게시판 재설계로 3211이 "이직"(이직고민·이직후기·회사추천·퇴사이야기) 의미로 바뀌어
// 더 이상 맞지 않는다 — 삭제했다. 새 카테고리에 맞는 양식이 정해지면 여기에 추가한다.
const TEMPLATES: Record<number, string> = {}

/** 해당 카테고리에 기본 양식이 있으면 HTML을, 없으면 null. */
export function templateFor(categoryCd: number | null): string | null {
  if (categoryCd === null) return null
  return TEMPLATES[categoryCd] ?? null
}
