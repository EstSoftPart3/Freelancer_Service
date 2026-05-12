package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.request.AdminProjectRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectResponseDTO;
import com.example.demo.domain.project.entity.Project;

@Mapper
public interface AdminProjectMapper {
//	List<Project> findProjectsBySearch(
//	@Param("request") AdminProjectRequestDTO request,
//	@Param("offset") int offset
//	);
	List<AdminProjectResponseDTO> selectProjectAll();
	Long countProjectsBySearchLong(@Param("request") AdminProjectRequestDTO request);
	
	
}
