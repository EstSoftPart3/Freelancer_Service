package com.example.demo.domain.admin.constant;

/**
 * BO 게시물 관리 목록 전용 <b>의사(pseudo) 유형 코드</b>.
 *
 * <p>
 * BO 목록은 게시글({@code TBL_BOARD_M})과 답변({@code TBL_BOARD_ANSWER_S})을 UNION ALL 로
 * 합쳐 하나의 표로 보여준다. 그런데 답변 테이블에는 {@code board_type_cd} 컬럼이 없다.
 * UNION 은 컬럼 자리를 맞춰야 하고, 그 자리는 단순 표시용이 아니라 <b>유형 필터·정렬·상세 라우팅의
 * 단일 키</b>다({@code AND boardTypeCd IN (...)}, {@code ORDER BY boardTypeCd},
 * 상세/수정 API 의 {@code boardTypeCd} 파라미터). NULL 을 넣으면 필터에서 '답변'을 고를 수 없다.
 * 그래서 답변에도 유형값을 하나 부여했다.
 * </p>
 *
 * <p>
 * <b>과거 사고:</b> 이 자리에 원래 {@code 1404} 가 박혀 있었다. 당시 1400번대 뒷번호가 비어 있어
 * 안전해 보였지만, Phase 1 에서 공통코드 {@code 1404 = 고객의소리(VOC)} 를 실제로 등록하면서
 * 이름공간이 충돌했다 — VOC 글이 BO 목록에 '답변'으로 표시된다. 같은 사고가 반복되지 않도록
 * <b>1490 이상은 의사코드 전용 구간으로 예약</b>하고, 공통코드 1400 하위 자식은 1490 미만만 쓴다.
 * </p>
 *
 * <p>
 * 이 값들은 <b>{@code TBL_COMMON_CODE_C} 에 존재하지 않는다.</b> 화면 밖으로 나가는 저장값이
 * 아니라 목록 API 응답 안에서만 의미를 갖는다.
 * </p>
 */
public final class AdminBoardPseudoType {

    /** 답변(Answer) 행. 게시글이 아니라 {@code TBL_BOARD_ANSWER_S} 를 가리킨다. */
    public static final Long ANSWER = 1499L;

    /** 댓글/대댓글 행. 신고 관리 목록({@code AdminReportMapper})에서만 쓴다. */
    public static final Long COMMENT = 1498L;

    private AdminBoardPseudoType() {
    }
}
