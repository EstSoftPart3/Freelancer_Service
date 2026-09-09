package com.example.demo.domain.mypage.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ResumeCareerMapper {
	public Integer calculateCareerByResSq(Long resumeSq);
}
