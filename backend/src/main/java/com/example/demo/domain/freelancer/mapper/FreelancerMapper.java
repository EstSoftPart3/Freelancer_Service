package com.example.demo.domain.freelancer.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.freelancer.dto.request.FreelancerFileDTO;
import com.example.demo.domain.freelancer.dto.request.FreelancerRequestDTO;
import com.example.demo.domain.freelancer.dto.request.FreelancerSearchRequestDTO;
import com.example.demo.domain.freelancer.dto.response.FreelancerResponseDTO;


@Mapper
public interface FreelancerMapper {
	// 프리랜서 등록
	int insertFreelancer(FreelancerRequestDTO freelancerRequestDTO);
	// 프리랜서 전체 조회
	List<FreelancerResponseDTO> selectFreelancerAll();
	// 프리랜서 검색
	List<FreelancerResponseDTO> selectFreelancerSearch(FreelancerSearchRequestDTO freelancerSearchRequestDTO);
	// 프리랜서 중복 확인
	int selectFreelancerByUserSq(Long userSq);
	 // 프로필 이미지 파일 저장
    int insertFreelancerProfileImage(FreelancerFileDTO fileDTO);
    // 프로필 이미지 매핑 저장
    int insertFreelancerProfileImageMapping(@Param("freelancerSq") Long freelancerSq, @Param("fileSq") Long fileSq);
}
