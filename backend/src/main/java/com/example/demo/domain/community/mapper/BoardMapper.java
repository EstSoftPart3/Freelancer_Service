package com.example.demo.domain.community.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.dto.CommunityBestItemDTO;
import com.example.demo.domain.community.entity.*;
import java.util.*;

@Mapper
public interface BoardMapper {
      Board findByIdBoard(@Param("boardSq") Long boardSq, @Param("boardTypeCd") Long boardTypeCd);

      /**
       * 게시판 종류를 가리지 않고 조회한다. 채택/상태변경처럼 "이 게시판이 그 기능을
       * 지원하는가"를 호출자가 {@link com.example.demo.domain.community.constant.BoardTypeCode}
       * capability로 직접 판정해야 하는 경우에 쓴다 — {@code findByIdBoard}처럼 특정 타입
       * 코드로 미리 걸러버리면 그 판정을 매퍼 밖으로 낼 수 없다.
       */
      Board findByIdAny(@Param("boardSq") Long boardSq);

      /**
       * 답변의 부모 글 타입을 조회한다. 답변을 지원하는 게시판이 QnA 하나뿐이던 시절엔 부모 타입을
       * QNA로 못박아도 됐지만, 커리어·기술소통도 답변을 지원하게 되면서 실제 부모 글을 찾아야
       * 한다(알림 링크·문구가 게시판마다 갈리므로). 부모 글이 이미 사라졌으면(하드 삭제 등)
       * {@code fallback}을 돌려준다. AdminBoardService·CommentService가 답변 알림에서 공유한다.
       */
      default Long findParentBoardTypeCdOrDefault(Long boardSq, Long fallback) {
            Board parentBoard = findByIdAny(boardSq);
            return parentBoard != null ? parentBoard.getBoardTypeCd() : fallback;
      }

      // 목록과 카운트는 같은 동적 조건을 공유한다 — 한쪽만 파라미터를 늘리면
      // 목록은 필터링되는데 총 건수는 전체 기준이라 뒷 페이지가 비는 증상이 난다(Phase 3 사례).
      // communityListTypeCds: boardTypeCd가 null(통합목록)일 때만 쓰는 종류 화이트리스트.
      // 예전엔 매퍼 XML에 IN (1401,1402)로 박혀 있었다 — 게시판 종류가 늘 때마다 XML을
      // 고쳐야 했던 걸, 서비스가 BoardTypeCode.communityListCodes()로 넘기게 바꿨다.
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
                  @Param("offset") Long offset,
                  @Param("communityListTypeCds") List<Long> communityListTypeCds);

      Long findAllCnt(
                  @Param("boardTypeCd") Long boardTypeCd,
                  @Param("boardCategoryCd") Long boardCategoryCd,
                  @Param("boardAdoptStatusCd") Long boardAdoptStatusCd,
                  @Param("searchType") String searchType,
                  @Param("keyword") String keyword,
                  @Param("tag") String tag, // [수정] tag 파라미터 추가
                  @Param("skillTags") List<Long> skillTags, // [수정] 불필요한 sortType, size, offset 제거
                  @Param("communityListTypeCds") List<Long> communityListTypeCds
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

      List<CommunityBestItemDTO> findBestBoards(@Param("period") String period, @Param("size") int size,
                  @Param("communityListTypeCds") List<Long> communityListTypeCds);

      /**
       * 첨부파일이 붙어 있는 게시글 번호. 다운로드 권한을 판정하려면 fileSq → boardSq 역방향
       * 조회가 필요하다. 글 첨부(TBL_BOARD_ATTACHMENT_S)와 답변 첨부
       * (TBL_BOARD_ANSWER_ATTACHMENT_S) 를 모두 훑는다 — 답변 첨부를 빼면 비공개 문의에 달린
       * 운영자 답변의 첨부가 그대로 공개된다. 어디에도 매달려 있지 않은 파일이면 null 이다.
       */
      Long findBoardSqByFileSq(@Param("fileSq") Long fileSq);

}