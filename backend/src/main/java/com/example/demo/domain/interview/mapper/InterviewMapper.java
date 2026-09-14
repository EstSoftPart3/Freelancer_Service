package com.example.demo.domain.interview.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.interview.dto.response.InterviewListItemDTO;
import com.example.demo.domain.interview.entity.InterviewReview;

@Mapper
public interface InterviewMapper {

    void insert(InterviewReview review);

    InterviewReview findById(@Param("interviewReviewSq") Long interviewReviewSq);

    List<InterviewListItemDTO> findAll(@Param("keyword") String keyword, @Param("companyNm") String companyNm,
            @Param("sortType") String sortType, @Param("size") Long size, @Param("offset") Long offset);

    Long findAllCnt(@Param("keyword") String keyword, @Param("companyNm") String companyNm);

    int deleteById(@Param("interviewReviewSq") Long interviewReviewSq, @Param("userSq") Long userSq);

    void addViewCnt(@Param("interviewReviewSq") Long interviewReviewSq);
}
