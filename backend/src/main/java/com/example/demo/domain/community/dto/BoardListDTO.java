package com.example.demo.domain.community.dto;

import com.example.demo.domain.community.entity.*;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardListDTO{
	private Long sq;
    private Long userSq;
    private String userNickname; // 사용자 이름
    private String ttl;
    private Integer viewCnt;
    private Integer commentCnt;
    private Integer recommendCnt;
    private Integer answerCnt;
    private Long boardAdoptStatusCd;
    private LocalDateTime createdAt;
    private List<String> normalTags;  // 일반 태그
    private List<SkillTagDTO> skillTags;
    private String boardType; // "board" | "qna" — 전체보기(통합 목록)에서 상세 링크 분기용
    private Long categoryCd;   // 게시판 카테고리 코드. 카테고리 도입 전 글은 null(미분류)
    private String categoryNm; // 코드 라벨 — FO가 코드→라벨 표를 따로 들고 있지 않아도 되게 함께 내린다
    // 비공개 글 여부(고객의 소리 전용). 목록의 자물쇠 표시용이며, 남의 비공개 글은 애초에
    // 목록 SQL에서 걸러지므로 여기 true 로 오는 것은 내 글이거나 관리자가 보는 경우뿐이다.
    private boolean secret;

    public static BoardListDTO fromEntity(Board board, String userNickname, Integer boardAnswerCnt, List<String> normalTags, List<SkillTagDTO> skillTags) {
        return new BoardListDTO(
			board.getBoardSq(),
			board.getUserSq(),
			userNickname,
			board.getBoardTtl(),
			board.getBoardViewCnt(),
			board.getBoardCommentCnt(),
			board.getBoardRecommendCnt(),
			boardAnswerCnt,
			board.getBoardAdoptStatusCd(),
			board.getBoardCreatedAtDtm(),
			normalTags,
			skillTags,
			Long.valueOf(1402L).equals(board.getBoardTypeCd()) ? "qna" : "board",
			board.getBoardCategoryCd(),
			// 미분류(null)면 라벨도 null이다 — 뱃지를 그리지 않을지는 FO가 판단한다.
			// '자유'로 임의 승격하면 미분류와 실제 '자유' 선택을 구분할 수 없다.
			board.getBoardCategoryNm(),
			"Y".equals(board.getBoardIsSecretYn())
        );
    }
	
}