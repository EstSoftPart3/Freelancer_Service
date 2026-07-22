package com.example.demo.domain.project.service.matching;

import java.util.List;

import org.springframework.stereotype.Component;

import com.example.demo.domain.mypage.dto.response.ResumeDetailResponseDTO;
import com.example.demo.domain.mypage.repository.ResumeDetailRepository;
import com.example.demo.domain.project.mapper.ProjectMapper;
import com.example.demo.domain.project.service.matching.subject.ResumeMatchSubject;
import com.example.demo.domain.project.util.ProjectUtil;
import com.example.demo.domain.project.vo.MatchContextVo;
import com.example.demo.domain.project.vo.ProjectRecommendationVo;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CandidateDataLoader {

    private final ResumeDetailRepository resumeDetailRepository;
    private final ProjectMapper projectMapper;
    private final ProjectUtil projectUtil;

    public MatchContextVo load(Long userSq, Long resumeSq) {

    	// 1. 이력서 보유 스킬 (경력 히스토리와 독립)
        List<String> skillTagNames = resumeDetailRepository.getSkillTagNamesByResumeSq(resumeSq);


        // 2. 경력, 학력, 자격증 조회
        List<ResumeDetailResponseDTO.CareerDTO> careers = resumeDetailRepository.getCareerList(resumeSq);

        List<ResumeDetailResponseDTO.EducationDTO> educations = resumeDetailRepository.getEducationList(resumeSq);

        List<ResumeDetailResponseDTO.CertificationDTO> certifications = resumeDetailRepository.getCertificationList(resumeSq);


        // 3. Subject 조립
        MatchSubject subject = new ResumeMatchSubject(skillTagNames, careers, educations, certifications);


        // 3. 후보 project_sq 조회
        List<Long> candidateProjectSqList = projectMapper.selectCandidateProjectSqList(resumeSq);

        if (candidateProjectSqList.isEmpty()) {
            return MatchContextVo.of(subject, List.of(), projectUtil);
        }

        // 4. 후보 프로젝트 조회
        List<ProjectRecommendationVo> candidates =
                projectMapper.selectCandidateProjectSummaryList(candidateProjectSqList);

        // 5. MatchContextVo 조립
        return MatchContextVo.of(subject, candidates, projectUtil);
    }
}
