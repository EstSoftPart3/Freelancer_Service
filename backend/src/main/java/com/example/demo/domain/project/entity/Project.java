package com.example.demo.domain.project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.apache.logging.log4j.status.StatusConsoleListener;
import org.hibernate.annotations.DynamicUpdate;

import com.example.demo.domain.project.dto.request.ProjectCreateRequest;

@Entity
@Table(name = "TBL_PROJECT_M")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicUpdate
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_sq")
    private Long projectSq;

    @Column(name = "company_sq", nullable = false)
    private Long companySq;

    @Column(name = "address_sq", nullable = false)
    private Long addressSq;

    @Column(name = "project_ttl", nullable = false, length = 50)
    private String projectTtl;

    @Column(name = "project_image_url", length = 255)
    private String projectImageUrl;

    @Column(name = "project_developer_grade_cd")
    private Long projectDeveloperGradeCd;

    @Column(name = "project_required_education_cd")
    private Long projectRequiredEducationCd;

    @Column(name = "project_salary", nullable = false)
    private Long projectSalary;

    @Column(name = "project_start_dt")
    private LocalDate projectStartDt;

    @Column(name = "project_end_dt")
    private LocalDate projectEndDt;

    @Column(name = "project_recruit_start_dt")
    private LocalDate projectRecruitStartDt;

    @Column(name = "project_recruit_end_dt")
    private LocalDate projectRecruitEndDt;

    @Column(name = "project_preference_txt", length = 255)
    private String projectPreferenceTxt;

    @Column(name = "project_description_txt", columnDefinition = "TEXT")
    private String projectDescriptionTxt;

    @Column(name = "project_created_at_dtm", nullable = false, updatable = false)
    private LocalDateTime projectCreatedAtDtm;

    @Column(name = "project_modified_at_dtm", nullable = false)
    private LocalDateTime projectModifiedAtDtm;

    @Column(name = "project_candidate_cnt")
    private Integer projectCandidateCnt;

    @Column(name = "project_scrap_cnt")
    private Integer projectScrapCnt;

    @Column(name = "project_is_notification_yn", length = 1)
    private String projectIsNotificationYn;

    @Column(name = "project_is_deleted_yn", length = 1)
    private String projectIsDeletedYn;

    @Column(name = "project_view_cnt")
    private Integer projectViewCnt;

    // 인턴 수정: project_activate_yn 필드 추가
    // 사유: 프로젝트 활성화/비활성화 상태 관리 기능 구현 (임시 중단, 관리자 검토 등에 활용)
    @Column(name = "project_activate_yn", length = 1)
    private String projectActivateYn;

    public static Project from(ProjectCreateRequest request,  Long companySq, long addressSq, long devgradeCodeSq, long educationLvlSq) {
    	return Project.builder()
    			.companySq(companySq)
				.addressSq(addressSq)
				.projectTtl(request.projectTitle())
				.projectImageUrl(request.projectImageUrl())
				.projectDeveloperGradeCd(devgradeCodeSq)
				.projectRequiredEducationCd(educationLvlSq)
				.projectSalary(request.projectSalary())
				.projectStartDt(request.projectStartDt())
				.projectEndDt(request.projectEndDt())
				.projectRecruitStartDt(request.recruitStartDt())
				.projectRecruitEndDt(request.recruitEndDt())
				.projectDescriptionTxt(request.description())
				.projectPreferenceTxt(request.preference())
				.projectIsNotificationYn(request.isNotification())
				.build();
    }
    
    @PrePersist
    public void prePersist() {
        this.projectCreatedAtDtm = LocalDateTime.now();
        this.projectModifiedAtDtm = LocalDateTime.now();
        if (this.projectIsNotificationYn == null) this.projectIsNotificationYn = "N";
        if (this.projectIsDeletedYn == null) this.projectIsDeletedYn = "N";
        // 인턴 수정: 프로젝트 활성화 상태 기본값 설정, 사유: 신규 프로젝트는 기본적으로 활성화 상태로 생성
        if (this.projectActivateYn == null) this.projectActivateYn = "Y";
        this.projectCandidateCnt = 0;
        this.projectScrapCnt = 0;
        this.projectViewCnt = 0;
    }

    @PreUpdate
    public void preUpdate() {
        this.projectModifiedAtDtm = LocalDateTime.now();
    }
    
    public void update(ProjectCreateRequest request, long devGradeCode, long educationLvlCode) {
    	this.projectTtl = request.projectTitle();
    	this.projectImageUrl = request.projectImageUrl();
    	this.projectDeveloperGradeCd = devGradeCode;
    	this.projectSalary = request.projectSalary();
    	this.projectRequiredEducationCd = educationLvlCode;
    	this.projectStartDt = request.projectStartDt();
    	this.projectEndDt = request.projectEndDt();
    	this.projectRecruitStartDt = request.recruitStartDt();
    	this.projectRecruitEndDt = request.recruitEndDt();
    	this.projectPreferenceTxt = request.preference();
    	this.projectDescriptionTxt = request.description();
    	this.projectIsNotificationYn = request.isNotification();
    }
    
    public void updateAddress(long addressSq) {
    	this.addressSq = addressSq;
    }
    
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
    
    public int calcaulateRemainingDay(LocalDate recruitEndDt) {
		return (int) ChronoUnit.DAYS.between(LocalDate.now(), recruitEndDt);
	}
    
}
