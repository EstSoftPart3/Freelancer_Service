package com.example.demo.domain.project.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InterviewTimeSlot {
	private String date;
	private List<String> timeList;
}
