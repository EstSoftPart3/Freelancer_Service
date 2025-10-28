package com.example.demo.domain.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class ScheduleEvnt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleSq;

    @Column(name = "schedule_user_sq", nullable = false)
    private Long scheduleUserSq;

    @Column(name = "title")
    private String title;

    @Column(name = "start_dt", nullable = false)
    private LocalDateTime startDt;

    @Column(name = "end_dt")
    private LocalDateTime endDt;

    @Column(name = "calendar_created_at_dtm", nullable = false)
    private LocalDateTime calendarCreatedAtDtm;

    @Column(name = "calendar_modified_at_dtm", nullable = false)
    private LocalDateTime calendarModifiedAtDtm;

    @Column(name = "schedule_is_deleted_yn", nullable = false, length = 1)
    private String scheduleIsDeletedYn;

    @Column(name = "sourceType", nullable = false)
    private SourceType sourceType;

    @Column(name = "schedule_all_day_yn", nullable = false)
    private String scheduleAllDayYn;

}
