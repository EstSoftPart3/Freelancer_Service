package com.example.demo.domain.interview.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TBL_INTERVIEW_S")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_sq")
    private Long interviewSq;

    @Column(name = "user_sq", nullable = false)
    private Long userSq;

    @Column(name = "company_sq", nullable = false)
    private Long companySq;

    @Column(name = "interview_request_txt", columnDefinition = "TEXT", nullable = false)
    private String interviewRequestTxt;

    @Column(name = "interview_status", length = 1)
    private String interviewStatus;
    
    @Column(name = "interview_created_at")
    private LocalDateTime interviewCreatedAt;
    
    @Column(name = "interview_modified_at")
    private LocalDateTime interviewModifiedAt;



    @PrePersist
    public void prePersist() {
        this.interviewCreatedAt = LocalDateTime.now();
        this.interviewModifiedAt = LocalDateTime.now();
        if (this.interviewStatus == null)
            this.interviewStatus = "W";
    }
    
    @PreUpdate 
    public void preUpdate() {
        this.interviewModifiedAt = LocalDateTime.now();
    }
}