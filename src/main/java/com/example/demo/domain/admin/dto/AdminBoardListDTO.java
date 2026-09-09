package com.example.demo.domain.admin.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.domain.community.dto.SkillTagDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminBoardListDTO {
    private Long sq;
    private Long userSq;
    private String userNm;
    private String ttl;
    private Integer boardTypeCd; // [필수 추가] 유형 코드 (1401, 1402 등)
    private Integer viewCnt;
    private Integer commentCnt;
    private Integer recommendCnt;
    private Integer answerCnt;
    private Long boardAdoptStatusCd; // 상태 코드
    private LocalDateTime createdAt;
    private List<String> normalTags;
    private List<SkillTagDTO> skillTags; // 기존 DTO 재사용 혹은 이동
    private String mainType;
}