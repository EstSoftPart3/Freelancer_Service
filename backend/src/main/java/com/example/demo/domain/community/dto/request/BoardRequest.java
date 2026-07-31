package com.example.demo.domain.community.dto.request;

import com.example.demo.domain.community.dto.*;

import org.springframework.web.multipart.MultipartFile;
import lombok.*;
import java.util.*;

@Getter
@Setter
@RequiredArgsConstructor
public class BoardRequest{
    private Long userSq;
    private String ttl;
    private String description;
    private Long boardAdoptStatusCd;
    /** 게시판 카테고리 (공통코드 3200 하위). 일반게시판에서만 쓰이고, 미선택 시 null = 미분류. */
    private Long categoryCd;
    /**
     * 비공개 여부. 고객의 소리(1404)에서만 의미가 있고, 다른 게시판에서 실려 와도 무시한다.
     * null 이면 등록 시 'N'(공개), 수정 시 기존 값 유지다.
     */
    private Boolean isSecret;
    private List<String> normalTags;
    private List<SkillTagDTO> skillTags;
    private List<Long> attachments;
    private List<MultipartFile> files;
	
}