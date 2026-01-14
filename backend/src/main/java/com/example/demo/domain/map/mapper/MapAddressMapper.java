package com.example.demo.domain.map.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.map.dto.response.AreaCoordinateResponse;

@Mapper
public interface MapAddressMapper {
	AreaCoordinateResponse findCoordinates(@Param("addressSq") Long addressSq); 
}
