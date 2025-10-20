package com.example.demo.domain.calendar.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonalScheduleUpdateRequest {
    private Long scheduleSq;
    private String title;
    private LocalDate startDt;
    private LocalDate endDt;

//    endDt를 NULL로 비우고 싶을 때 true
    private Boolean clearEndDt;

    //서브(개인일정)
    private String memo;
    private Boolean clearMemo; //memo를 NULL처리할때
}
