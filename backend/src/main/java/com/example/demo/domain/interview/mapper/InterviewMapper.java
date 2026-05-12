package com.example.demo.domain.interview.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.interview.dto.request.InterviewRequestDTO;
import com.example.demo.domain.interview.dto.response.InterviewResponseDTO;


@Mapper
public interface InterviewMapper {
    // 인터뷰 신청
    int insertInterview(InterviewRequestDTO dto);
    
    // 인터뷰 목록 조회
    List<InterviewResponseDTO> selectInterviewList(Long userSq);
    // 인터뷰 상태 변경
    int updateInterviewStatus(@Param("interviewSq") Long interviewSq, @Param("interviewStatus") String interviewStatus);
    // 인터뷰 중복 체크
    int selectInterviewByUserSq(@Param("userSq") Long userSq, @Param("companySq") Long companySq);
    // 유저 순번으로 기업 순번 확인
    List<InterviewResponseDTO> selectInterviewListByCompanyUserSq(Long userSq);
}