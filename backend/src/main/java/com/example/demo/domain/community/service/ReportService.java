package com.example.demo.domain.community.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.community.dto.request.ReportRequest;
import com.example.demo.domain.community.entity.Report;
import com.example.demo.domain.community.mapper.ReportMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {
	private final ReportMapper reportMapper;

	@Transactional
	public void registerReport(ReportRequest request, Long loginUserSq) {
		Report report = Report.builder()
				.reportUserSq(loginUserSq)
				.reportTargetTypeCd(request.getReportTypeCd())
				.reportTargetSq(request.getSq())
				.reportReasonCd(request.getReportReasonCd()) // 동적 코드 저장
				.reportContentTxt(request.getReportReasonTxt())
				.reportProcessStatusCd(2901L) // '접수' 상태 고정
				.build();

		reportMapper.insertReport(report);
	}

	@Transactional(readOnly = true)
	public List<CommonCodeDTO> getCodesByParent(Long parentSq) {
		return reportMapper.findCodesByParent(parentSq);
	}
}