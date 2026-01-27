package com.example.demo.domain.project.dto.request;

import com.example.demo.domain.company.dto.request.BaseRequest;

import java.util.List;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSearchRequest extends BaseRequest {

    private List<Long> addressCodeSq;

    private String sortBy; // 예: "project_start_dt"
    private String sortOrder; // 예: "asc" 또는 "desc"
    private List<Long> projectDeveloperGradeCd; // 예: 700
    private String projectIsDeletedYn; // "Y" or "N"
    private String experience; // 예: "3년 이상"
    private List<Long> educationCd; // 예: "대졸 이상"
    private List<Long> jobRoleCd; // 예: "백엔드 개발자"
    private String searchKeyword; // 예: "AI"
    private String searchType; // 예: "기술", "프로젝트명" 등

    // [추가] 지도 및 거리 필터링용
    private Double userLat; // 사용자 현재 위도
    private Double userLng; // 사용자 현재 경도
    private Integer distance; // 선택한 거리 (3, 5, 10 또는 999)
}
