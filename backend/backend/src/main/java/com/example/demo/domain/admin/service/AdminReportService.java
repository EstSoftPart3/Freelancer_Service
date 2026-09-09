package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.admin.dto.AdminReportListDTO;
import com.example.demo.domain.admin.dto.response.AdminReportListResponseDTO;
import com.example.demo.domain.admin.mapper.AdminBoardMapper;
import com.example.demo.domain.admin.mapper.AdminReportMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminReportService {
    private final AdminReportMapper adminReportMapper;
    private final AdminBoardMapper adminBoardMapper; // 기존 게시판 매퍼 재사용

    @Transactional(readOnly = true)
    public AdminReportListResponseDTO getReports(List<Long> statusCds, String keyword, Long page, Long size,
            String sortField, String sortOrder) {
        Long offset = (page - 1) * size;

        List<AdminReportListDTO> reports = adminReportMapper.findAllReports(statusCds, keyword, offset, size, sortField,
                sortOrder);
        Long totalElements = adminReportMapper.countReports(statusCds, keyword);

        return AdminReportListResponseDTO.builder()
                .reports(reports)
                .totalElements(totalElements)
                .page(page)
                .size(size)
                .build();
    }

    /**
     * 신고 상세 조회
     * 원문 본문(targetDescription)이 포함된 데이터를 반환합니다.
     */
    @Transactional(readOnly = true)
    public AdminReportListDTO getReportDetail(Long reportSq) {
        // 1. 상세 정보 조회 (Mapper XML 수정 시 본문 내용도 포함될 예정)
        AdminReportListDTO report = adminReportMapper.findById(reportSq);

        // 2. 예외 처리
        if (report == null) {
            throw new IllegalArgumentException("존재하지 않는 신고 건입니다.");
        }

        return report;
    }

    /**
     * 신고 처리 (마스터 권한)
     * 처리 완료 시 원본 게시글/댓글도 함께 삭제 처리함
     */
    @Transactional
    public void processReport(Long reportSq, Long statusCd, String processDesc, Long adminSq) {
        // 1. 신고 정보 조회
        AdminReportListDTO report = adminReportMapper.findById(reportSq);
        if (report == null)
            throw new IllegalArgumentException("존재하지 않는 신고 건입니다.");

        // 2. 신고 상태 업데이트
        adminReportMapper.updateReportStatus(reportSq, statusCd, processDesc, adminSq);

        // 3. '처리 완료(삭제)' 인 경우 원문 삭제 로직 가동
        if (statusCd == 2902L) {
            Long targetSq = report.getTargetSq();
            Long type = report.getTargetTypeCd();

            if (type == 2001L)
                adminBoardMapper.deleteBoardMaster(targetSq);
            else if (type == 2002L)
                adminBoardMapper.deleteAnswerMaster(targetSq);
            else if (type == 2003L || type == 2004L)
                adminBoardMapper.deleteCommentByAdmin(targetSq);
        }
    }
}