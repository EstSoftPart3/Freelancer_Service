package com.example.demo.domain.community.dto.response;

import com.example.demo.domain.community.dto.BoardListDTO;

import lombok.*;

import java.util.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardListResponse{
    private Long page;
    private Long size;
    private Long totalElements;
    private List<BoardListDTO> boards;
	
}