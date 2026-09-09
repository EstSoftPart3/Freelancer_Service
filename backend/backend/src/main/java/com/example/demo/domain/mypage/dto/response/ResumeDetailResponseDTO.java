package com.example.demo.domain.mypage.dto.response;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class ResumeDetailResponseDTO {
    private Long resumeSq;
    private String resumeTtl;
    private String resumePhotoUrl;
    private String resumeNm;
    private LocalDate resumeBirthDt;
    private String resumePhoneNum;
    private String resumeEmail;
    private String resumeGreetingTxt;
    private Boolean resumeIsNotificationYn;
    private Boolean resumeIsRepresentativeYn;

    private AddressDTO address;

    private List<EducationDTO> educationList;
    private List<CareerDTO> careerList;
    private List<ProjectDTO> projectList;
    private List<String> skillTagList;
    private List<CertificationDTO> certificationList;
    private List<TrainingDTO> trainingList;
    private List<AttachmentDTO> attachmentList;

    @Data
    public static class AddressDTO {
        private Long addressSq;
        private String addressFull;
    }

    @Data
    public static class EducationDTO {
        private String educationSchoolNm;
        private String educationMajorNm;
        private LocalDate educationAdmissionDt;
        private LocalDate educationGraduationDt;
        private Long educationStatusCd;
        private String educationStatusNm;
    }

    @Data
    public static class CareerDTO {
        private String careerCompanyNm;
        private String careerDepartmentNm;
        private String careerPositionNm;
        private LocalDate careerStartDt;
        private LocalDate careerEndDt;
    }

    @Data
    public static class ProjectDTO {
        private Long projectHistorySq;
        private String projectHistoryClient;
        private Long projectHistoryTypeCd;
        private String projectHistoryTypeNm;
        private Long projectHistoryJobPositionTypeCd;
        private String projectHistoryJobPositionTypeNm;
        private String projectHistoryTask;
        private LocalDate projectHistoryStartDt;
        private LocalDate projectHistoryEndDt;
        private List<Map<String, List<String>>> groupedSkillTags;
    }

    @Data
    public static class CertificationDTO {
        private String certificationNm;
        private String certificationIssuerNm;
    }

    @Data
    public static class TrainingDTO {
        private String trainingInstitutionNm;
        private String trainingProgramNm;
        private LocalDate trainingStartDt;
        private LocalDate trainingEndDt;
    }

    @Data
    public static class AttachmentDTO {
        private String attachmentFileUrl;
        private String attachmentOriginFileNm;
    }
}
