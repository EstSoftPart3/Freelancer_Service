package com.example.demo.domain.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMemberListResponse {
    private List<AdminMemberResponse> content;
    private int currentPage;
    private int pageSize;
    private long totalElements;
    private int totalPages;
}

