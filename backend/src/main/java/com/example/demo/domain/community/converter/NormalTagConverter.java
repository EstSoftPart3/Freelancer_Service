package com.example.demo.domain.community.converter;

import com.example.demo.domain.community.entity.NormalTag;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NormalTagConverter {

    // List<String> -> List<NormalTag> 변환
    public List<NormalTag> convertStringsToNormalTags(Long boardSq, Long answerSq, List<String> normalTags) {
        return normalTags.stream()
            .filter(tag -> tag != null && !tag.trim().isEmpty()) // Null 또는 빈 문자열 제외
            .map(tag -> NormalTag.builder()
                .boardSq(boardSq)
                .answerSq(answerSq)
                .normalTagNm(tag)
                .normalTagTypeCd(boardSq != null ? 1701L : 1702L) // 게시글인 경우 1701/ 답변인 경우 1702 
                .build())
            .collect(Collectors.toList());
    }
    
 // List<NormalTag> -> List<String> 변환
    public List<String> convertNormalTagsToStrings(List<NormalTag> normalTags) {
        return normalTags.stream()
            .map(NormalTag::getNormalTagNm) // NormalTagNm (태그 이름) 만 추출
            .collect(Collectors.toList());
    }
}