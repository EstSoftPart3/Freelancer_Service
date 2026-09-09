package com.example.demo.domain.project.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SingleSkillInfoResponse {
    private String parentSkillTagNm;
    private String childSkillTagNm;
}