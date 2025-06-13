package com.example.demo.domain.mypage.repository;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.mypage.dto.request.ResumeRequestDTO;
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

    public int updateResume(ResumeRequestDTO resumeRequestDTO) {
        return resumeMapper.updateResume(resumeRequestDTO);
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

    public int deleteResumeProfileImageMapping(Long fileSq) {
        return resumeMapper.deleteResumeProfileImageMapping(fileSq);
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

    public int deleteResumeAttachmentMapping(Long fileSq) {
        return resumeMapper.deleteResumeAttachmentMapping(fileSq);
    }
}
