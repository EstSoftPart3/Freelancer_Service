package com.example.demo.domain.community.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.community.entity.Report;

@Mapper
public interface ReportMapper {
    void insertReport(Report report);

    List<CommonCodeDTO> findCodesByParent(@Param("parentSq") Long parentSq);
}