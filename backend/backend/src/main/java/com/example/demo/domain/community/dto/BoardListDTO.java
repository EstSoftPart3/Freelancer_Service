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
    private String userNm; // 사용자 이름
    private String ttl;
    private Integer viewCnt;
    private Integer commentCnt;
    private Integer recommendCnt;
    private Integer answerCnt;
    private Long boardAdoptStatusCd;
    private LocalDateTime createdAt;
    private List<String> normalTags;  // 일반 태그
    private List<SkillTagDTO> skillTags;

    public static BoardListDTO fromEntity(Board board, String userNm, Integer boardAnswerCnt, List<String> normalTags, List<SkillTagDTO> skillTags) {
        return new BoardListDTO(
			board.getBoardSq(),
			board.getUserSq(),
			userNm,
			board.getBoardTtl(),
			board.getBoardViewCnt(),
			board.getBoardCommentCnt(),
			board.getBoardRecommendCnt(),
			boardAnswerCnt,
			board.getBoardAdoptStatusCd(),
			board.getBoardCreatedAtDtm(),
			normalTags,
			skillTags
        );
    }
	
}