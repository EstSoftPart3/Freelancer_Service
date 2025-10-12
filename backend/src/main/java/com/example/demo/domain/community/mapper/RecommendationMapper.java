package com.example.demo.domain.community.mapper;


import org.apache.ibatis.annotations.*;

import com.example.demo.domain.community.entity.*;

@Mapper
public interface RecommendationMapper {
	Recommendation findByBoardSq(@Param("userSq") Long userSq, @Param("boardSq") Long bardSq);
	Recommendation findByAnswerSq(@Param("userSq") Long userSq, @Param("answerSq") Long answerSq);
	Recommendation findByCommentSq(@Param("userSq") Long userSq, @Param("commentSq") Long commentSq);
	void insert(Recommendation recommendation);
    void delete(@Param("recommendationSq") Long recommendationSq);
    void deleteAll(@Param("boardSq") Long boardSq, @Param("answerSq") Long answerSq, @Param("commentSq") Long commentSq);
    
}