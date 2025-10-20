package com.example.demo.domain.map.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

import com.example.demo.domain.map.dto.MapProjectDto;


@Mapper  // MyBatis 매퍼임을 표시하는 어노테이션
public interface MapSearchMapper {

    /**
     * 사용자 주소 조회 (위도, 경도)
     */
    MapProjectDto findUserAddress(@Param("userId") Long userId);

    List<MapProjectDto> findProjectsWithinRadius(
        @Param("userLat") double userLat,
        @Param("userLon") double userLon,
        @Param("radius") double radius,
        @Param("jobType") String jobType,
        @Param("searchKeyword") String searchKeyword,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    int countProjectsWithinRadius(
        @Param("userLat") double userLat,
        @Param("userLon") double userLon,
        @Param("radius") double radius,
        @Param("jobType") String jobType,
        @Param("searchKeyword") String searchKeyword
    );
}
