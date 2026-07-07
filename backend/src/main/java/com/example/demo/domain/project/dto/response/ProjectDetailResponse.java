package com.example.demo.domain.project.dto.response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.demo.domain.project.dto.UserRole;
import com.example.demo.domain.project.entity.Project;
import com.example.demo.domain.project.util.DateUtil;
import com.example.demo.domain.project.util.ProjectUtil;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectDetailResponse {

    private String projectTtl;
    private String companyNm;
    private String projectDetail;
    private String companyImageUrl;

    private String interviewStartDt;
    private String interviewEndDt;
    private String projectRecruitStartDt;
    private String projectRecruitEndDt;
    private String projectStartDt;
    private String projectEndDt;

    private Integer projectViewCnt;
    private Integer projectScrapCnt;

    private String projectAddress;
    private String detailedAddress;
    private String detailedAddressDetail;
    private String subwayAddress;
    private Long addressTypeCd;
    private String salaryNegotiableYn; // 단가협의 여부도 함께 추가
    private String projectExperience;
    private String projectEducation;

    private List<GroupSkillInfoResponse> projectRequiredSkills;
    private List<GroupSkillInfoResponse> projectPreferredSkills;
    private String projectPreferredEtc;

    private String projectCreatedDt;

    private Long projectSalary;
    private String formattedSalary;
    private List<String> projectJobRole;
    private List<String> projectWorkType;

    private int isScrap;
    private int isApplied;

    private UserRole userRole;

    public static ProjectDetailResponse from(Project p, ProjectUtil util, List<GroupSkillInfoResponse> req,
            List<GroupSkillInfoResponse> prefer, String address, int hasScrapped, int hasApplied, UserRole userRole,
            String companyImageUrl, String formattedSalary) {
        Long projectSq = p.getProjectSq();
        Map<String, LocalDateTime> interviewTimes = util.fetchInterviewTimeMinMaxBySq(projectSq);
        return ProjectDetailResponse.builder()
                .projectTtl(p.getProjectTtl())
                .companyNm(util.convertCompanySqToName(p.getCompanySq()))
                .companyImageUrl(companyImageUrl)
                .projectDetail(p.getProjectDescriptionTxt())
                .interviewStartDt(DateUtil.formatLocalDate(interviewTimes.get("minTime")))
                .interviewEndDt(DateUtil.formatLocalDate(interviewTimes.get("maxTime")))
                .projectRecruitStartDt(p.getProjectRecruitStartDt().toString())
                .projectRecruitEndDt(p.getProjectRecruitEndDt().toString())
                .projectStartDt(p.getProjectStartDt().toString())
                .projectEndDt(p.getProjectEndDt().toString())

                .projectViewCnt(p.getProjectViewCnt())
                .projectScrapCnt(p.getProjectScrapCnt())

                .projectAddress(address)
                .detailedAddress(p.getDetailedAddress())
                .detailedAddressDetail(p.getDetailedAddressDetail())
                .subwayAddress(p.getSubwayAddress())
                .addressTypeCd(p.getAddressTypeCd())
                .salaryNegotiableYn(p.getProjectSalaryNegotiableYn())
                .projectExperience(util.convertCommonCodeSqToNm(p.getProjectDeveloperGradeCd()))
                .projectEducation(util.convertCommonCodeSqToNm(p.getProjectRequiredEducationCd()))

                .projectRequiredSkills(req)
                .projectPreferredSkills(prefer)
                .projectPreferredEtc(p.getProjectPreferenceTxt())

                .projectCreatedDt(p.getProjectCreatedAtDtm().toLocalDate().toString())

                .formattedSalary(formattedSalary)
                .projectSalary(p.getProjectSalary())
                .projectJobRole(util.fetchJobsByProjectSq(projectSq))
                .projectWorkType(util.fetchWorkTypesByProjectSq(projectSq))

                .isScrap(hasScrapped)
                .isApplied(hasApplied)
                .userRole(userRole)
                .build();
    }
}
