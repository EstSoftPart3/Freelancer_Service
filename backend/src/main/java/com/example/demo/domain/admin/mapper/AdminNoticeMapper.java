package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.dto.BoardListDTO;
import com.example.demo.domain.community.entity.Comment;

@Mapper
public interface AdminNoticeMapper {

        // 검색 조건에 맞는 공지사항 전체 개수 조회
        Long countNotices(@Param("boardTypeCd") Long boardTypeCd,
                        @Param("keyword") String keyword);

        // 검색 + 정렬 + 페이징이 적용된 목록 조회
        List<BoardListDTO> findAllNotices(
                        @Param("boardTypeCd") Long boardTypeCd,
                        @Param("keyword") String keyword,
                        @Param("sortField") String sortField,
                        @Param("sortOrder") String sortOrder,
                        @Param("offset") Long offset,
                        @Param("size") Long size);

        // 관리자용 댓글 삭제 (userSq 조건 없음)
        void deleteCommentByAdmin(@Param("commentSq") Long commentSq);

        // 댓글 정보 조회 (카운트 업데이트용)
        Comment findCommentById(@Param("commentSq") Long commentSq);
}