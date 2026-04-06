package com.example.demo.domain.community.mapper;


import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.dto.BoardAnswerCountDTO;
import com.example.demo.domain.community.entity.Answer;

@Mapper
public interface AnswerMapper {
     Answer findById(@Param("answerSq") Long answerSq);
     List<Answer> findAll(@Param("boardSq") Long boardSq);
     Integer findAllCnt(@Param("boardSq") Long boardSq);
     void insert(Answer answer);
     void update(Answer answer);
     void delete(@Param("userSq") Long userSq, @Param("answerSq") Long answerSq);
     void addViewCnt(@Param("answerSq") Long answerSq);
     void updateCommentCnt(@Param("answerSq") Long answerSq);
     void updateRecommendCnt(@Param("answerSq") Long answerSq);
     void insertFile(@Param("answerSq") Long answerSq, @Param("fileSq") Long fileSq);
     List<Long> findFiles(@Param("answerSq") Long answerSq);
     void deleteAnswerFile(@Param("answerSq") Long answerSq, @Param("fileSq") Long fileSq);

     //게시글의 답변 조회
     List<BoardAnswerCountDTO> findAnswerCountByBoardSqs(@Param("boardSqs") List<Long> boardSqs);
     
}
