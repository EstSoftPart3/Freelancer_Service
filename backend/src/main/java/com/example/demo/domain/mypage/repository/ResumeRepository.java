package com.example.demo.domain.mypage.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.mypage.dto.ParentSkillTagDTO;
import com.example.demo.domain.mypage.dto.ProjectHistoryTypeCodeDTO;
import com.example.demo.domain.mypage.dto.request.ResumeRequestDTO;
import com.example.demo.domain.mypage.dto.response.CertificateResponseDTO;
import com.example.demo.domain.mypage.mapper.ResumeMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ResumeRepository {

    private final ResumeMapper resumeMapper;

    // 주소
    public int insertAddress(ResumeRequestDTO.AddressDTO addressDTO) {
        return resumeMapper.insertAddress(addressDTO);
    }

    public int updateAddressByAddressSq(ResumeRequestDTO.AddressDTO addressDTO) {
        return resumeMapper.updateAddressByAddressSq(addressDTO);
    }

    public Long selectAddressSqByResumeSq(Long resumeSq) {
        return resumeMapper.selectAddressSqByResumeSq(resumeSq);
    }

    // 이력서 (userSq 별도 전달)
    public int insertResume(Long userSq, ResumeRequestDTO resumeRequestDTO) {
        return resumeMapper.insertResume(userSq, resumeRequestDTO);
    }

    public int updateResume(Long userSq, ResumeRequestDTO resumeRequestDTO) {
        return resumeMapper.updateResume(userSq, resumeRequestDTO);
    }

    // 학력
    public int insertEducation(ResumeRequestDTO.EducationDTO educationDTO) {
        return resumeMapper.insertEducation(educationDTO);
    }

    public int deleteEducation(Long educationSq) {
        return resumeMapper.deleteEducation(educationSq);
    }

    // 경력
    public int insertCareer(ResumeRequestDTO.CareerDTO careerDTO) {
        return resumeMapper.insertCareer(careerDTO);
    }

    public int deleteCareer(Long careerSq) {
        return resumeMapper.deleteCareer(careerSq);
    }

    // 프로젝트 이력
    public int insertProjectHistory(ResumeRequestDTO.ProjectHistoryDTO projectHistoryDTO) {
        return resumeMapper.insertProjectHistory(projectHistoryDTO);
    }

    public int deleteProjectHistory(Long projectHistorySq) {
        return resumeMapper.deleteProjectHistory(projectHistorySq);
    }

    // 프로젝트 이력 기술 태그
    public int insertProjectHistorySkillTag(ResumeRequestDTO.ProjectHistorySkillTagDTO projectHistorySkillTagDTO) {
        return resumeMapper.insertProjectHistorySkillTag(projectHistorySkillTagDTO);
    }

    public int deleteProjectHistorySkillTag(Long projectHistorySkillSq) {
        return resumeMapper.deleteProjectHistorySkillTag(projectHistorySkillSq);
    }

    public List<ProjectHistoryTypeCodeDTO> getRoleTypes() {
        return resumeMapper.selectProjectRoleTypeCodes();
    }

    public List<ProjectHistoryTypeCodeDTO> getTaskTypes() {
        return resumeMapper.selectProjectTaskTypeCodes();
    }

    // 자격증
    public int insertCertification(ResumeRequestDTO.CertificationDTO certificationDTO) {
        return resumeMapper.insertCertification(certificationDTO);
    }

    public int deleteCertification(Long certificationSq) {
        return resumeMapper.deleteCertification(certificationSq);
    }

    // 교육 이력
    public int insertTrainingHistory(ResumeRequestDTO.TrainingHistoryDTO trainingHistoryDTO) {
        return resumeMapper.insertTrainingHistory(trainingHistoryDTO);
    }

    public int deleteTrainingHistory(Long trainingSq) {
        return resumeMapper.deleteTrainingHistory(trainingSq);
    }

    // 보유 기술 태그
    public int insertResumeSkillTag(ResumeRequestDTO.SkillTagDTO skillTagDTO) {
        return resumeMapper.insertResumeSkillTag(skillTagDTO);
    }

    public int deleteResumeSkillTag(Long resumeSkillSq) {
        return resumeMapper.deleteResumeSkillTag(resumeSkillSq);
    }

    // 프로필 이미지 (파일)
    public int insertProfileImage(ResumeRequestDTO.ResumeFileDTO profileImage) {
        return resumeMapper.insertProfileImage(profileImage);
    }

    public int deleteProfileImage(Long fileSq) {
        return resumeMapper.deleteProfileImage(fileSq);
    }

    // 이력서 - 프로필 이미지 매핑
    public int insertResumeProfileImageMapping(Long resumeSq, Long fileSq) {
        return resumeMapper.insertResumeProfileImageMapping(resumeSq, fileSq);
    }

    public int deleteResumeProfileImageMapping(Long resumeSq, Long fileSq) {
        return resumeMapper.deleteResumeProfileImageMapping(resumeSq, fileSq);
    }

    public int countFileUsageInProfileImage(Long fileSq) {
        return resumeMapper.countFileUsageInProfileImage(fileSq);
    }

    public int countFileUsageInProfileImageExceptResume(Long fileSq, Long resumeSq) {
        return resumeMapper.countFileUsageInProfileImageExceptResume(fileSq, resumeSq);
    }

    // 첨부파일 (파일)
    public int insertAttachmentFile(ResumeRequestDTO.ResumeFileDTO attachmentFileDTO) {
        return resumeMapper.insertAttachmentFile(attachmentFileDTO);
    }

    public int deleteAttachmentFile(Long fileSq) {
        return resumeMapper.deleteAttachmentFile(fileSq);
    }

    // 이력서-첨부파일 매핑
    public int insertResumeAttachmentMapping(Long resumeSq, Long fileSq) {
        return resumeMapper.insertResumeAttachmentMapping(resumeSq, fileSq);
    }

    public int deleteResumeAttachmentMapping(Long resumeSq, Long fileSq) {
        return resumeMapper.deleteResumeAttachmentMapping(resumeSq, fileSq);
    }

    public int countFileUsageInAttachment(Long fileSq) {
        return resumeMapper.countFileUsageInAttachment(fileSq);
    }

    public int countFileUsageInAttachmentExceptResume(Long fileSq, Long resumeSq) {
        return resumeMapper.countFileUsageInAttachmentExceptResume(fileSq, resumeSq);
    }

    // 자격증

    public List<CertificateResponseDTO> findCertificatesByName(String searchNm, int size, int offset) {
        return resumeMapper.selectCertificatesByName(searchNm, size, offset);
    }

    public int countCertificatesByName(String searchNm) {
        return resumeMapper.countCertificatesByName(searchNm);
    }
    
    // 링크 등록
    public int insertResumeLink(Long resumeSq, String linkUrl) {
    	return resumeMapper.insertResumeLink(resumeSq, linkUrl);
    }
    
    // 링크 조회
    public List<String> selectResumeLinkList(Long resumeSq) {
        return resumeMapper.selectResumeLinkList(resumeSq);
    }
    
    // 링크 수정
    public int updateResumeLink(Long resumeSq, String linkUrl) {
    	return resumeMapper.updateResumeLink(resumeSq, linkUrl);
    }
    // 링크 삭제
    public int deleteResumeLinkByResumeSq(Long resumeSq) {
        return resumeMapper.deleteResumeLinkByResumeSq(resumeSq);
    }

    // 수정용 불러오기
    public ResumeRequestDTO findByResumeSq(Long resumeSq) {
        return resumeMapper.selectResumeByResumeSq(resumeSq);
    }

    public ResumeRequestDTO.AddressDTO findAddressByAddressSq(Long addressSq) {
        return resumeMapper.selectAddressByAddressSq(addressSq);
    }

    public List<ResumeRequestDTO.EducationDTO> findEducationList(Long resumeSq) {
        return resumeMapper.selectEducationListByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.CareerDTO> findCareerList(Long resumeSq) {
        return resumeMapper.selectCareerListByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.ProjectHistoryDTO> findProjectHistoryList(Long resumeSq) {
        return resumeMapper.selectProjectHistoryListByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.ProjectHistorySkillTagDTO> findProjectHistorySkillTagList(Long projectHistorySq) {
        return resumeMapper.selectProjectHistorySkillTagListByProjectHistorySq(projectHistorySq);
    }

    public List<ResumeRequestDTO.CertificationDTO> findCertificationList(Long resumeSq) {
        return resumeMapper.selectCertificationListByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.TrainingHistoryDTO> findTrainingHistoryList(Long resumeSq) {
        return resumeMapper.selectTrainingHistoryListByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.SkillTagDTO> findSkillTagList(Long resumeSq) {
        return resumeMapper.selectSkillTagListByResumeSq(resumeSq);
    }

    public ResumeRequestDTO.ResumeFileDTO findProfileImage(Long resumeSq) {
        return resumeMapper.selectProfileImageByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.ResumeFileDTO> findAttachmentList(Long resumeSq) {
        return resumeMapper.selectAttachmentListByResumeSq(resumeSq);
    }

    public List<ParentSkillTagDTO> getParentSkillTags() {
        return resumeMapper.selectParentSkillTags();
    }

    public List<ResumeRequestDTO.EducationDTO> selectEducationListForUpdateByResumeSq(Long resumeSq) {
        return resumeMapper.selectEducationListForUpdateByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.CareerDTO> selectCareerListForUpdateByResumeSq(Long resumeSq) {
        return resumeMapper.selectCareerListForUpdateByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.ProjectHistoryDTO> selectProjectHistoryListForUpdateByResumeSq(Long resumeSq) {
        return resumeMapper.selectProjectHistoryListForUpdateByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.ProjectHistorySkillTagDTO> selectProjectHistorySkillTagListForUpdateByProjectHistorySq(
            Long projectHistorySq) {
        return resumeMapper.selectProjectHistorySkillTagListForUpdateByProjectHistorySq(projectHistorySq);
    }

    public List<ResumeRequestDTO.CertificationDTO> selectCertificationListForUpdateByResumeSq(Long resumeSq) {
        return resumeMapper.selectCertificationListForUpdateByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.TrainingHistoryDTO> selectTrainingHistoryListForUpdateByResumeSq(Long resumeSq) {
        return resumeMapper.selectTrainingHistoryListForUpdateByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.SkillTagDTO> selectResumeSkillTagListForUpdateByResumeSq(Long resumeSq) {
        return resumeMapper.selectResumeSkillTagListForUpdateByResumeSq(resumeSq);
    }

    public List<ResumeRequestDTO.ResumeFileDTO> selectAttachmentListForUpdateByResumeSq(Long resumeSq) {
        return resumeMapper.selectAttachmentListForUpdateByResumeSq(resumeSq);
    }

    public ResumeRequestDTO.ResumeFileDTO selectProfileImageForUpdateByResumeSq(Long resumeSq) {
        return resumeMapper.selectProfileImageForUpdateByResumeSq(resumeSq);
    }
}
