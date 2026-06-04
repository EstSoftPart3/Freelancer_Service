package com.example.demo.domain.point.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.point.dto.PointHistoryResponse;

@Mapper
public interface PointMapper {

    int selectPointAmount(@Param("userSq") Long userSq);
    
    List<PointHistoryResponse> selectPointHistory(@Param("userSq") Long userSq);
    
    int countPointByUserSq(@Param("userSq") Long userSq);

    void insertPoint(@Param("userSq") Long userSq);

    Long selectPointSqByUserSq(@Param("userSq") Long userSq);

    void updatePointAmount(
            @Param("userSq") Long userSq,
            @Param("pointAmount") int pointAmount
    );

    void insertAttendancePointHistory(
            @Param("pointSq") Long pointSq,
            @Param("userSq") Long userSq,
            @Param("pointTp") String pointTp,
            @Param("chgPoint") int chgPoint,
            @Param("remPoint") int remPoint,
            @Param("pointRsn") String pointRsn
    );
}