package com.example.demo.domain.community.service;


import org.springframework.stereotype.Service;

import com.example.demo.domain.community.dto.request.*;
import com.example.demo.domain.community.entity.*;
import com.example.demo.domain.community.mapper.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportMapper reportMapper;

    @Transactional
    public List<Report> getReports() {
        return reportMapper.findAll();
    }

    @Transactional
    public void createReport(ReportRequest reportRequest){
//      신고 오류 처리
        if(reportRequest.getReportReasonTxt() == null) {
            throw new IllegalArgumentException("신고 사유를 입력해주세요.");
        } else if(reportRequest.getSq() == null) {
            throw new IllegalArgumentException("신고글 순번 오류");
        } else if(reportRequest.getReportTypeCd() == null) {
            throw new IllegalArgumentException("신고 유형 코드 오류");
        }

        // 인턴 수정: Report 빌더에서 중복된 .userSq() 호출 제거
        // 사유: 빌더 패턴에서 불필요한 중복 코드 제거로 코드 가독성 향상
        Report report = Report.builder()
                .userSq(reportRequest.getUserSq())
                .reportReasonTxt(reportRequest.getReportReasonTxt())
                .reportTypeCd(reportRequest.getReportTypeCd()).build();

        if(reportRequest.getReportTypeCd() == 2001) {
            report.setBoardSq(reportRequest.getSq());
        } else if (reportRequest.getReportTypeCd() == 2002) {
            report.setAnswerSq(reportRequest.getSq());
        } else if (reportRequest.getReportTypeCd() == 2003) {
            report.setCommentSq(reportRequest.getSq());
        } else {
            // 인턴 수정: 대댓글 신고 처리 추가
            // 사유: 대댓글 기능 구현에 따른 대댓글 신고 기능 추가
            report.setReplyCommentSq(reportRequest.getSq());
        }

        reportMapper.insert(report);

        if (report.getReportSq() == null) {
            throw new IllegalStateException("신고 생성 실패: Primary Key가 생성되지 않았습니다.");
        }

        return;
    }


}
