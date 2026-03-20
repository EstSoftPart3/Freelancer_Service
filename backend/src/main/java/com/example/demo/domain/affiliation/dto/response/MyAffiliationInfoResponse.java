package com.example.demo.domain.affiliation.dto.response;

import lombok.*;
import java.time.*;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyAffiliationInfoResponse {
	private Long companySq;
	private String companyNm;
	private String companyCeoNm;
	private LocalDate companyOpenDt;
	private String companyUrl;
	private String companyGreetingTxt;
	private String companyIsRecruitingYn;
	private String address;
	private String sigungu;
	private List<String> tags;
	private String profileImageUrl;
	private LocalDate joinDt;

	public static MyAffiliationInfoResponse fromMap(Map<String, Object> map, List<String> tags,
			String profileImageUrl) {
		LocalDate openDt = null;
		Object openDtObj = map.get("companyOpenDt");
		if (openDtObj instanceof LocalDate) {
			openDt = (LocalDate) openDtObj;
		} else if (openDtObj instanceof java.sql.Date) {
			openDt = ((java.sql.Date) openDtObj).toLocalDate();
		}

		LocalDate joinDt = null;
		Object joinDtObj = map.get("companyMemberJoinDt");
		if (joinDtObj instanceof LocalDate) {
			joinDt = (LocalDate) joinDtObj;
		} else if (joinDtObj instanceof java.sql.Date) {
			joinDt = ((java.sql.Date) joinDtObj).toLocalDate();
		}

		return MyAffiliationInfoResponse.builder()
				.companySq(((Number) map.get("companySq")).longValue())
				.companyNm((String) map.get("companyNm"))
				.companyCeoNm((String) map.get("companyCeoNm"))
				.companyOpenDt(openDt)
				.companyUrl((String) map.get("companyUrl"))
				.companyGreetingTxt((String) map.get("companyGreetingTxt"))
				.companyIsRecruitingYn((String) map.get("companyIsRecruitingYn"))
				.address((String) map.get("address"))
				.sigungu((String) map.get("sigungu"))
				.tags(tags)
				.profileImageUrl(profileImageUrl)
				.joinDt(joinDt)
				.build();
	}
}
