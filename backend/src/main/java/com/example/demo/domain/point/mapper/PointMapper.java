package com.example.demo.domain.point.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PointMapper {

    int selectPointAmount(@Param("userSq") Long userSq);
}