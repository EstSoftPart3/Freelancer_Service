package com.example.demo.domain.affiliation.dto.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchFilterRequest{
    private String searchType;
    private String keyword;
    private String sortType;
    private Long addressCd;
    private Long page;
    private Long size;
    private Long offset;
    
}