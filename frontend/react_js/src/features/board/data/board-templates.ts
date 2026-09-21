// [Freelancer Service]
// 카테고리별 게시글 기본 양식 — BO 글쓰기 폼용.
//
// ⚠️ FO `frontend/nextjs/components/community/boardTemplates.ts` 와 내용이 같아야 한다.
// 두 앱이 별개 빌드라 코드를 공유할 수 없어 부득이하게 복제했다. 양식을 고칠 때는 반드시
// 양쪽을 함께 고칠 것 — 한쪽만 바뀌면 FO로 쓴 글과 BO로 쓴 글의 서식이 갈라진다.
//
// Quill(react-quill-new)의 clipboard.dangerouslyPasteHTML 로 주입되므로 Quill 이 다룰 수 있는
// 태그만 쓴다. <table>·<div> 는 Quill 기본 포맷이 아니어서 붙여넣는 순간 구조가 뭉개진다.

// 3203(옛 "현장정보")은 관리 대상 5종(MANAGED_BOARD_TYPES)의 새 카테고리 목록(3210대부터)엔
// 없지만, 실제 카테고리 자체는 없어지지 않았다 — 일반게시판(1401)은 예전 그대로 공통코드 3200
// 그룹 아래에 카테고리를 두고 있고 그 그룹은 여전히 활성이다(FO BoardService.activeCategoryCds
// 참고). BO는 신규 글 작성 시 1401을 고를 수 없어(LEGACY_BOARD_META는 기존 글 수정에만 쓰인다)
// 지금 당장 이 경로가 열리지는 않지만, FO(frontend/nextjs/components/community/boardTemplates.ts)
// 와 내용을 맞춘다는 이 파일의 원칙에 따라 여기도 같이 둔다.
const TEMPLATES: Record<string, string> = {
  '3203': [
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
  ].join(''),
}

/** 해당 카테고리에 기본 양식이 있으면 HTML 을, 없으면 null. */
export function templateFor(categoryCd: string | undefined): string | null {
  if (!categoryCd) return null
  return TEMPLATES[categoryCd] ?? null
}

/** 태그를 벗기면 남는 게 없는가 (Quill 의 빈 에디터는 `<p><br></p>` 다) */
export function isHtmlEmpty(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim() === ''
}

/**
 * 태그를 벗기고 공백을 눌러 정규화한 본문 텍스트.
 *
 * "주입한 양식을 사용자가 손댔는지"는 HTML 문자열끼리 비교해서는 판정할 수 없다 —
 * Quill 은 넘겨준 HTML 을 자기 방식으로 다시 써서(속성 순서·빈 태그·클래스) onChange 로
 * 돌려주므로 아무것도 건드리지 않아도 원본과 문자열이 달라진다. 눈에 보이는 텍스트로
 * 비교하면 그 정규화 차이를 흡수하면서, 양식 빈칸을 채우는 순간 텍스트가 달라져
 * "사용자가 썼다"를 정확히 잡아낸다.
 */
export function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}
