package com.example.demo.domain.project.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PagedResponse<T> {
    private List<T> items; // 현재 페이지 아이템 목록
    private int currentPage; // 현재 페이지 번호
    private int totalPages; // 전체 페이지 수
    private long totalItems; // 전체 아이템 수
}