package com.example.demo.domain.community.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.dto.CommunityBestItemDTO;
import com.example.demo.domain.community.entity.*;
import java.util.*;

@Mapper
public interface BoardMapper {
      Board findByIdBoard(@Param("boardSq") Long boardSq, @Param("boardTypeCd") Long boardTypeCd);

      // 목록과 카운트는 같은 동적 조건을 공유한다 — 한쪽만 파라미터를 늘리면
      // 목록은 필터링되는데 총 건수는 전체 기준이라 뒷 페이지가 비는 증상이 난다(Phase 3 사례).
      List<Board> findAll(
                  @Param("boardTypeCd") Long boardTypeCd,
                  @Param("boardCategoryCd") Long boardCategoryCd,
                  @Param("boardAdoptStatusCd") Long boardAdoptStatusCd,
                  @Param("searchType") String searchType,
                  @Param("keyword") String keyword,
                  @Param("tag") String tag, // 5번째: 단일 태그 검색어
                  @Param("skillTags") List<Long> skillTags, // 6번째: 기술 태그 리스트
                  @Param("sortType") String sortType,
                  @Param("size") Long size,
                  @Param("offset") Long offset);

      Long findAllCnt(
                  @Param("boardTypeCd") Long boardTypeCd,
                  @Param("boardCategoryCd") Long boardCategoryCd,
                  @Param("boardAdoptStatusCd") Long boardAdoptStatusCd,
                  @Param("searchType") String searchType,
                  @Param("keyword") String keyword,
                  @Param("tag") String tag, // [수정] tag 파라미터 추가
                  @Param("skillTags") List<Long> skillTags // [수정] 불필요한 sortType, size, offset 제거
      );

      void insert(Board board);

      void update(Board board);

      void delete(@Param("userSq") Long userSq, @Param("boardSq") Long boardSq);

      void addViewCnt(@Param("boardSq") Long boardSq);

      void updateCommentCnt(@Param("boardSq") Long boardSq);

      void updateRecommendCnt(@Param("boardSq") Long boardSq);

      void insertFile(@Param("boardSq") Long boardSq, @Param("fileSq") Long fileSq);

      List<Long> findFiles(@Param("boardSq") Long boardSq);

      BoardAttachment findFile(@Param("fileSq") Long fileSq);

      void deleteBoardFile(@Param("boardSq") Long boardSq, @Param("fileSq") Long fileSq);

      void deleteFile(@Param("fileSq") Long fileSq);

      Board findByIdOnly(@Param("boardSq") Long boardSq);

      List<CommunityBestItemDTO> findBestBoards(@Param("period") String period, @Param("size") int size);

}