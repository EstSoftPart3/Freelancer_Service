package com.example.demo.domain.scout.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ScoutScrapMapper {
	int checkScrapExists(@Param("userSq") Long userSq, @Param("resumeSq") Long resumeSq);
    int insertScrap(@Param("userSq") Long userSq, @Param("resumeSq") Long resumeSq);
    int deleteScrap(@Param("userSq") Long userSq, @Param("resumeSq") Long resumeSq);

}
