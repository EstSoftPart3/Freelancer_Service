package com.example.demo.domain.mypage.dto.response;

import java.util.List;

public class CertificateListResponseDTO {
    private final List<CertificateResponseDTO> certificates;
    private final int totalCount;
    private final int totalPages;
    private final int currentPage;

    public CertificateListResponseDTO(List<CertificateResponseDTO> certificates, int totalCount, int totalPages,
            int currentPage) {
        this.certificates = certificates;
        this.totalCount = totalCount;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
    }

    public List<CertificateResponseDTO> getCertificates() {
        return certificates;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }
}
