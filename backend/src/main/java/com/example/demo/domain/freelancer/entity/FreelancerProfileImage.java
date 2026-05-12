package com.example.demo.domain.freelancer.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TBL_FREELANCER_PROFILE_IMAGE_S")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerProfileImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_image_sq")
    private Long profileImageSq;

    @Column(name = "freelancer_sq", nullable = false)
    private Long freelancerSq;

    @Column(name = "file_sq", nullable = false)
    private Long fileSq;
}