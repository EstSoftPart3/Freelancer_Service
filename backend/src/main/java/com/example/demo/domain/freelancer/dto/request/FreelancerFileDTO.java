package com.example.demo.domain.freelancer.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FreelancerFileDTO {
    private Long fileSq;
    private String fileOriginalNm;
    private String fileSaveNm;
    private String fileTyp;
    private Long fileSize;
}