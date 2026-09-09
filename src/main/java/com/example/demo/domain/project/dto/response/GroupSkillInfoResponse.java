package com.example.demo.domain.project.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class GroupSkillInfoResponse {
    private String parentSkillTagNm;
    private List<String> childSkillTagNms;
}