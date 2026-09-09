package com.example.demo.domain.affiliation.dto.response;

import lombok.*;
import java.util.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffiliationListResponse{
    private Long page;
    private Long size;
    private Long totalElements;
    private Long viewerSq;
    private List<AffiliationResponse> companies;
}