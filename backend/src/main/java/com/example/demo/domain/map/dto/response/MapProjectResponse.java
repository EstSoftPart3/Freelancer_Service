package com.example.demo.domain.map.dto.response;

import lombok.*;
import java.math.BigDecimal;

// 지도에서 표시될 프로젝트 정보 응답 DTO
// 기능 설명:
// - 지도에 마커로 표시할 프로젝트의 모든 정보를 담는 클래스
// - 거리는 사용자 위치에서 프로젝트 위치까지의 직선거리
// - naverMapUrl은 네이버 길찾기로 이동할 딥링크
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapProjectResponse {
    
    // 프로젝트 기본 정보
    private Long projectSq;             // 프로젝트 고유번호
    private String projectTitle;        // 프로젝트 제목
    private String companyName;         // 기업명
    private String jobType;             // 직무 (프론트엔드, 백엔드, DBA)
    
    // 주소 정보
    private String address;             // 기본 주소
    private String detailAddress;       // 상세 주소
    
    // 위치 정보 (지도 표시용)
    private BigDecimal latitude;        // 위도
    private BigDecimal longitude;       // 경도
    private Double distance;            // 사용자로부터의 거리 (km)
    
    // 지도 관련 URL
    private String naverMapUrl;         // 네이버 길찾기 딥링크 URL
    
    // 프로젝트 상세 정보
    private Long projectSalary;         // 프로젝트 단가
    private String projectStartDate;    // 프로젝트 시작일
    private String projectEndDate;      // 프로젝트 종료일
}
