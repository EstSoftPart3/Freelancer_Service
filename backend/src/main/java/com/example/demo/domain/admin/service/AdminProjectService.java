package com.example.demo.domain.admin.service;



import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.admin.dto.request.AdminProjectRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectResponseDTO;
import com.example.demo.domain.admin.mapper.AdminProjectMapper;
import com.example.demo.domain.project.dto.response.ProjectListResponse;
import com.example.demo.domain.project.entity.Project;
import com.example.demo.domain.project.mapper.ProjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminProjectService {
	
	private final AdminProjectMapper adminProjectMapper;
	
	@Transactional(readOnly = true)
	public List<AdminProjectResponseDTO> getProjects() {
		log.info("프로젝트 조회 시작");
		List<AdminProjectResponseDTO> result = adminProjectMapper.selectProjectAll();
		log.info("프로젝트 조회 완료");
		return result;
	}
}

