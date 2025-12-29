package com.example.demo.domain.notification.core.entity;

import java.time.LocalDateTime;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity@Getter@Setter
@Table(name = "TBL_NOTIFICATION_M")
@NoArgsConstructor@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_sq")
    private Long notificationSq;

    @Column(name = "user_sq")
    private Long userSq;

    @Column(name = "notification_target_type_cd")
    private Long notificationTargetTypeCd;

    @Column(name = "notification_target_sq")
    private Long notificationTargetSq;

    @Column(name = "notification_ttl")
    private String notificationTtl;

    @Column(name = "notification_txt")
    private String notificationTxt;

    @Column(name = "notification_is_read_yn")
    private String notificationIsReadYn;

    @Column(name = "notification_delete_status")
    private Long notificationDeleteStatus;

    @Column(name = "notification_create_at_dtm")
    private LocalDateTime notificationCreateAtDtm;

    @Column(name = "notification_deleted_at_dtm")
    private LocalDateTime notificationDeletedAtDtm;
}
