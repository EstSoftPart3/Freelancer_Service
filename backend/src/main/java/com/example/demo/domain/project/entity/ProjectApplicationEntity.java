package com.example.demo.domain.project.entity;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Optional;

import com.example.demo.common.ParentCodeEnum;
import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.project.dto.request.ProjectApplyRequest;
import com.example.demo.domain.project.entity.enums.ProjectApplicationStatus;
import com.example.demo.domain.project.mapper.ProjectMapper;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectApplicationEntity {

    private Long projectApplicationSq;

    private Long projectSq;

    private Long resumeSq;

    private Long companySq;

    private Long projectApplicationStatusCd;

    private Long projectApplicationMemberTypeCd;

    private LocalDateTime projectApplicationCreatedAtDtm;

    private LocalDateTime selectedInterviewDtm;
    
    private LocalDateTime readApplicationDtm;
    
    public void prePersist() {
    	this.projectApplicationCreatedAtDtm = LocalDateTime.now();
    }
    
    public static ProjectApplicationEntity from(long projectSq, ProjectMapper projectMapper,
    		Long resumeSq, String memberType, CommonCodeMapper commonCodeMapper, Optional<Long> companySq) {
    	return ProjectApplicationEntity.builder()
				.projectSq(projectSq)
				.companySq(companySq.orElse(null))
				.resumeSq(resumeSq)
				.projectApplicationStatusCd(commonCodeMapper.findCommonCodeSqByEngName(ProjectApplicationStatus.APPLIED.getCode(), ParentCodeEnum.PRO_APPLICATION.getCode()))
				.projectApplicationMemberTypeCd(commonCodeMapper.findCommonCodeSqByEngName(memberType, ParentCodeEnum.MEMBER_TYPE.getCode()))
				.build();
    }
    
}