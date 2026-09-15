package com.example.demo.domain.salary.dto.response;

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
public class YearProjectionDTO {
    private List<YearPointDTO> normal;
    private List<YearPointDTO> grind;
}
