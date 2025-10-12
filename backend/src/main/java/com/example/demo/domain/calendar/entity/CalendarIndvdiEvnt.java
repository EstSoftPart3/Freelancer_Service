package com.example.demo.domain.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class CalendarIndvdiEvnt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "indvdi_evnt_sq",nullable = false)
    private Long indvdiEvntSq;

    @Column(name = "schedule_sq", nullable = false)
    private Long scheduleSq;

    @Column(name = "memo")
    private String memo;

}
