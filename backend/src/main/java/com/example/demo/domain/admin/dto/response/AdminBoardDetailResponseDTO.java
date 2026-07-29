package com.example.demo.domain.admin.dto.response;

import java.util.List;

import com.example.demo.domain.community.dto.SkillTagDTO;
import com.example.demo.domain.community.dto.response.AnswerListResponse;
import com.example.demo.domain.community.dto.response.BoardAttachmentResponse;
import com.example.demo.domain.community.dto.response.CommentResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBoardDetailResponseDTO {
    private Long sq;
    private Long userSq;
    private String userNm;
    private String userNickname;
    private String ttl;
    private String description;
    private Integer viewCnt;
    private Integer commentCnt;
    private Integer recommendCnt;
    private Long boardAdoptStatusCd;
    private Long boardTypeCd;
    private String mainType;
    private java.time.LocalDateTime createdAt;

    private Long parentBoardSq;
    private Long parentBoardTypeCd;

    private List<BoardAttachmentResponse> attachments;
    private List<String> normalTags;
    private List<SkillTagDTO> skillTags;
    private List<AnswerListResponse> answers;
    private List<CommentResponse> comments;
}