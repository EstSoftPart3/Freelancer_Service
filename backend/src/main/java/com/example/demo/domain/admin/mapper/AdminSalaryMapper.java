package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.salary.dto.response.SalaryListItemDTO;
import com.example.demo.domain.salary.entity.SalarySubmission;

@Mapper
public interface AdminSalaryMapper {

    List<SalaryListItemDTO> findAllForAdmin(@Param("keyword") String keyword,
            @Param("isSeedYn") String isSeedYn, @Param("sortType") String sortType,
            @Param("offset") Long offset, @Param("size") Long size);

    Long countForAdmin(@Param("keyword") String keyword, @Param("isSeedYn") String isSeedYn);

    /** 감사 목적 — FO의 findByUserSq와 달리 삭제된 제출건도 조회된다. */
    SalarySubmission findByIdForAdmin(@Param("salarySubmissionSq") Long salarySubmissionSq);

    /** 시드/실데이터 여부(user_sq, is_seed_yn, seed_nickname)까지 함께 등록한다 — FO insert와 다른 쿼리. */
    void insertSubmission(SalarySubmission submission);

    /** FO의 update와 달리 salary_submission_is_deleted_yn을 건드리지 않는다(수정과 삭제 상태는 별개). */
    void updateSubmissionMaster(SalarySubmission submission);

    void deleteSubmissionMaster(@Param("salarySubmissionSq") Long salarySubmissionSq);
}
