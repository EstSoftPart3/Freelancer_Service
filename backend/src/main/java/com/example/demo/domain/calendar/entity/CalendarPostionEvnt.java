package com.example.demo.domain.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CalendarPostionEvnt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "postion_evnt_sq", nullable = false)
    private Long postionEvntSq;

    @Column(name = "schedule_sq", nullable = false)
    private Long scheduleSq;

    @Column(name = "project_sq", nullable = false)
    private Long projectSq;

    @Column(name = "company_sq", nullable = false)
    private Long companySq;
}
