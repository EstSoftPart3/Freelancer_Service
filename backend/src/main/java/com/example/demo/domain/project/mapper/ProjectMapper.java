package com.example.demo.domain.project.mapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.example.demo.domain.project.entity.ProjectApplicationEntity;
import com.example.demo.domain.project.vo.ProjectReminderVo;
import com.example.demo.domain.project.vo.ProjectSearchResultWithDistance;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.company.dto.request.BaseRequest;
import com.example.demo.domain.project.dto.PopularProjectDTO;
import com.example.demo.domain.project.dto.request.CompanyFilterRequest;
import com.example.demo.domain.project.dto.request.ContractInsertRequest;
import com.example.demo.domain.project.dto.request.JobInsertRequest;
import com.example.demo.domain.project.dto.request.ProjectSearchRequest;
import com.example.demo.domain.project.dto.request.ScrapInsertRequest;
import com.example.demo.domain.project.dto.request.SkillInsertRequest;
import com.example.demo.domain.project.dto.response.InterviewTimeInfoResponse;
import com.example.demo.domain.project.dto.response.ProjectFormDataResponse;
import com.example.demo.domain.project.dto.response.ProjectRecruitStatus;
import com.example.demo.domain.project.dto.response.SingleSkillInfoResponse;
import com.example.demo.domain.project.entity.Project;
import com.example.demo.domain.project.vo.ProjectSearchResultWithDistance; 


@Mapper
public interface ProjectMapper {
	List<Project> findProjectsBySearch(ProjectSearchRequest request);
	List<ProjectSearchResultWithDistance> findProjectsBySearchWithDistance(@Param("request") ProjectSearchRequest request, @Param("userLongitude") Double userLongitude, @Param("userLatitude") Double userLatitude); 
	List<Project> findProjectsByCompany(@Param("companySq") Long companySq, @Param("request") CompanyFilterRequest request);
	SkillInsertRequest findSkillTagInfoByName(@Param("name") String name);
	long findCompanySqFromProjectSq(long projectSq);

	List<SingleSkillInfoResponse> findSkillFormList();
	List<SingleSkillInfoResponse> findSkillInfoList();
	List<SingleSkillInfoResponse> findReqSkillsByProjectSq(@Param("projectSq") Long projectSq);
	List<SingleSkillInfoResponse> findPreferSkillsByProjectSq(@Param("projectSq") Long projectSq);
	List<String> findWorkTypesByProjectSq(@Param("projectSq") Long projectSq);
	List<String> findJobsByProjectSq(@Param("projectSq") Long projectSq);
	Map<String, LocalDateTime> findInterviewTimeMinMaxBySq(@Param("projectSq") Long projectSq);
	Long countProjectsBySearch(ProjectSearchRequest request);
	Long countCompanyProjectsBySearch(@Param("request") BaseRequest request, @Param("companySq") Long companySq);
	List<LocalDateTime> findInterviewTimesByProjectSq(@Param("projectSq") Long projectSq);

	List<LocalDateTime> findAllInterviewTimesByProjectSq(@Param("projectSq") Long projectSq);
	
	List<InterviewTimeInfoResponse> findInterviewSqTmByProjectSq (Long projectSq);
	Project findBySq(@Param("projectSq") Long projectSq);
	Long findAddressSqByProjectSq(@Param("projectSq") Long projectSq);
	
	String judgeProjectRecruitStatus(@Param("projectSq") Long projectSq);
	ProjectRecruitStatus countCompanyProjectsByStatus(@Param("request") CompanyFilterRequest request, @Param("companySq") Long companySq);
	Long findProjectScrapCnt(@Param("projectSq") Long projectSq);
	
	List<PopularProjectDTO> findTop5ByViewCount();
	List<PopularProjectDTO> findTop5ByScrapCount();
	List<PopularProjectDTO> findTop5ByApplicantCount();
	List<Map<String, Object>> findReqSkillsByProjectSqs(List<Long> projectSq);

	void insertProject(Project project);
	void insertProjectApplication(ProjectApplicationEntity entity);
	void insertContracts(@Param("projectSq") Long projectSq, @Param("contractTypes") List<ContractInsertRequest> contractTypes);
	void insertJobs(@Param("projectSq") Long projectSq, @Param("recruitJobs") List<JobInsertRequest> recruitJobs);
	void insertSkills(@Param("projectSq") Long projectSq, @Param("skills") List<SkillInsertRequest> skills);
	void insertPreferSkills(@Param("projectSq") Long projectSq, @Param("preferSkills") List<SkillInsertRequest> preferSkills);
	void insertInterviewTimes(@Param("projectSq") Long projectSq, @Param("interviewTimes") List<LocalDateTime> interviewTimes);
	void insertScrap(ScrapInsertRequest scrapInsertRequest);
	void increaseApplication(@Param("projectSq")  Long projectSq);
	void decreaseApplication(@Param("projectSq")  Long projectSq);
	void increaseScrap(@Param("projectSq")  Long projectSq);
	void decreaseScrap(@Param("projectSq")  Long projectSq);
	
	void deleteProjectScrap(@Param("projectSq") Long projectSq, @Param("userSq") Long userSq);
	void deleteProjectContracts(@Param("projectSq") Long projectSq);
	void deleteProjectJobRoles(@Param("projectSq") Long projectSq);
	void deleteProjectInterviewTimes(@Param("projectSq") Long projectSq);
	void deleteProjectAddress(@Param("addressSq") Long addressSq);

	void updateViewCnt(@Param("projectSq") Long projectSq);
	void updateProject(Project project);
	void updateAddress(@Param("projectSq") Long projectSq, @Param("newAddressSq") Long newAddressSq);
	void softDeleteProject(@Param("projectSq") Long projectSq);
	
	List<ProjectReminderVo> findScrapUsersForEndingProjects();
	
	Long selectProjectScrapForUpdate(@Param("projectSq") Long projectSq, @Param("userSq") Long userSq);
}
