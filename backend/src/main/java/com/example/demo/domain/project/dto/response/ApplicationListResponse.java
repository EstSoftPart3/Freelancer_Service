package com.example.demo.domain.project.dto.response;

import java.util.List;

import com.example.demo.domain.project.vo.ApplicationSummary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationListResponse {
    private List<ApplicationSummary> applications;
    private int totalCount;
}