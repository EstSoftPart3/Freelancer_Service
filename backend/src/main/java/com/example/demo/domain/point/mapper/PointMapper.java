package com.example.demo.domain.point.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PointMapper {

    int selectCurrentPoint(@Param("userSq") Long userSq);
}