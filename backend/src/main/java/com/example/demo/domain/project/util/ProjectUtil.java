package com.example.demo.domain.project.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.company.mapper.CompanyMapper;
import com.example.demo.domain.project.dto.response.InterviewTimeSlot;
import com.example.demo.domain.project.dto.response.RecruitHeadcountResponse;
import com.example.demo.domain.project.mapper.AddressMapper;
import com.example.demo.domain.project.mapper.ProjectMapper;
import com.example.demo.domain.project.mapper.SkillMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProjectUtil {
	private final AddressMapper addressMapper;
	private final CompanyMapper companyMapper;
	private final SkillMapper skillMapper;
	private final CommonCodeMapper commonCodeMapper;
	private final ProjectMapper projectMapper;
	
	
	public String convertAddressSqToName(Long addressSq) {
		return addressMapper.findAddressBySq(addressSq);
	}
	
	public String convertCompanySqToName(Long companySq) {
		return companyMapper.findCompanyNmByCompanySq(companySq);
	}
	
	
	public List<String> fetchReqSkillsByProjectSq(Long projectSq) {
		return skillMapper.findAllReqSkillsByProjectSq(projectSq);
	}
	
	public List<String> fetchPreferSkillsByProjectSq(Long projectSq) {
		return skillMapper.findAllPreferSkillsByProjectSq(projectSq);
	}
	
	public List<String> fetchWorkTypesByProjectSq(Long projectSq) {
		return projectMapper.findWorkTypesByProjectSq(projectSq);
	}
	
	public List<String> fetchJobsByProjectSq(Long projectSq) {
		return projectMapper.findJobsByProjectSq(projectSq);
	}

	/** 공고의 모집 인원. 인원 개념이 없던 시절 공고는 빈 리스트다. */
	public List<RecruitHeadcountResponse> fetchRecruitHeadcountsByProjectSq(Long projectSq) {
		return projectMapper.findRecruitHeadcountsByProjectSq(projectSq);
	}
	
	public Map<String, LocalDateTime> fetchInterviewTimeMinMaxBySq(Long projectSq) {
	    // 1. MyBatis로부터 Object 타입을 포함한 Map으로 받습니다.
	    Map<String, Object> rawMap = projectMapper.findInterviewTimeMinMaxBySq(projectSq);
	    Map<String, LocalDateTime> resultMap = new HashMap<>();

	    if (rawMap != null) {
	        rawMap.forEach((key, value) -> {
	            if (value instanceof java.sql.Timestamp) {
	                // Timestamp를 LocalDateTime으로 변환
	                resultMap.put(key, ((java.sql.Timestamp) value).toLocalDateTime());
	            } else if (value instanceof LocalDateTime) {
	                resultMap.put(key, (LocalDateTime) value);
	            } else {
	                resultMap.put(key, null);
	            }
	        });
	    }
	    return resultMap;
	}
	
	
	
	public String convertCommonCodeSqToNm(Long codeSq) {
		return commonCodeMapper.findCommonCodeNmBySq(codeSq);
	}
	
	public Map<String, List<String>> fetchAndConvertTimeSlots(Long projectSq){
		List<LocalDateTime> rawInterviewTimes = projectMapper.findAllInterviewTimesByProjectSq(projectSq);
		Map<String, List<String>> timeSlots = new HashMap<>();
		
		rawInterviewTimes.forEach(
				t -> {
					String date = t.toLocalDate().toString();
					String time = t.toLocalTime().toString();
					timeSlots.computeIfAbsent(date, k -> new ArrayList<>()).add(time);
				}
		);
		return timeSlots;
	}
}
