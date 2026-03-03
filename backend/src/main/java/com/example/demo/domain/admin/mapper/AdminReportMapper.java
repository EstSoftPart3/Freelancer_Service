package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.AdminReportListDTO;

@Mapper
public interface AdminReportMapper {

    // 1. 신고 목록 조회 (필터 및 페이징 적용)
    List<AdminReportListDTO> findAllReports(
            @Param("statusCds") List<Long> statusCds,
            @Param("keyword") String keyword,
            @Param("offset") Long offset,
            @Param("size") Long size,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder);

    // 2. 전체 신고 건수 조회
    Long countReports(
            @Param("statusCds") List<Long> statusCds,
            @Param("keyword") String keyword);

    // 3. 특정 신고 상세 정보 조회 (서비스의 processReport 로직용)
    AdminReportListDTO findById(@Param("reportSq") Long reportSq);

    // 4. 신고 처리 상태 업데이트
    void updateReportStatus(
            @Param("reportSq") Long reportSq,
            @Param("statusCd") Long statusCd,
            @Param("processDesc") String processDesc,
            @Param("adminSq") Long adminSq);
}