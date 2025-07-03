package com.example.demo.domain.mypage.dto.response;

import java.util.List;

import com.example.demo.domain.mypage.dto.ProjectScrapDTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProjectScrapResponseDTO {
    private List<ProjectScrapDTO> content; // 리스트 데이터
    private int totalCount; // 전체 건수
}