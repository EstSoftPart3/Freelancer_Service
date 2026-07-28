package com.example.demo.domain.community.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardAttachment {
    private Long fileSq;
    private String fileOriginalNm;
    private String fileSaveNm;
}
