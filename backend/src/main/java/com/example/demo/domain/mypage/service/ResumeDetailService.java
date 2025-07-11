package com.example.demo.domain.mypage.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.amazonaws.services.s3.AmazonS3;
import com.example.demo.domain.mypage.dto.request.ResumeDetailViewRequestDTO;
import com.example.demo.domain.mypage.dto.response.ResumeDetailResponseDTO;
import com.example.demo.domain.mypage.repository.ResumeDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResumeDetailService {

    private final ResumeDetailRepository repository;

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public ResumeDetailResponseDTO getResumeDetail(Long resumeSq) {
        ResumeDetailResponseDTO resume = repository.getResumeBasic(resumeSq);
        if (resume == null) {
            return null;

        }

        // 프로필 이미지
        String photoSaveName = repository.getResumePhotoSaveName(resumeSq);
        if (photoSaveName != null) {
            String s3Url = amazonS3.getUrl(bucket, photoSaveName).toString();
            resume.setResumePhotoUrl(s3Url);
        }
        // 주소
        resume.setAddress(repository.getAddress(resumeSq));

        // 학력
        List<ResumeDetailResponseDTO.EducationDTO> educationList = repository.getEducationList(resumeSq);
        for (ResumeDetailResponseDTO.EducationDTO edu : educationList) {
            String codeNm = repository.findCommonCodeName((long) edu.getEducationStatusCd());
            edu.setEducationStatusNm(codeNm);
        }
        resume.setEducationList(educationList);

        // 경력
        resume.setCareerList(repository.getCareerList(resumeSq));

        // 프로젝트 + 기술태그 (수정)
        List<ResumeDetailResponseDTO.ProjectDTO> projects = repository.getProjectList(resumeSq);
        for (ResumeDetailResponseDTO.ProjectDTO project : projects) {
            // repository에서 원본 데이터 받아오기 (List<Map<String, Object>> 형태)
            List<Map<String, Object>> rawGroupedSkillTags = repository
                    .selectGroupedSkillTagsByProjectHistorySq(project.getProjectHistorySq());

            // 부모 태그별로 자식 태그 리스트를 모으기 위한 Map (키: 부모 태그명, 값: 자식 태그 리스트)
            Map<String, List<String>> groupedMap = new LinkedHashMap<>();

            for (Map<String, Object> row : rawGroupedSkillTags) {
                String parent = (String) row.get("parentSkillTagName");
                String child = (String) row.get("skillTagName");

                groupedMap.computeIfAbsent(parent, k -> new ArrayList<>()).add(child);
            }

            // Map을 List<Map<String, List<String>>> 구조로 변환
            List<Map<String, List<String>>> groupedSkillTags = new ArrayList<>();
            for (Map.Entry<String, List<String>> entry : groupedMap.entrySet()) {
                Map<String, List<String>> map = new HashMap<>();
                map.put(entry.getKey(), entry.getValue());
                groupedSkillTags.add(map);
            }

            project.setGroupedSkillTags(groupedSkillTags);

            project.setProjectHistoryTypeNm(repository.findCommonCodeName((long) project.getProjectHistoryTypeCd()));
            project.setProjectHistoryJobPositionTypeNm(
                    repository.findCommonCodeName((long) project.getProjectHistoryJobPositionTypeCd()));
        }
        resume.setProjectList(projects);

        // 전체 기술 태그 리스트
        List<String> skillTagList = repository.getSkillTagNamesByResumeSq(resumeSq);
        resume.setSkillTagList(skillTagList);

        // 자격증
        resume.setCertificationList(repository.getCertificationList(resumeSq));

        // 교육 이력
        resume.setTrainingList(repository.getTrainingList(resumeSq));

        // 첨부파일 리스트 + S3 URL 생성
        List<java.util.Map<String, Object>> attachments = repository.getAttachmentList(resumeSq);

        List<ResumeDetailResponseDTO.AttachmentDTO> attachmentDTOs = attachments.stream()
                .map(map -> {
                    ResumeDetailResponseDTO.AttachmentDTO dto = new ResumeDetailResponseDTO.AttachmentDTO();
                    dto.setAttachmentOriginFileNm((String) map.get("file_original_nm"));

                    String fileSaveName = (String) map.get("file_save_nm");
                    // amazonS3.getUrl(bucket, key)로 URL 생성
                    String s3Url = amazonS3.getUrl(bucket, fileSaveName).toString();
                    dto.setAttachmentFileUrl(s3Url);

                    return dto;
                }).collect(Collectors.toList());

        resume.setAttachmentList(attachmentDTOs);

        return resume;
    }

    public ResumeDetailResponseDTO getResumeDetailAndMarkViewed(Long userSq, ResumeDetailViewRequestDTO dto) {

        // 열람일자 업데이트
        repository.updateReadApplicationDtmIfNull(dto.getResumeSq(), dto.getProjectSq(), dto.getApplicationSq());

        // 이력서 상세 조회
        return getResumeDetail(dto.getResumeSq());
    }
}
