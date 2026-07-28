package com.example.demo.domain.project.entity;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import com.example.demo.domain.project.dto.request.ProjectCreateRequest;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    private Long projectSq;

    private Long companySq;

    // 상세 주소 SQ (Nullable)
    private Long addressSq;

    // 지하철 주소 SQ (Nullable)
    private Long subwayAddressSq;

    // 2701: 상세주소 우선, 2702: 지하철 우선
    private Long addressTypeCd;

    private String projectTtl;

    private String projectImageUrl;

    private Long projectDeveloperGradeCd;

    private Long projectRequiredEducationCd;

    private Long projectSalary;

    private String projectSalaryNegotiableYn;

    private LocalDate projectStartDt;

    private LocalDate projectEndDt;

    private LocalDate projectRecruitStartDt;

    private LocalDate projectRecruitEndDt;

    private String projectPreferenceTxt;

    private String projectDescriptionTxt;

    private LocalDateTime projectCreatedAtDtm;

    private LocalDateTime projectModifiedAtDtm;

    private Integer projectCandidateCnt;

    private Integer projectScrapCnt;

    private String projectIsNotificationYn;

    private String projectIsDeletedYn;

    private Integer projectViewCnt;

    // =========================================================================
    // MyBatis 조인 결과 매핑용 (DB 컬럼 아님)
    // =========================================================================
    private Double latitude;

    private Double longitude;

    private Double distance;

    private String detailedAddress; // 시/도 시/군/구

    private String detailedAddressDetail; // 사용자 입력 상세주소

    private String subwayAddress; // 지하철역 명칭/주소

    // =========================================================================
    // 비즈니스 로직 및 생성 메서드
    // =========================================================================

    /**
     * 프로젝트 생성을 위한 정적 팩토리 메서드
     */
    public static Project from(ProjectCreateRequest request, Long companySq, Long addressSq, Long subwayAddressSq,
            long devgradeCodeSq, long educationLvlSq) {

        // 우선순위 결정: 상세주소가 있으면 상세주소(2701), 없는데 지하철만 있으면 지하철(2702)
        long addressType = (addressSq != null) ? 2701L : 2702L;

        return Project.builder()
                .companySq(companySq)
                .addressSq(addressSq)
                .subwayAddressSq(subwayAddressSq)
                .addressTypeCd(addressType)
                .projectTtl(request.projectTitle())
                .projectImageUrl(request.projectImageUrl())
                .projectDeveloperGradeCd(devgradeCodeSq)
                .projectRequiredEducationCd(educationLvlSq)
                .projectSalary(request.projectSalary())
                .projectSalaryNegotiableYn(request.projectSalaryNegotiableYn())
                .projectStartDt(request.projectStartDt())
                .projectEndDt(request.projectEndDt())
                .projectRecruitStartDt(request.recruitStartDt())
                .projectRecruitEndDt(request.recruitEndDt())
                .projectDescriptionTxt(request.description())
                .projectPreferenceTxt(request.preference())
                .projectIsNotificationYn(request.isNotification())
                .build();
    }

    public void prePersist() {
        this.projectCreatedAtDtm = LocalDateTime.now();
        this.projectModifiedAtDtm = LocalDateTime.now();
        if (this.projectIsNotificationYn == null)
            this.projectIsNotificationYn = "N";
        if (this.projectIsDeletedYn == null)
            this.projectIsDeletedYn = "N";
        this.projectCandidateCnt = 0;
        this.projectScrapCnt = 0;
        this.projectViewCnt = 0;
    }

    public void preUpdate() {
        this.projectModifiedAtDtm = LocalDateTime.now();
    }

    /**
     * 기본 정보 업데이트
     */
    public void update(ProjectCreateRequest request, long devGradeCode, long educationLvlCode) {
        this.projectTtl = request.projectTitle();
        this.projectImageUrl = request.projectImageUrl();
        this.projectDeveloperGradeCd = devGradeCode;
        this.projectSalary = request.projectSalary();
        this.projectSalaryNegotiableYn = request.projectSalaryNegotiableYn();
        this.projectRequiredEducationCd = educationLvlCode;
        this.projectStartDt = request.projectStartDt();
        this.projectEndDt = request.projectEndDt();
        this.projectRecruitStartDt = request.recruitStartDt();
        this.projectRecruitEndDt = request.recruitEndDt();
        this.projectPreferenceTxt = request.preference();
        this.projectDescriptionTxt = request.description();
        this.projectIsNotificationYn = request.isNotification();
    }

    /**
     * 주소 정보 업데이트 및 우선순위 자동 재설정
     */
    public void updateAddressInfo(Long addressSq, Long subwayAddressSq) {
        this.addressSq = addressSq;
        this.subwayAddressSq = subwayAddressSq;
        // 상세주소가 새로 들어오면 2701, 상세 없고 지하철만 있으면 2702
        this.addressTypeCd = (addressSq != null) ? 2701L : 2702L;
    }

    // 도메인 기능 메서드
    public void delete() {
        this.projectIsDeletedYn = "Y";
    }

    public void increaseApplication() {
        this.projectCandidateCnt++;
    }

    public void decreaseApplication() {
        this.projectCandidateCnt--;
    }

    public void increaseViewCnt() {
        this.projectViewCnt++;
    }

    public void increaseScrap() {
        this.projectScrapCnt++;
    }

    public void decreaseScrap() {
        this.projectScrapCnt--;
    }

    public int calculateRemainingDay(LocalDate recruitEndDt) {
        return (int) ChronoUnit.DAYS.between(LocalDate.now(), recruitEndDt);
    }
}