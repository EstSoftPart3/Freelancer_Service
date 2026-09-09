package com.example.demo.domain.community.dto.response;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardAttachmentResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileSq;
    private String fileOriginalNm;
    private String fileSaveNm;
}
