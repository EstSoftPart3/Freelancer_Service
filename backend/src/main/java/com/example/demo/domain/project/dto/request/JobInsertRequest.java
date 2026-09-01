package com.example.demo.domain.project.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class JobInsertRequest {
    private Long projectSq;
    /** 공통코드(1000 하위). 등록자가 직접 입력한 직군이면 0 */
    private Long recruitJobPosTypCd;
    /** 직접 입력한 직군 이름. 공통코드에 있는 직군이면 null */
    private String recruitJobPosNm;
}