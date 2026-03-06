package com.example.demo.domain.community.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequest {
    private Long sq; // 신고 대상 PK
    private Long userSq; // 신고자 순번 (fallback용)
    private Long reportTypeCd; // 신고 대상 유형 (2001, 2002 등)
    private Long reportReasonCd; // [추가] 선택된 신고 사유 코드 SQ (2801, 2802 등)
    private String reportReasonTxt; // 상세 사유 (기타 입력 시 내용)
}