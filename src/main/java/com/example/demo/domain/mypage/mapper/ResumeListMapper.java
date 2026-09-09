package com.example.demo.domain.mypage.mapper;

import com.example.demo.domain.mypage.dto.request.ResumeFetchRequest;
import com.example.demo.domain.mypage.dto.response.ResumeSummary;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ResumeListMapper {
    List<ResumeSummary> getResumeListByMemberId(@Param("request")ResumeFetchRequest request, @Param("userSq") Long userSq);
    Integer countByUserSq(Long userSq);
}

