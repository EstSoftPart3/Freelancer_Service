package com.example.demo.domain.project.service.matching.subject;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.demo.domain.mypage.dto.response.ResumeDetailResponseDTO;
import com.example.demo.domain.project.entity.enums.DeveloperGrade;
import com.example.demo.domain.project.entity.enums.EducationLevel;
import com.example.demo.domain.project.service.matching.MatchSubject;

public class ResumeMatchSubject implements MatchSubject {

    private final Set<String> skillTagNmSet;
    private final Long developerGradeCd;
    private final Long requiredEducationCd;
    private final String preferenceTxt;

    public ResumeMatchSubject(List<String> skillTagNames,
                               List<ResumeDetailResponseDTO.CareerDTO> careers,
                               List<ResumeDetailResponseDTO.EducationDTO> educations,
                               List<ResumeDetailResponseDTO.CertificationDTO> certifications) {

        // 1. 이력서 보유 스킬 (경력 히스토리와 독립된 대표 스킬 목록)
        this.skillTagNmSet = new HashSet<>(skillTagNames);

        // 2. 경력(연차) 계산 → 등급 코드로 역변환
        double totalYears = calculateTotalCareerYears(careers);
        this.developerGradeCd = DeveloperGrade.fromYears(totalYears).getGradeCd();

        // 3. 학력 → 공통코드 SQ로 역변환, 여러 학력 중 최고 랭크 채택
        this.requiredEducationCd = educations.stream()
                .map(e -> extractEducationLevelCd(e.getEducationSchoolNm()))
                .max(Comparator.comparingInt(cd -> EducationLevel.fromCode(cd).getRank()))
                .orElse(EducationLevel.ANY.getCodeSq());

        // 4. 자격증명들을 공백으로 이어붙여 텍스트 매칭용 문자열로 생성
        this.preferenceTxt = certifications.stream()
                .map(ResumeDetailResponseDTO.CertificationDTO::getCertificationNm)
                .collect(Collectors.joining(" "));
    }

    private double calculateTotalCareerYears(List<ResumeDetailResponseDTO.CareerDTO> careers) {
        // [확인 필요] CareerDTO의 실제 시작일/종료일 필드명 미확인 - 아래는 가정한 이름입니다.
        return careers.stream()
                .mapToDouble(c -> {
                    LocalDate end = c.getCareerEndDt() != null ? c.getCareerEndDt() : LocalDate.now();
                    return ChronoUnit.DAYS.between(c.getCareerStartDt(), end) / 365.0;
                })
                .sum();
    }

    private Long extractEducationLevelCd(String schoolNm) {
        if (schoolNm == null) return EducationLevel.ANY.getCodeSq();

        if (schoolNm.contains("대학원")) {
            return EducationLevel.MASTER_ABOVE.getCodeSq(); 
        }
        if (schoolNm.contains("대학")) {
            return EducationLevel.BACHELOR_ABOVE.getCodeSq();
        }
        if (schoolNm.contains("고등")) {
            return EducationLevel.HIGH_SCHOOL_ABOVE.getCodeSq();
        }
        return EducationLevel.ANY.getCodeSq();
    }

    @Override
    public Set<String> getSkillTagNmSet() {
        return skillTagNmSet;
    }

    @Override
    public Long getDeveloperGradeCd() {
        return developerGradeCd;
    }

    @Override
    public Long getRequiredEducationCd() {
        return requiredEducationCd;
    }

    @Override
    public String getPreferenceTxt() {
        return preferenceTxt;
    }
}
