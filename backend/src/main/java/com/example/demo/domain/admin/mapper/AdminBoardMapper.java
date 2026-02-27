package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.AdminBoardListDTO;
import com.example.demo.domain.community.entity.Comment;

@Mapper
public interface AdminBoardMapper {
        List<AdminBoardListDTO> findAllUnified(
                        @Param("typeCds") List<Long> typeCds,
                        @Param("keyword") String keyword,
                        @Param("tagKeyword") String tagKeyword,
                        @Param("sortField") String sortField,
                        @Param("sortOrder") String sortOrder,
                        @Param("offset") Long offset,
                        @Param("size") Long size);

        Long findAllUnifiedCnt(
                        @Param("typeCds") List<Long> typeCds,
                        @Param("keyword") String keyword,
                        @Param("tagKeyword") String tagKeyword);

        int deleteBoardMaster(@Param("sq") Long sq);

        int deleteAnswerMaster(@Param("sq") Long sq);

        Comment findCommentById(@Param("commentSq") Long commentSq);

        void deleteCommentByAdmin(@Param("commentSq") Long commentSq);
}