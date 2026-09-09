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
    private List<String> normalTags;
    private List<SkillTagDTO> skillTags;
    private List<Long> attachments;
    private List<MultipartFile> files;
	
}