package com.example.demo.domain.community.dto.response;

import com.example.demo.domain.community.entity.*;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerListResponse{
	private Long sq;
    private Long userSq;
    private Long boardSq;
    private String userNm; // 사용자 이름
    private String ttl;
    private String description;
    private Integer viewCnt;
    private Integer commentCnt;
    private Integer recommendCnt;
    private String isAdoptedYn;
    private String isDeletedYn;
    private LocalDateTime createdAt;

    
    public static AnswerListResponse fromEntity(Answer answer, String userNm) {
        return new AnswerListResponse(
    		answer.getAnswerSq(),
    		answer.getUserSq(),
    		answer.getBoardSq(),
    		userNm,
    		answer.getAnswerTtl(),
    		answer.getAnswerDescriptionEdt(),
    		answer.getAnswerViewCnt(),
    		answer.getAnswerCommentCnt(),
    		answer.getAnswerRecommendCnt(),
    		answer.getAnswerIsAdoptedYn(),
    		answer.getAnswerIsDeletedYn(),
    		answer.getAnswerCreatedAtDtm()
        );
    }
	
}