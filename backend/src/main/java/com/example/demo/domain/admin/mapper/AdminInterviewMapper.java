package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.interview.dto.response.InterviewListItemDTO;
import com.example.demo.domain.interview.entity.InterviewReview;

@Mapper
public interface AdminInterviewMapper {

    List<InterviewListItemDTO> findAllForAdmin(@Param("keyword") String keyword,
            @Param("sortType") String sortType, @Param("offset") Long offset, @Param("size") Long size);

    Long countForAdmin(@Param("keyword") String keyword);

    void updateReviewMaster(InterviewReview review);

    void deleteReviewMaster(@Param("interviewReviewSq") Long interviewReviewSq);
}
