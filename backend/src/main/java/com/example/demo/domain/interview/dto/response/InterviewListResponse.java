package com.example.demo.domain.interview.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewListResponse {
    private Long page;
    private Long size;
    private Long totalElements;
    private List<InterviewListItemDTO> reviews;
}
