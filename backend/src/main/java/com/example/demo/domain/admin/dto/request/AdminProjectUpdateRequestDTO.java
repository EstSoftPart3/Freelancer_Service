package com.example.demo.domain.admin.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Positive;
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

    @Positive(message = "단가는 0보다 커야 합니다.")
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
