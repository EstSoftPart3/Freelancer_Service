package com.example.demo.domain.mypage.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.entity.CommonSkillTag;
import com.example.demo.domain.mypage.dto.ProjectHistoryTypeCodeDTO;
import com.example.demo.domain.mypage.dto.request.ResumeRequestDTO;
import com.example.demo.domain.mypage.dto.response.ResumeListResponse;
import com.example.demo.domain.mypage.vo.ResumeVo;
import com.example.demo.domain.project.vo.ResumeNmTtlVo;
import com.example.demo.domain.project.vo.ResumeSummaryVo;

@Mapper
public interface ResumeMapper {

	// 주소
	int insertAddress(ResumeRequestDTO.AddressDTO addressDTO);

	Long selectAddressSqByResumeSq(Long resumeSq);

	int updateAddressByAddressSq(ResumeRequestDTO.AddressDTO addressDTO);

	// 이력서 (userSq를 별도 전달)
	int insertResume(@Param("userSq") Long userSq, @Param("dto") ResumeRequestDTO resumeRequestDTO);

	int updateResume(ResumeRequestDTO resumeRequestDTO);

	// 학력
	int insertEducation(ResumeRequestDTO.EducationDTO educationDTO);

	int deleteEducation(Long educationSq);

	// 경력
	int insertCareer(ResumeRequestDTO.CareerDTO careerDTO);

	int deleteCareer(Long careerSq);

	// 프로젝트 이력
	int insertProjectHistory(ResumeRequestDTO.ProjectHistoryDTO projectHistoryDTO);

	int deleteProjectHistory(Long projectHistorySq);

	// 프로젝트 이력 기술 태그
	int insertProjectHistorySkillTag(ResumeRequestDTO.ProjectHistorySkillTagDTO projectHistorySkillTagDTO);

	int deleteProjectHistorySkillTag(Long projectHistorySkillSq);

	// 자격증
	int insertCertification(ResumeRequestDTO.CertificationDTO certificationDTO);

	int deleteCertification(Long certificationSq);

	// 교육 이력
	int insertTrainingHistory(ResumeRequestDTO.TrainingHistoryDTO trainingHistoryDTO);

	int deleteTrainingHistory(Long trainingSq);

	// 보유 기술 태그
	int insertResumeSkillTag(ResumeRequestDTO.SkillTagDTO skillTagDTO);

	int deleteResumeSkillTag(Long resumeSkillSq);

	// 프로필 이미지 (파일)
	int insertProfileImage(ResumeRequestDTO.ResumeFileDTO profileImage);

	int deleteProfileImage(Long fileSq);

	// 이력서 - 프로필 이미지 매핑
	int insertResumeProfileImageMapping(@Param("resumeSq") Long resumeSq, @Param("fileSq") Long fileSq);

	int deleteResumeProfileImageMapping(@Param("fileSq") Long fileSq);

	// 첨부파일 (파일)
	int insertAttachmentFile(ResumeRequestDTO.ResumeFileDTO attachmentFileDTO);

	int deleteAttachmentFile(Long fileSq);

	// 이력서-첨부파일 매핑
	int insertResumeAttachmentMapping(@Param("resumeSq") Long resumeSq, @Param("fileSq") Long fileSq);

	int deleteResumeAttachmentMapping(@Param("fileSq") Long fileSq);

	// 기타 조회 및 업데이트 메서드들 (생략 가능)

	public ResumeSummaryVo findLatestResumeBySq(Long resumeSq);

	public ResumeSummaryVo findRepResumeNmTtlByUserSq(Long userSq);

	public List<Long> findResumesByUserSq(Long userSq);

	public Long findRepResumeByUserSq(Long userSq);

	public Long findLatestResumeSqByUserSq(Long userSq);

	Long selectAreaCodeBySigunguAndParent(Map<String, Object> params);

	List<ResumeListResponse> selectAllResumes(@Param("userSq") Long userSq);

	void updateAllRepresentativeN(@Param("userSq") Long userSq);

	void updateRepresentativeY(@Param("resumeSq") Long resumeSq);

	void updateDeleteYn(@Param("resumeSq") Long resumeSq);

	public List<ResumeVo> findResumeVoByUserSq(@Param("userSq") Long userSq);

	public ResumeNmTtlVo findResumeNmTtlBySq(@Param("resumeSq") Long resumeSq);

	public Long findUserByResumeSq(@Param("resumeSq") Long resumeSq);

	// 전체 태그
	List<CommonSkillTag> findParentSkillTags();

	List<CommonSkillTag> findAll(@Param("skillTags") List<CommonSkillTag> skillTags);

	// 프로젝트 업무단,역할 불러오기
	List<ProjectHistoryTypeCodeDTO> selectProjectRoleTypeCodes();

	List<ProjectHistoryTypeCodeDTO> selectProjectTaskTypeCodes();

}
