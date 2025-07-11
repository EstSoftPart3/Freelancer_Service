package com.example.demo.domain.project.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PagedApplicantResponseDTO<T> { // 여기 <T> 추가
    private String applicantType; // "개인" or "기업"
    private int currentPage;
    private int totalPages;
    private List<T> response;
}
