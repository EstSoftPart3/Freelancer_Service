package com.example.demo.domain.community.dto.response;

import com.example.demo.domain.community.dto.*;
import com.example.demo.domain.community.entity.*;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResponse{
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
    private LocalDateTime createdAt;
    private List<BoardAttachmentResponse> attachments; // 첨부파일
    private List<String> normalTags;
    private List<SkillTagDTO> skillTags;
    private List<CommentResponse> comments;

    
    public static AnswerResponse fromEntity(Answer answer, String userNm, List<String> normalTags, List<SkillTagDTO> skillTags, List<CommentResponse> comments, List<BoardAttachmentResponse> files) {
        return new AnswerResponse(
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
    		answer.getAnswerCreatedAtDtm(),
    		files,
			normalTags,
			skillTags,
			comments
        );
    }
	
}