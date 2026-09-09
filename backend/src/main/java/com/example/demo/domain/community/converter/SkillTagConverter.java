package com.example.demo.domain.community.converter;

import com.example.demo.domain.community.entity.SkillTag;
import com.example.demo.domain.community.dto.SkillTagDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SkillTagConverter {

    // List<SkillTagDTO> -> List<SkillTag> 변환
    public List<SkillTag> convertStringsToSkillTags(Long boardSq, Long answerSq, List<SkillTagDTO> skillTags) {
        return skillTags.stream()
            .filter(tag -> tag != null) // Null 또는 빈 문자열 제외
            .map(tag -> SkillTag.builder()
                .boardSq(boardSq)
                .answerSq(answerSq)
                .skillTagSq(tag.getSkillTagSq())
                .skillTagNm(tag.getSkillTagNm())
                .skillTagTypeCd(boardSq != null ? 1801L : 1802L) // 게시글인 경우 1801/ 답변인 경우 1802 
                .build())
            .collect(Collectors.toList());
    }
    
 // List<SkillTag> -> List<SkillTagDTO> 변환
    public List<SkillTagDTO> convertSkillTagsToStrings(List<SkillTag> skillTags) {
        return skillTags.stream()
            .map(skillTag -> SkillTagDTO.builder()
            		.skillTagSq(skillTag.getSkillTagSq())
    				.skillTagNm(skillTag.getSkillTagNm())
    				.build()) // NormalTagNm (태그 이름) 만 추출
            .collect(Collectors.toList());
    }
}