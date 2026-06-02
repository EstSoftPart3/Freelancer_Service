package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.AdminAttendanceListDTO;

@Mapper
public interface AdminAttendanceMapper {

    List<AdminAttendanceListDTO> selectAdminAttendanceList(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("offset") int offset,
            @Param("size") int size
    );

    Long selectAdminAttendanceCount(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );
}