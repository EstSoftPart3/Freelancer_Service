package com.example.demo.domain.calendar.dto.request;

import com.example.demo.domain.calendar.entity.CalendarIndvdiEvnt;
import com.example.demo.domain.calendar.entity.ScheduleEvnt;
import com.example.demo.domain.calendar.entity.SourceType;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PersonalScheduleCreateRequest {
    private String title;
    @NotNull
    private LocalDate startDt;
    private LocalDate endDt;
    private String memo;

    //공통 엔티티로 변환
    public ScheduleEvnt toParentEntity(Long userSq){
        return ScheduleEvnt.builder()
                .scheduleUserSq(userSq)
                .title(this.title)
                .startDt(this.startDt)
                .endDt(this.endDt)
                .calendarCreatedAtDtm(LocalDateTime.now())
                .calendarModifiedAtDtm(null)
                .scheduleIsDeletedYn("N")
                .sourceType(SourceType.PERSONAL)
                .build();
    }

    //개인 일정(자식) 엔티티로 변환
    public CalendarIndvdiEvnt toChildEntity(Long scheduleSq, Long userSq){
        return CalendarIndvdiEvnt.builder()
                .scheduleSq(scheduleSq)
                .memo(this.memo)
                .build();
    }



}
