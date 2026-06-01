package com.example.demo.domain.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceCheckResponse {
	
	private boolean check;
	private String message;

}