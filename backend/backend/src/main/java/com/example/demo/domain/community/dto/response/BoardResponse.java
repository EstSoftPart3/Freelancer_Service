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
    private String userNm; // 사용자 이름
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

    
    public static BoardResponse fromEntity(Board board, String userNm, List<String> normalTags, List<SkillTagDTO> skillTags, List<AnswerListResponse> answers, List<CommentResponse> comments, Long viewerSq, List<BoardAttachmentResponse> files) {
        return new BoardResponse(
			board.getBoardSq(),
			board.getUserSq(),
			userNm,
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
			viewerSq
        );
    }
	
}