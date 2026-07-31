package com.example.demo.domain.admin.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * BO 프로젝트 수정 요청.
 *
 * <p>
 * <b>수정 범위를 일부러 좁혔다.</b> 주소·기술태그·모집직군은 담지 않는다 — 주소는 좌표와 지역코드가
 * 함께 움직여야 하고(지도 검색·거리 계산이 그 값을 쓴다), 태그·직군은 별도 테이블이라 하나만 바꾸면
 * 검색 필터에서 사라지는 공고가 생긴다. 그쪽은 등록자가 FO 에서 고치는 것이 안전하다.
 * 여기서는 <b>운영자가 실제로 손댈 일이 있는 값</b>(제목·급여·기간·설명)만 받는다.
 * </p>
 *
 * <p>
 * 모든 필드가 선택이다. null 인 필드는 기존 값을 유지한다(매퍼의 {@code <set>} 이 처리).
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class AdminProjectUpdateRequestDTO {

    private String projectTtl;

    /**
     * 단가. <b>0을 허용한다</b> — "금액 미정, 협의로 정함"을 표현하는 값이라
     * 목록에서도 0은 금액이 아니라 '협의'로 표시된다. 0을 막으면 협의 전용 공고를 만들 수 없다.
     * (음수만 거른다.)
     */
    @PositiveOrZero(message = "단가는 0 이상이어야 합니다.")
    private Long projectSalary;

    /** 'Y'/'N'. 협의 가능이면 단가가 비어 있어도 된다. */
    private String salaryNegotiableYn;

    private LocalDate recruitStartDt;
    private LocalDate recruitEndDt;
    private LocalDate projectStartDt;
    private LocalDate projectEndDt;

    private String descriptionTxt;
    private String preferenceTxt;
}
