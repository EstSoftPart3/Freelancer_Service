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
public class CalendarInterviewEvnt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long interviewEvntSq;

    @Column(name = "company_sq", nullable = false)
    private Long companySq;

    @Column(name = "project_sq", nullable = false)
    private Long projectSq;

    @Column(name = "project_application_sq", nullable = false)
    private Long projectApplicationSq;

    @Column(name = "schedule_sq", nullable = false)
    private Long scheduleSq;

    @Column(name = "address_sq", nullable = false)
    private Long addressSq;

    @Column(name = "project_ttl_snapshot", nullable = false)
    private String projectTtlSnapshot;

    @Column(name = "company_nm_snapshot", nullable = false)
    private String companyNmSnapshot;
}
