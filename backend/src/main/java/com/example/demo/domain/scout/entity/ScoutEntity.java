package com.example.demo.domain.scout.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "tbl_scout_offer_m")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ScoutEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scout_offer_sq")
    private Long scoutOfferSq;

    @Column(name = "company_sq", nullable = false)
    private Long companySq;

    @Column(name = "resume_sq", nullable = false)
    private Long resumeSq;

    @Column(name = "project_sq")
    private Long projectSq;

    @Column(name = "scout_offer_ttl", nullable = false, length = 100)
    private String scoutOfferTtl;

    @Column(name = "scout_offer_cnt", nullable = false, columnDefinition = "TEXT")
    private String scoutOfferCnt;

    @Column(name = "scout_offer_salary")
    private Long scoutOfferSalary;

    @Column(name = "scout_offer_status_cd", nullable = false, length = 30)
    private String scoutOfferStatusCd;

    @Column(name = "scout_offer_created_at_dtm", nullable = false, updatable = false)
    private LocalDateTime scoutOfferCreatedAtDtm;

    @Column(name = "scout_offer_updated_at_dtm")
    private LocalDateTime scoutOfferUpdatedAtDtm;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.scoutOfferCreatedAtDtm = now;
        this.scoutOfferUpdatedAtDtm = now;
        if (this.scoutOfferStatusCd == null) {
            this.scoutOfferStatusCd = "PENDING";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.scoutOfferUpdatedAtDtm = LocalDateTime.now();
    }
}