// BO 게시물/신고 관리가 공유하는 콘텐츠 유형 코드.
//
// 1401·1402·1403 은 실제 공통코드(부모 1400)지만, ANSWER/COMMENT 는 공통코드가 아니라
// BO 목록 전용 의사코드다 — 목록이 게시글과 답변을 UNION 으로 합치는데 답변 테이블에는
// board_type_cd 컬럼이 없어서, 유형 필터·정렬·상세 라우팅이 쓸 값을 서버가 만들어 내려준다.
// 백엔드 짝: backend/.../domain/admin/constant/AdminBoardPseudoType.java
//
// 의사코드는 1490 이상 예약 구간을 쓴다. 과거 답변=1404 였다가 공통코드 1404(고객의소리)와
// 충돌해 VOC 글이 '답변'으로 표시되는 사고가 있었다. 공통코드 1400 하위는 1490 미만만 쓴다.

/** 답변(TBL_BOARD_ANSWER_S) 행을 가리키는 의사 유형 코드 */
export const ANSWER_TYPE_CD = 1499

/** 댓글/대댓글 행을 가리키는 의사 유형 코드 (신고 관리 전용) */
export const COMMENT_TYPE_CD = 1498

/** 목록 뱃지 라벨·색상. 신고 관리 목록도 같은 축을 쓴다. */
export const BOARD_TYPE_BADGE: Record<
  number,
  { label: string; color: string }
> = {
  1401: { label: '일반', color: 'bg-blue-500 hover:bg-blue-600' },
  1402: { label: 'Q&A', color: 'bg-orange-500 hover:bg-orange-600' },
  1403: { label: '공지', color: 'bg-purple-500 hover:bg-purple-600' },
  1404: { label: '고객의 소리', color: 'bg-rose-500 hover:bg-rose-600' },
  // Phase2 게시판 재설계(2026-09) 신설 5종. 백엔드 짝: BoardTypeCode.
  1405: { label: '커리어소통', color: 'bg-cyan-600 hover:bg-cyan-700' },
  1406: { label: '기술소통', color: 'bg-indigo-600 hover:bg-indigo-700' },
  1407: { label: '요즘회사', color: 'bg-amber-600 hover:bg-amber-700' },
  1408: { label: '프로젝트', color: 'bg-teal-600 hover:bg-teal-700' },
  1409: { label: '라운지', color: 'bg-pink-600 hover:bg-pink-700' },
  [ANSWER_TYPE_CD]: { label: '답변', color: 'bg-green-600 hover:bg-green-700' },
  [COMMENT_TYPE_CD]: {
    label: '댓글',
    color: 'bg-slate-500 hover:bg-slate-600',
  },
}

// BO 목록 유형 필터·작성 폼이 쓰는 게시판 유형 목록. NORMAL(1401)·QNA(1402)는
// Phase2 재설계로 데이터가 전부 이관된 빈 껍데기라 제외한다(BoardTypeCode 주석 참고).
export const MANAGED_BOARD_TYPES = [
  { code: 1405, label: '커리어소통', path: 'career', hasCategory: true, supportsSkillTag: false, supportsAnswer: true },
  { code: 1406, label: '기술소통', path: 'tech', hasCategory: true, supportsSkillTag: true, supportsAnswer: true },
  { code: 1407, label: '요즘회사', path: 'company', hasCategory: false, supportsSkillTag: false, supportsAnswer: false },
  { code: 1408, label: '프로젝트', path: 'teamup', hasCategory: true, supportsSkillTag: false, supportsAnswer: false },
  { code: 1409, label: '라운지', path: 'lounge', hasCategory: true, supportsSkillTag: false, supportsAnswer: false },
] as const

/** 답변/채택을 지원하는 게시판 유형 코드 — 백엔드 BoardTypeCode.answerSupportedCodes()와 짝을 이룬다. */
export const ANSWER_SUPPORTED_TYPE_CDS: readonly number[] = [
  1402,
  ...MANAGED_BOARD_TYPES.filter((t) => t.supportsAnswer).map((t) => t.code),
]
