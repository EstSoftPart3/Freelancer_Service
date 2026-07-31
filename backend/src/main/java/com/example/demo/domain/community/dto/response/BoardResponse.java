package com.example.demo.domain.community.dto.response;

import com.example.demo.domain.community.dto.SkillTagDTO;
import com.example.demo.domain.community.entity.Board;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponse{
	private Long sq;
    private Long userSq;
    private String userNickname; // 사용자 이름
    private String ttl;
    private String description;
    private Integer viewCnt;
    private Integer commentCnt;
    private Integer recommendCnt;
    private Long boardAdoptStatusCd;
    private LocalDateTime createdAt;
    private List<BoardAttachmentResponse> attachments; // 첨부파일
    private List<String> normalTags;  // 일반 태그
    private List<SkillTagDTO> skillTags;
    private List<AnswerListResponse> answers;
    private List<CommentResponse> comments;
    private Long viewerSq;
    private Long categoryCd;   // 게시판 카테고리 코드. 카테고리 도입 전 글은 null(미분류)
    private String categoryNm; // 코드 라벨 — 상세 화면 뱃지 및 수정 폼 초기값에 쓰인다
    private boolean secret;    // 비공개 글 여부(고객의 소리 전용). 수정 폼의 체크박스 초기값이 된다


    public static BoardResponse fromEntity(Board board, String userNickname, List<String> normalTags, List<SkillTagDTO> skillTags, List<AnswerListResponse> answers, List<CommentResponse> comments, Long viewerSq, List<BoardAttachmentResponse> files) {
        return new BoardResponse(
			board.getBoardSq(),
			board.getUserSq(),
			userNickname,
			board.getBoardTtl(),
			board.getBoardDescriptionEdt(),
			board.getBoardViewCnt(),
			board.getBoardCommentCnt(),
			board.getBoardRecommendCnt(),
			board.getBoardAdoptStatusCd(),
			board.getBoardCreatedAtDtm(),
			files,
			normalTags,
			skillTags,
			answers,
			comments,
			viewerSq,
			board.getBoardCategoryCd(),
			board.getBoardCategoryNm(),
			"Y".equals(board.getBoardIsSecretYn())
        );
    }
	
}