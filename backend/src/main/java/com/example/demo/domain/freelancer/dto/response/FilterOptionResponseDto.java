package com.example.demo.domain.freelancer.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FilterOptionResponseDto {

    private List<Option> addresses;
    private List<Option> careers;
    private List<Option> jobStatuses;
    private List<Option> skills;

    @Getter
    @Builder
    public static class Option {
        private Long value;
        private String label;
    }
}