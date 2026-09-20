package com.example.demo.domain.sanction.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SanctionUserResponseDto {
	private List<SanctionUserItem> userList;
    private Long totalCount;
    private Integer currentPage;

    @Getter
    @Builder
    public static class SanctionUserItem {
        private Long userSq;
        private String userType;
        private String email;
        private String userNm;
        private String companyNm;
        private String phone;
        private Integer sanctionCount;
        private Integer reportCount;
        private String sanctionStatus;
        private String sanctionReason;
        private String suspendedUntilDtm;
    }
}
