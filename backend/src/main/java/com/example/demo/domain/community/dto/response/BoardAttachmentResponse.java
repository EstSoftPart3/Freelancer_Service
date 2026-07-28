package com.example.demo.domain.community.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardAttachmentResponse {
    private Long fileSq;
    private String fileOriginalNm;
    private String fileSaveNm;
}
