package com.example.demo.domain.scout.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ScoutListResponseDto {
	
	@JsonProperty("data")
    private DataContainer data;

    @Getter
    @Builder
    public static class DataContainer {
        private List<ScoutItem> scouts;

        @JsonProperty("page_info")
        private PageInfo pageInfo;
    }

    @Getter
    @Builder
    public static class ScoutItem {
        @JsonProperty("scouts_sq")
        private Long scoutsSq;

        @JsonProperty("sender_company_name")
        private String senderCompanyName;

        @JsonProperty("project_sq")
        private Long projectSq;

        @JsonProperty("project_title")
        private String projectTitle;

        private String title;
        private String content;

        @JsonProperty("offered_pay")
        private Long offeredPay;

        private String status;

        @JsonProperty("created_at")
        private String createdAt;

        @JsonProperty("expired_at")
        private String expiredAt;
    }

    @Getter
    @Builder
    public static class PageInfo {
        @JsonProperty("current_page")
        private int currentPage;

        @JsonProperty("total_pages")
        private int totalPages;

        @JsonProperty("total_elements")
        private long totalElements;

        @JsonProperty("is_last")
        private boolean isLast;
    }
}
