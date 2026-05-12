package com.example.demo.domain.freelancer.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TBL_FREELANCER_MEMBER")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Freelancer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "freelancer_sq")
    private Long freelancerSq;

    @Column(name = "user_sq", nullable = false)
    private Long userSq;

    @Column(name = "freelancer_skill")
    private String freelancerSkill;

    @Column(name = "freelancer_greeting_txt", columnDefinition = "TEXT")
    private String freelancerGreetingTxt;

    @Column(name = "freelancer_created_at")
    private LocalDateTime freelancerCreatedAt;
    
    @Column(name = "freelancer_modified_at")
    private LocalDateTime freelancerModifiedAt;

    @Column(name = "freelancer_is_deleted_yn", length = 1)
    private String freelancerIsDeletedYn;

    @PrePersist
    public void prePersist() {
        this.freelancerCreatedAt = LocalDateTime.now();
        this.freelancerModifiedAt = LocalDateTime.now();
        if (this.freelancerIsDeletedYn == null)
            this.freelancerIsDeletedYn = "N";
    }
    
    @PreUpdate 
    public void preUpdate() {
        this.freelancerModifiedAt = LocalDateTime.now();
    }
}