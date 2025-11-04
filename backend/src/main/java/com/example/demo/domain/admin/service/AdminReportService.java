package com.example.demo.domain.admin.service;

import com.example.demo.domain.admin.dto.request.AdminReportRequest;
import com.example.demo.domain.community.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminReportService {
    
    private final ReportMapper reportMapper;
    
    /**
     * 신고 목록 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getReports(
            String searchQuery, String reportDate, String reportReason, String status,
            int page, int size
    ) {
        int offset = page * size;
        
        List<Map<String, Object>> reports = reportMapper.findReportsForAdmin(
                searchQuery, reportDate, reportReason, status, offset, size
        );
        
        // 상태 한글 변환
        reports.forEach(report -> {
            String statusCode = (String) report.get("status");
            report.put("status", "R".equals(statusCode) ? "대기중" : "처리완료");
        });
        
        long total = reportMapper.countReportsForAdmin(searchQuery, reportDate, reportReason, status);
        
        Map<String, Object> result = new HashMap<>();
        result.put("reports", reports);
        result.put("currentPage", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        result.put("totalElements", total);
        
        return result;
    }
    
    /**
     * 신고 상세 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getReportDetail(Long reportSq) {
        Map<String, Object> detail = reportMapper.findReportDetailForAdmin(reportSq);
        
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않는 신고입니다.");
        }
        
        // 상태 한글 변환
        String statusCode = (String) detail.get("status");
        detail.put("status", "R".equals(statusCode) ? "대기중" : "처리완료");
        
        return detail;
    }
    
    /**
     * 신고 처리
     */
    @Transactional
    public void processReport(Long reportSq, AdminReportRequest request) {
        reportMapper.insertReportHistory(reportSq, "C", request.getReportResult());
    }
}




