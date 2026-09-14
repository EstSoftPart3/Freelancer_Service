package com.example.demo.domain.freelancer.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.freelancer.dto.request.FreelancerRequestDto;
import com.example.demo.domain.freelancer.dto.response.FreelancerResponseDto;


@Mapper
public interface FreelancerMapper {
	
    List<FreelancerResponseDto> selectFreelancers(
            @Param("req") FreelancerRequestDto req,
            @Param("offset") int offset
    );
    List<String> selectFreelancerSkills(@Param("resumeSq") Long freelancerSq);

    long countFreelancers(@Param("req") FreelancerRequestDto req);

}
