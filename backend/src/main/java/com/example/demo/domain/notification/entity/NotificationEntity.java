package com.example.demo.domain.notification.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name ="TBL_NOTIFICATION" )
@Data
public class NotificationEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "notification_sq")
	private Long notificationSq;
	
	@Column(name = "notification_type_cd")
	private Long notificationTypeCd;
	
	@Column(name = "notification_target_type_cd")
	private Long notificationTargetTypeCd;
	
	@Column(name = "notification_target_sq")
	private Long notificationTargetSq;
	
	@Column(name = "notification_target_parent_type_cd")
	private Long notificationTargetParentTypeCd;
	
	@Column(name = "notification_target_parent_sq")
	private Long notificationTargetParentSq;
	
	@Column(name = "notification_ttl")
	private String notificationTtl;
	
	@Column(name = "notification_txt")
	private String notificationTxt;
	
	@Column(name = "notification_is_read_yn")
	private String notificationIsReadYn;
	
	@Column(name = "notification_is_deleted_yn")
	private String notificationIsDeletedYn;
	
	@Column(name = "notification_created_at_dtm")
	private LocalDateTime notificationCreatedAtDtm;
	
	@Column(name = "notification_deleted_at_dtm")
	private LocalDateTime notificationDeletedAtDtm;
	
	@Column(name = "user_sq")
	private Long userSq;
	

}
