package com.example.demo.domain.mypage.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.mypage.dto.request.ResumeDetailViewRequestDTO;
import com.example.demo.domain.mypage.dto.response.ResumeDetailResponseDTO;

@Mapper
public interface ResumeDetailMapper {

    ResumeDetailResponseDTO selectResumeBasic(@Param("resumeSq") Long resumeSq);

    ResumeDetailResponseDTO.AddressDTO selectAddressByResumeSq(@Param("resumeSq") Long resumeSq);

    List<ResumeDetailResponseDTO.EducationDTO> selectEducationList(@Param("resumeSq") Long resumeSq);

    List<ResumeDetailResponseDTO.CareerDTO> selectCareerList(@Param("resumeSq") Long resumeSq);

    List<ResumeDetailResponseDTO.ProjectDTO> selectProjectList(@Param("resumeSq") Long resumeSq);

    List<String> selectSkillTagNamesByProjectHistorySq(@Param("projectHistorySq") Long projectHistorySq);

    List<String> selectSkillTagNamesByResumeSq(@Param("resumeSq") Long resumeSq);

    List<ResumeDetailResponseDTO.CertificationDTO> selectCertificationList(@Param("resumeSq") Long resumeSq);

    List<ResumeDetailResponseDTO.TrainingDTO> selectTrainingList(@Param("resumeSq") Long resumeSq);

    List<java.util.Map<String, Object>> selectAttachmentList(@Param("resumeSq") Long resumeSq);

    // ← 공통 코드 이름 조회 추가
    String selectCommonCodeName(Long codeSq);

    List<Map<String, Object>> selectGroupedSkillTagsByProjectHistorySq(Long projectHistorySq);

    String selectResumePhotoSaveName(Long resumeSq);

    void updateReadApplicationDtmIfNull(Long resumeSq, Long projectSq, Long companySq);

    Long findCompanySqByUserSq(Long userSq);

}