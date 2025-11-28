package com.example.demo.domain.notification.service;



import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.demo.domain.notification.dto.NotificationDTO;
import com.example.demo.domain.notification.dto.response.NotificationPageResponse;
import com.example.demo.domain.notification.dto.response.NotificationResponse;
import com.example.demo.domain.notification.event.NotificationEvent;
import com.example.demo.domain.notification.mapper.NotificationMapper;
import com.example.demo.domain.user.mapper.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
	
	private static final int MAX_PAGE_SIZE = 50;

	private final NotificationMapper notificationMapper;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
	public void createNotification(NotificationDTO dto) {
		validateDto(dto);
		validateUser(dto.getUserSq());
		
		dto.setNotificationIsReadYn("N");
		dto.setNotificationIsDeletedYn("N");
		dto.setNotificationCreatedAtDtm(LocalDateTime.now());
		
		notificationMapper.insert(dto);
		
		NotificationResponse response = toResponse(dto);
		eventPublisher.publishEvent(new NotificationEvent(dto.getUserSq(), response));
	}
	
	private void validateDto(NotificationDTO dto) {
		if (dto.getUserSq() == null) {
			throw new IllegalArgumentException("수신자가 저장되지 않았습니다.");
		}
		
		if (dto.getNotificationTypeCd() == null) {
			throw new IllegalArgumentException("알림 타입이 지정되지 않았습니다.");
		}
		
		if (dto.getNotificationTtl() == null || dto.getNotificationTtl().isBlank()) {
			throw new IllegalArgumentException("알림 제목이 없습니다.");
		}
	}
	
	private void validateUser(Long userSq) {
		if (!userMapper.existsByUserSq(userSq)) {
			throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
		}
	}
	
	// 읽음 처리
	public void changeReadStatus(Long notificationSq, Long currentUserSq) {
		NotificationDTO notification = findNotification(notificationSq);
		
		validateUserSq(notification, currentUserSq);

		if (isNotificationDeleted(notification)) return;
		if ("Y".equals(notification.getNotificationIsReadYn())) return;

		notificationMapper.updateReadStatus(notificationSq, "Y");
	}
	
	// notification 조회 및 null 처리
	private NotificationDTO findNotification(Long notificationSq) {
		NotificationDTO notification = notificationMapper.findBySq(notificationSq);
		if (notification == null) {
			throw new IllegalArgumentException("알림이 존재하지 않습니다.");
		}
		
		return notification;
	}
	
	// 삭제
	public void deleteNotification(Long notificationSq, Long currentUserSq) {
		NotificationDTO notification =  findNotification(notificationSq);
		validateUserSq(notification, currentUserSq);
		
		if (isNotificationDeleted(notification)) return;
		
		notificationMapper.updateDeleteStatus(notificationSq, "Y", LocalDateTime.now());
	}

	// 삭제 확인
	private boolean isNotificationDeleted(NotificationDTO notification) {
		return "Y".equals(notification.getNotificationIsDeletedYn());
	}
	
	// 본인 확인
	private void validateUserSq(NotificationDTO dto, Long userSq) {
		if(!userSq.equals(dto.getUserSq())) {
			throw new IllegalArgumentException("사용자가 일치하지 않습니다.");
		}
	}
	
	// 모달 조회
	@Transactional(readOnly = true)
	public List<NotificationResponse> getUnreadNotifications(Long userSq) {
		validateUser(userSq);
		return notificationMapper.findUnreadByUser(userSq);
	}
	
	// 페이지 조회
	@Transactional(readOnly = true)
	public NotificationPageResponse getAllNotifications(Long userSq, Long cursor, int size) {
		if (size <= 0) {
			throw new IllegalArgumentException("페이지 크기는 1 이상이어야 합니다.");
		}
		
		int pageSize = Math.min(size, MAX_PAGE_SIZE);
		
		validateUser(userSq);
		
		List<NotificationResponse> notifications = notificationMapper.findAllByUser(userSq, cursor, pageSize + 1);
		
		boolean hasNext = notifications.size() > pageSize;
		if (hasNext) {
			notifications = notifications.subList(0, pageSize);
		}
		
		Long nextCursor = notifications.isEmpty() ? null
				: notifications.get(notifications.size() - 1).getNotificationSq();
		
		return NotificationPageResponse.builder()
				.notifications(notifications)
				.nextCursor(nextCursor)
				.hasNext(hasNext)
				.build();
	}
	
    private NotificationResponse toResponse(NotificationDTO dto) {
    	return NotificationResponse.builder()
    			.notificationSq(dto.getNotificationSq())
    			.notificationTypeCd(dto.getNotificationTypeCd())
                .notificationTargetTypeCd(dto.getNotificationTargetTypeCd())
                .notificationTargetSq(dto.getNotificationTargetSq())
                .notificationTargetParentTypeCd(dto.getNotificationTargetParentTypeCd())
                .notificationTargetParentSq(dto.getNotificationTargetParentSq())
                .notificationTtl(dto.getNotificationTtl())
                .notificationTxt(dto.getNotificationTxt())
                .notificationIsReadYn(dto.getNotificationIsReadYn())
                .notificationCreatedAtDtm(dto.getNotificationCreatedAtDtm())
                .build();
    }
	

}
