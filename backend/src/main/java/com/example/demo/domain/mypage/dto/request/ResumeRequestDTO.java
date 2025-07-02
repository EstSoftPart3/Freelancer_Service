package com.example.demo.domain.mypage.dto.request;

import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class ResumeRequestDTO {

    private Long resumeSq;
    private AddressDTO address;

    private String resumeTtl;
    private String resumeNm;
    private LocalDate resumeBirthDt;
    private String resumePhoneNum;
    private String resumeEmail;
    private String resumeGreetingTxt;
    private String resumeIsNotificationYn;
    private String resumeIsRepresentativeYn;

    private List<EducationDTO> educationList;
    private List<CareerDTO> careerList;
    private List<ProjectHistoryDTO> projectHistoryList;
    private List<CertificationDTO> certificationList;
    private List<TrainingHistoryDTO> trainingHistoryList;

    private ResumeFileDTO profileImage;
    private List<ResumeFileDTO> attachmentList;

    private List<SkillTagDTO> skillTagList; // 전체 기술 태그 리스트

    @Getter
    @Setter
    @NoArgsConstructor
    public static class AddressDTO {
        private Long addressSq;
        private String zonecode;
        private String address;
        private String detailAddress;
        private String sigungu;
        private double latitude;
        private double longitude;
        private Long areaCodeSq;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class EducationDTO {
        private Long educationSq;
        private Long resumeSq;
        private String educationSchoolNm;
        private String educationMajorNm;
        private LocalDate educationAdmissionDt;
        private LocalDate educationGraduationDt;
        private Long educationStatusCd;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CareerDTO {
        private Long careerSq;
        private Long resumeSq;
        private String careerCompanyNm;
        private String careerDepartmentNm;
        private String careerPositionNm;
        private LocalDate careerStartDt;
        private LocalDate careerEndDt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ProjectHistoryDTO {
        private Long projectHistorySq;
        private Long resumeSq;
        private String projectHistoryClient;
        private Long projectHistoryTypeCd;
        private Long projectHistoryJobPositionTypeCd;
        private String projectHistoryTask;
        private LocalDate projectHistoryStartDt;
        private LocalDate projectHistoryEndDt;
        private List<ProjectHistorySkillTagDTO> skillTagList;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ProjectHistorySkillTagDTO {
        private Long projectHistorySkillSq;
        private Long projectHistorySq;
        private Long skillTagSq;
        private Long parentSkillTagSq;
        private int skillTagLvl;
        private String skillTagNm;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CertificationDTO {
        private Long certificationSq;
        private Long resumeSq;
        private Long certificationCd;
        private String certificationNm;
        private String certificationIssuerNm;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class TrainingHistoryDTO {
        private Long trainingSq;
        private Long resumeSq;
        private String trainingInstitutionNm;
        private String trainingProgramNm;
        private LocalDate trainingStartDt;
        private LocalDate trainingEndDt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ResumeFileDTO {
        private Long fileSq;
        private String fileOriginalNm;
        private String fileSaveNm;
        private String fileTyp;
        private Long fileSize;
        private String url;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class SkillTagDTO {
        private Long resumeSkillSq;
        private Long resumeSq;
        private Long skillTagSq;
        private Long parentSkillTagSq;
        private int skillTagLvl;
        private String skillTagNm;
    }
}
