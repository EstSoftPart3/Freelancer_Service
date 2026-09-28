package com.example.demo.domain.scout.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ScoutScrapMapper {
	boolean existsScrap(@Param("userSq") Long userSq, @Param("resumeSq") Long resumeSq);
    void insertScrap(@Param("userSq") Long userSq, @Param("resumeSq") Long resumeSq);
    void deleteScrap(@Param("userSq") Long userSq, @Param("resumeSq") Long resumeSq);
}


