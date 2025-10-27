package com.example.demo.domain.calendar.dto.response;

import com.example.demo.domain.calendar.entity.SourceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalendarDetailResDto {
    private SourceType sourceType;
    private PersonalDetail personalDetail;
    private ProjectDetail projectDetail;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PersonalDetail{
        private Long scheduleSq;
        private String title;
        private LocalDateTime startDt;
        private LocalDateTime endDt;
        private String memo;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProjectDetail{
        private Long scheduleSq;
        private Long projectSq;
        private Long companySq;
        private String projectTtl;
        private LocalDate recruitStartDt;
        private LocalDate recruitEndDt;
        private String routePath; // 프로젝트 공고 상세페이지 url

    }
}
