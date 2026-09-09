package com.example.demo.domain.mypage.dto.response;

import java.util.List;
import com.example.demo.domain.mypage.dto.request.ResumeCertificateRequest;
import lombok.Data;

@Data
public class CertificateListResponse {
    private List<ResumeCertificateRequest> item;
    private int totalCount;
}
