package com.example.demo.domain.point.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.point.dto.PointHistoryResponse;

@Mapper
public interface PointMapper {

    int selectPointAmount(@Param("userSq") Long userSq);
    
    List<PointHistoryResponse> selectPointHistory(@Param("userSq") Long userSq);
}