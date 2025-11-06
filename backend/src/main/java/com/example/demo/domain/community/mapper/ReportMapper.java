package com.example.demo.domain.community.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.entity.*;

import java.util.*;

@Mapper
public interface ReportMapper {
//	신고 조회
    List<Report> findAll();
//	신고 등록
    void insert(Report report);


//  인턴 추가 : 관리자 신고 관리

//	관리자 신고 목록 조회
    List<Map<String, Object>> findReportsForAdmin(
        @Param("searchQuery") String searchQuery,
        @Param("reportDate") String reportDate,
        @Param("reportReason") String reportReason,
        @Param("status") String status,
        @Param("offset") int offset,
        @Param("limit") int limit
    );
    
//	관리자 신고 개수 조회
    long countReportsForAdmin(
        @Param("searchQuery") String searchQuery,
        @Param("reportDate") String reportDate,
        @Param("reportReason") String reportReason,
        @Param("status") String status
    );
    
//	관리자 신고 상세 조회
    Map<String, Object> findReportDetailForAdmin(@Param("reportSq") Long reportSq);
    
//	신고 처리 이력 등록
    void insertReportHistory(
        @Param("reportSq") Long reportSq,
        @Param("reportStatus") String reportStatus,
        @Param("reportResult") String reportResult
    );
     
}
