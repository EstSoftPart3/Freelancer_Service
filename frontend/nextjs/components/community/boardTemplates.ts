// 카테고리별 게시글 기본 양식.
//
// Quill(react-quill-new)의 clipboard.dangerouslyPasteHTML로 주입되므로 Quill이 다룰 수 있는
// 태그만 쓴다 — <table>·<div>는 Quill 기본 포맷이 아니어서 붙여넣는 순간 구조가 뭉개진다.
// <p>/<strong>/<ul>/<li> 조합으로 충분하고, 사용자가 지우고 다시 쓰기도 쉽다.
import { CATEGORY_FIELD_INFO } from '@/components/community/boardMeta'

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

const TEMPLATES: Record<number, string> = {
  [CATEGORY_FIELD_INFO]: FIELD_INFO_TEMPLATE,
}

/** 해당 카테고리에 기본 양식이 있으면 HTML을, 없으면 null. */
export function templateFor(categoryCd: number | null): string | null {
  if (categoryCd === null) return null
  return TEMPLATES[categoryCd] ?? null
}
