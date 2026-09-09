package com.example.demo.domain.admin.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminTagMapper {
    // 관리자 권한으로 게시글/답변의 모든 태그 삭제
    void deleteNT(@Param("boardSq") Long boardSq, @Param("answerSq") Long answerSq);

    void deleteST(@Param("boardSq") Long boardSq, @Param("answerSq") Long answerSq);
}