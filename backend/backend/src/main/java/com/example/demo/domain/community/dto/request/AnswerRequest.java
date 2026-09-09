package com.example.demo.domain.community.dto.request;

import com.example.demo.domain.community.dto.*;

import lombok.*;

import java.util.*;

import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@RequiredArgsConstructor
public class AnswerRequest{
    private Long userSq;
    private Long boardSq;
    private String ttl;
    private String description;
    private List<String> normalTags;
    private List<SkillTagDTO> skillTags;
    private List<Long> attachments;
    private List<MultipartFile> files;
	
}