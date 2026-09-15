package com.example.demo.domain.salary.dto.response;

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
public class JobChangeFeedItemDTO {
    private String maskedNickname;
    private Integer fromSalary;
    private Integer toSalary;
    private String relativeTime;
}
