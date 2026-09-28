package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.AdminBoardListDTO;
import com.example.demo.domain.community.entity.Comment;

@Mapper
public interface AdminBoardMapper {
        // managedTypeCds: BO 게시글 관리 목록이 다루는 게시판 유형 화이트리스트(공지·VOC 제외).
        // BoardTypeCode.communityListCodes()에서 온다 — 새 게시판 유형을 추가해도 XML을
        // 고치지 않고 이 목록에 자동으로 들어온다.
        List<AdminBoardListDTO> findAllUnified(
                        @Param("typeCds") List<Long> typeCds,
                        @Param("categoryCds") List<Long> categoryCds,
                        @Param("keyword") String keyword,
                        @Param("tagKeyword") String tagKeyword,
                        @Param("sortField") String sortField,
                        @Param("sortOrder") String sortOrder,
                        @Param("offset") Long offset,
                        @Param("size") Long size,
                        @Param("managedTypeCds") List<Long> managedTypeCds,
                        @Param("answerSupportedTypeCds") List<Long> answerSupportedTypeCds);

        Long findAllUnifiedCnt(
                        @Param("typeCds") List<Long> typeCds,
                        @Param("categoryCds") List<Long> categoryCds,
                        @Param("keyword") String keyword,
                        @Param("tagKeyword") String tagKeyword,
                        @Param("managedTypeCds") List<Long> managedTypeCds);

        int deleteBoardMaster(@Param("sq") Long sq);

        int deleteAnswerMaster(@Param("sq") Long sq);

        Comment findCommentById(@Param("commentSq") Long commentSq);

        void deleteCommentByAdmin(@Param("commentSq") Long commentSq);
}