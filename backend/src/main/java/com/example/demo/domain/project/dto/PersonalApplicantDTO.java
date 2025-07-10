package com.example.demo.domain.project.dto;

import java.util.List;

import com.example.demo.domain.project.vo.ApplicationStatusVo;
import com.example.demo.domain.project.vo.ResumeNmTtlVo;

import lombok.Data;

@Data
public class PersonalApplicantDTO {
    private Long applicationSq;
    private ResumeNmTtlVo resumeNmTtlVo; // 여기만 이름 변경
    private int careerYear;
    private List<String> skillNames;
    private ApplicationStatusVo appStatusVo;
    private String memberType;
    private String companyNm;
}
