package com.example.demo.domain.admin.dto.response;

import java.util.List;

import com.example.demo.domain.admin.dto.AdminBoardListDTO;

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
public class AdminBoardListResponseDTO {
    private Long page;
    private Long size;
    private Long totalElements;
    private List<AdminBoardListDTO> boards;
}