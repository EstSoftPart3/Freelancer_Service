package com.example.demo.domain.project.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.domain.mypage.dto.response.ResumeDetailResponseDTO;
import com.example.demo.domain.mypage.service.ResumeDetailService;
import com.example.demo.domain.mypage.service.ResumeService;
import com.example.demo.domain.project.dto.response.ProjectRecommandationResponse;
import com.example.demo.domain.project.mapper.ProjectMapper;
import com.example.demo.domain.project.service.matching.CandidateDataLoader;
import com.example.demo.domain.project.service.matching.MatchScoreAggregator;
import com.example.demo.domain.project.vo.MatchContextVo;
import com.example.demo.domain.project.vo.MatchResultVo;
import com.example.demo.domain.project.vo.ProjectSummary;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectRecommandationService {

    private final ResumeDetailService resumeDetailService;
    private final CandidateDataLoader candidateDataLoader;
    private final MatchScoreAggregator matchScoreAggregator;

    public List<ProjectRecommandationResponse> getRecommendations(Long userSq) {

        var mainResume = resumeDetailService.getMainResumeDetail(userSq);
        System.out.println("===========1 ===========");
        System.out.println("mainResume == >"+mainResume);
        if (mainResume == null) {
            return List.of();
        }

        Long resumeSq = mainResume.getResumeSq();
        System.out.println("===========2 ===========");
        System.out.println("resumeSq == >"+resumeSq);
        if (resumeSq == null) {
            return List.of();
        }

        MatchContextVo context = candidateDataLoader.load(userSq, resumeSq);

        if (context.getAllCandidateProjectSq().isEmpty()) {
            return List.of();
        }

        List<MatchResultVo> results = matchScoreAggregator.calculateAll(context);

        return results.stream()
                .sorted(Comparator.comparingDouble(MatchResultVo::getTotalScore).reversed())
                .limit(6)
                .map(result -> toResponse(context, result))
                .toList();
    }

    private ProjectRecommandationResponse toResponse(MatchContextVo context, MatchResultVo result) {
        var project = context.getProjectInfo(result.getProjectSq());
        List<String> requiredSkillNames = context.getRequiredSkillNames(result.getProjectSq());
        int matchScore = (int) Math.round(result.getTotalScore());

        return ProjectRecommandationResponse.builder()
                .projectSq(project.getProjectSq())
                .projectTtl(project.getProjectTtl())
                .companyNm(project.getCompanyNm())
                .addressNm(project.getAddressNm())
                .projectSalary(project.getProjectSalary())
                .requiredSkillList(requiredSkillNames)
                .matchScore(matchScore)
                .build();
    }
}
