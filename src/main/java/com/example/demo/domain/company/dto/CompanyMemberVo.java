package com.example.demo.domain.company.dto;

import java.time.LocalDate;
import java.util.List;

import com.example.demo.domain.project.vo.ResumeNmTtlVo;
import com.example.demo.domain.project.vo.ResumeSummaryVo;

import lombok.*;

@AllArgsConstructor
@Getter
@Builder
public class CompanyMemberVo {
	private final Long userSq;
	private final Long resumeSq;
	private final String userNm;
	private final String resumeTtl;
	private final Long leavedYn;
	
	private final LocalDate careerStartDt;
	private final LocalDate careerEndDt;
	
	private final List<String> skillTagNms;
	
	private final Integer careerYr;
	
	
	
	public static CompanyMemberVo from(Long userSq, ResumeSummaryVo resumeSummaryVo, LocalDate careerStart, LocalDate careerEnd
			, List<String> skillTags, Integer careerYr, Long leavedYn) {
		return CompanyMemberVo.builder()
				.userSq(userSq)
				.resumeSq(resumeSummaryVo.getResumeSq())
				.userNm(resumeSummaryVo.getResumeNm())
				.leavedYn(leavedYn)
				.resumeTtl(resumeSummaryVo.getResumeTtl())
				.careerStartDt(careerStart)
				.careerEndDt(careerEnd)
				.skillTagNms(skillTags)
				.careerYr(careerYr)
				.build();
	}
	
}
