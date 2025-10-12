package com.example.demo.domain.calendar.dto.request;

import com.example.demo.domain.calendar.entity.CalendarPostionEvnt;
import com.example.demo.domain.calendar.entity.ScheduleEvnt;
import com.example.demo.domain.calendar.entity.SourceType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectScheduleSyncRequest {
    @NotNull
    private Long projectSq;
    private String title;
    @NotNull
    private LocalDate startDt;
    private LocalDate endDt;

    //공통 엔티티
    public ScheduleEvnt toParentEntity(Long userSq){
        return ScheduleEvnt.builder()
                .scheduleUserSq(userSq)
                .title(this.title)
                .startDt(this.startDt)
                .endDt(this.endDt)
                .calendarCreatedAtDtm(LocalDateTime.now())
                .calendarModifiedAtDtm(null)
                .sourceType(SourceType.PROJECT)
                .build();
    }

    //공고일정(자식)
    public CalendarPostionEvnt toChildEntity(Long scheduleSq,Long projectSq){
        return CalendarPostionEvnt.builder()
                .scheduleSq(scheduleSq)
                .postionEvntSq(projectSq)
                .build();
    }
}
