package com.example.demo.domain.user.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FindIdResponseDTO {
    private String userId;
    private String userNm;
    private String userType;
    private LocalDateTime userCreatedAtDtm;
}