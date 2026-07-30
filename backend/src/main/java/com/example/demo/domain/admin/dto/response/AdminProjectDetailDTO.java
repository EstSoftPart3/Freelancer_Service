package com.example.demo.domain.admin.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * BO 프로젝트 상세.
 *
 * <p>
 * 목록 DTO 에 본문·주소를 더한 형태다. 스킬태그·직군은 담지 않는다 —
 * BO 수정 대상이 아니고({@code AdminProjectUpdateRequestDTO} 주석 참조),
 * 조회만을 위해 N+1 쿼리를 늘릴 이유가 없다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProjectDetailDTO {

    private Long projectSq;
    private String projectTtl;

    private Long companySq;
    private String companyNm;
    private Long userSq;
    private String userId;

    private LocalDate recruitStartDt;
    private LocalDate recruitEndDt;
    private LocalDate projectStartDt;
    private LocalDate projectEndDt;
    private String recruitStatus;

    private Long projectSalary;
    private String salaryNegotiableYn;
    private String descriptionTxt;
    private String preferenceTxt;

    /** 근무지 주소. 표시 전용이며 BO 에서 수정하지 않는다(좌표·지역코드가 함께 움직여야 한다). */
    private String address;
    private String detailAddress;

    private Integer viewCnt;
    private Integer scrapCnt;
    private Integer applicationCnt;

    private String isDeletedYn;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}
