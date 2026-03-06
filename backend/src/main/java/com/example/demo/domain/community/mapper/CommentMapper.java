package com.example.demo.domain.community.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.entity.*;
import java.util.*;

@Mapper
public interface CommentMapper {
     Comment findById(@Param("commentSq") Long commentSq);

     List<Comment> findByBoardSq(@Param("boardSq") Long boardSq);

     List<Comment> findByAnswerSq(@Param("answerSq") Long answerSq);

     void insert(Comment comment);

     void update(Comment comment);

     void delete(@Param("userSq") Long userSq, @Param("commentSq") Long commentSq);

     void updateRecommendCnt(Long commentSq);

     Comment selectCommentDetail(@Param("commentSq") Long commentSq);

}