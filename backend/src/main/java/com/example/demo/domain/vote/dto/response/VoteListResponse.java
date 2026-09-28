package com.example.demo.domain.vote.dto.response;

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
public class VoteListResponse {
    private Long page;
    private Long size;
    private Long totalElements;
    private List<VoteListItemDTO> votes;
}
