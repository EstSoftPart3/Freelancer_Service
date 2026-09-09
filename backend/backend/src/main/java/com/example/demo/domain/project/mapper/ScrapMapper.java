package com.example.demo.domain.project.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ScrapMapper {
	public Long findScrapSqByUserSq(@Param("userSq") Long userSq);
	public Long findScrapSqByUserSqAndProjectSq(@Param("userSq") Long userSq, @Param("projectSq") Long projectSq);
}
