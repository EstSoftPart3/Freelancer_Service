package com.example.demo.domain.user.dto.request;

import lombok.Data;

@Data
public class FindIdRequestDTO {
    private String name;
    private String email;
}