package com.example.demo.domain.affiliation.dto.response;

import lombok.*;
import java.util.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationListResponse{
//	소속 지원 정보 (개인)
    private Long page;
    private Long size;
    private Long totalElements;
    private Long readElements;
    private Long viewerSq;
    private List<ApplicationResponse> applies;
}