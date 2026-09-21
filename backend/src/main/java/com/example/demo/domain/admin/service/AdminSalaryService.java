package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.domain.admin.mapper.AdminSalaryMapper;
import com.example.demo.domain.salary.dto.request.SalarySubmissionRequest;
import com.example.demo.domain.salary.dto.response.SalaryListItemDTO;
import com.example.demo.domain.salary.dto.response.SalaryListResponse;
import com.example.demo.domain.salary.dto.response.SalarySubmissionResponse;
import com.example.demo.domain.salary.entity.SalarySubmission;
import com.example.demo.domain.salary.mapper.SalaryMapper;
import com.example.demo.domain.salary.service.SalaryService;

import lombok.RequiredArgsConstructor;

/**
 * BO 연봉 제출건 관리. 게시판/투표/면접후기 BO와 달리 콘텐츠가 아니라 통계(리포트·순위표·이직동향)용
 * 원자료라, 등록·수정 검증 규칙은 {@link SalaryService#validate}/{@link SalaryService#toEntity}를
 * 그대로 재사용한다(FO와 다른 규칙이 두 곳에 따로 생기지 않도록 — AdminInterviewService와 동일한 이유).
 *
 * <p>
 * 삭제는 소프트삭제({@code salary_submission_is_deleted_yn='Y'})다. 사용자 요청으로 실데이터를
 * 완전히 지우지 않고 통계 집계에서만 제외한다({@link SalaryMapper}의 통계 쿼리들이 이 컬럼을
 * 필터링). 본인 조회(FO)는 이 값을 무시하고, 본인이 재제출하면 자동으로 'N'으로 복구된다
 * ({@code SalaryMapper.update}) — 그래서 관리자 수정({@link AdminSalaryMapper#updateSubmissionMaster})은
 * FO의 update와 별개 쿼리로, 삭제 상태를 건드리지 않는다.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AdminSalaryService {

    private final AdminSalaryMapper adminSalaryMapper;
    private final SalaryMapper salaryMapper;
    private final SalaryService salaryService;

    @Transactional(readOnly = true)
    public SalaryListResponse getAdminSubmissions(String keyword, String isSeedYn, String sortType, Long page,
            Long size) {
        if (page == null || page < 1) {
            page = 1L;
        }
        if (size == null || size < 1) {
            size = 12L;
        }
        if (size > 100) {
            size = 100L;
        }
        Long offset = (page - 1) * size;

        List<SalaryListItemDTO> submissions = adminSalaryMapper.findAllForAdmin(keyword, isSeedYn, sortType, offset,
                size);
        Long totalElements = adminSalaryMapper.countForAdmin(keyword, isSeedYn);

        return SalaryListResponse.builder()
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .submissions(submissions)
                .build();
    }

    @Transactional(readOnly = true)
    public SalarySubmissionResponse getAdminSubmission(Long salarySubmissionSq) {
        SalarySubmission submission = adminSalaryMapper.findByIdForAdmin(salarySubmissionSq);
        if (submission == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 제출건입니다.");
        }
        List<String> skills = salaryMapper.findSkillsBySubmissionSq(salarySubmissionSq);

        return SalarySubmissionResponse.builder()
                .salarySubmissionSq(submission.getSalarySubmissionSq())
                .userSq(submission.getUserSq())
                .userNickname(submission.getUserNickname())
                .isSeedYn(submission.getIsSeedYn())
                .seedNickname(submission.getSeedNickname())
                .isDeletedYn(submission.getSalarySubmissionIsDeletedYn())
                .createdAtDtm(submission.getCreatedAtDtm())
                .employmentType(submission.getEmploymentType())
                .jobNm(submission.getJobNm())
                .careerBucket(submission.getCareerBucket())
                .regionNm(submission.getRegionNm())
                .annualSalary(submission.getAnnualSalary())
                .skillTagNms(skills)
                .ageBand(submission.getAgeBand())
                .educationNm(submission.getEducationNm())
                .companySize(submission.getCompanySize())
                .companyType(submission.getCompanyType())
                .positionNm(submission.getPositionNm())
                .teamSize(submission.getTeamSize())
                .employmentSubtype(submission.getEmploymentSubtype())
                .remoteType(submission.getRemoteType())
                .bonusAmount(submission.getBonusAmount())
                .stockOpt(submission.getStockOpt())
                .jobChangeCount(submission.getJobChangeCount())
                .companyNm(submission.getCompanyNm())
                .prevAnnualSalary(submission.getPrevAnnualSalary())
                .jobChangedYm(submission.getJobChangedYm())
                .build();
    }

    @Transactional
    public void createSubmission(SalarySubmissionRequest request) {
        salaryService.validate(request);
        boolean isSeed = "Y".equals(request.getIsSeedYn());

        SalarySubmission submission = salaryService.toEntity(request);
        if (isSeed) {
            if (request.getSeedNickname() == null || request.getSeedNickname().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시드 닉네임을 입력해주세요.");
            }
            submission.setUserSq(null);
            submission.setIsSeedYn("Y");
            submission.setSeedNickname(request.getSeedNickname());
        } else {
            if (request.getUserSq() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "실데이터 등록은 회원을 지정해야 합니다.");
            }
            if (salaryMapper.findByUserSq(request.getUserSq()) != null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 제출 이력이 있는 회원입니다. 목록에서 수정해주세요.");
            }
            submission.setIsSeedYn("N");
            submission.setSeedNickname(null);
        }

        try {
            adminSalaryMapper.insertSubmission(submission);
        } catch (DuplicateKeyException e) {
            // uq_salary_submission_user 동시 등록 경합 — VoteService.castBallot과 동일 패턴.
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 제출 처리 중입니다. 잠시 후 다시 시도해주세요.");
        }
        for (String skill : request.getSkillTagNms()) {
            salaryMapper.insertSkill(submission.getSalarySubmissionSq(), skill);
        }
    }

    @Transactional
    public void updateSubmission(Long salarySubmissionSq, SalarySubmissionRequest request) {
        SalarySubmission existing = adminSalaryMapper.findByIdForAdmin(salarySubmissionSq);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 제출건입니다.");
        }
        salaryService.validate(request);

        SalarySubmission submission = salaryService.toEntity(request);
        submission.setSalarySubmissionSq(salarySubmissionSq);
        adminSalaryMapper.updateSubmissionMaster(submission);

        salaryMapper.deleteSkillsBySubmissionSq(salarySubmissionSq);
        for (String skill : request.getSkillTagNms()) {
            salaryMapper.insertSkill(salarySubmissionSq, skill);
        }
    }

    /** 소프트 삭제 — 통계 집계에서만 제외되고 원본은 남는다(감사 목적). */
    @Transactional
    public void deleteSubmission(Long salarySubmissionSq) {
        SalarySubmission existing = adminSalaryMapper.findByIdForAdmin(salarySubmissionSq);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 제출건입니다.");
        }
        adminSalaryMapper.deleteSubmissionMaster(salarySubmissionSq);
    }
}
