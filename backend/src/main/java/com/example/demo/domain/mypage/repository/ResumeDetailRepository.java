package com.example.demo.domain.mypage.repository;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.mypage.dto.request.ResumeDetailViewRequestDTO;
import com.example.demo.domain.mypage.dto.response.ResumeDetailResponseDTO;
import com.example.demo.domain.mypage.mapper.ResumeDetailMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ResumeDetailRepository {

    private final ResumeDetailMapper mapper;

    public ResumeDetailResponseDTO getResumeBasic(Long resumeSq) {
        return mapper.selectResumeBasic(resumeSq);
    }

    public ResumeDetailResponseDTO.AddressDTO getAddress(Long resumeSq) {
        return mapper.selectAddressByResumeSq(resumeSq);
    }

    public List<ResumeDetailResponseDTO.EducationDTO> getEducationList(Long resumeSq) {
        return mapper.selectEducationList(resumeSq);
    }

    public List<ResumeDetailResponseDTO.CareerDTO> getCareerList(Long resumeSq) {
        return mapper.selectCareerList(resumeSq);
    }

    public List<ResumeDetailResponseDTO.ProjectDTO> getProjectList(Long resumeSq) {
        return mapper.selectProjectList(resumeSq);
    }

    public List<String> getSkillTagNamesByProjectHistorySq(Long projectHistorySq) {
        return mapper.selectSkillTagNamesByProjectHistorySq(projectHistorySq);
    }

    public List<String> getSkillTagNamesByResumeSq(Long resumeSq) {
        return mapper.selectSkillTagNamesByResumeSq(resumeSq);
    }

    public List<ResumeDetailResponseDTO.CertificationDTO> getCertificationList(Long resumeSq) {
        return mapper.selectCertificationList(resumeSq);
    }

    public List<ResumeDetailResponseDTO.TrainingDTO> getTrainingList(Long resumeSq) {
        return mapper.selectTrainingList(resumeSq);
    }

    public List<Map<String, Object>> getAttachmentList(Long resumeSq) {
        return mapper.selectAttachmentList(resumeSq);
    }

    public String findCommonCodeName(Long codeSq) {
        return mapper.selectCommonCodeName(codeSq);
    }

    public List<Map<String, Object>> selectGroupedSkillTagsByProjectHistorySq(Long projectHistorySq) {
        return mapper.selectGroupedSkillTagsByProjectHistorySq(projectHistorySq);
    }

    public String getResumePhotoSaveName(Long resumeSq) {
        return mapper.selectResumePhotoSaveName(resumeSq);
    }

    public void updateReadApplicationDtmIfNull(Long resumeSq, Long projectSq, Long applicationSq) {
        mapper.updateReadApplicationDtmIfNull(resumeSq, projectSq, applicationSq);
    }

    // 링크
    public List<ResumeDetailResponseDTO.LinkDTO> getLinkList(Long resumeSq) {
        return mapper.selectLinkList(resumeSq);
    }
}
