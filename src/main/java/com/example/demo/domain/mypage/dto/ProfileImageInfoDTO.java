package com.example.demo.domain.mypage.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileImageInfoDTO {
    private Long fileSq;
    private String originalName;
    private String savedName;
    private String contentType;
    private Long size;
}
