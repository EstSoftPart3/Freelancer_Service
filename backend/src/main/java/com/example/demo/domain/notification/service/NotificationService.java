package com.example.demo.domain.notification.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

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

		try {
			notificationMapper.insert(dto);
		} catch (DuplicateKeyException e) {
			log.warn("알림 중복 저장 userSq = {}, notificationSq = {}", dto.getUserSq(), dto.getNotificationSq());
		}

		NotificationResponse response = toResponse(dto);
		eventPublisher.publishEvent(new NotificationEvent(dto.getUserSq(), response));
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void createBatchNotification(List<NotificationDTO> dtoList) {
		if (dtoList == null || dtoList.isEmpty()) {
			return;
		}

		LocalDateTime now = LocalDateTime.now();
		dtoList.forEach(dto -> {
			dto.setNotificationIsReadYn("N");
			dto.setNotificationIsDeletedYn("N");
			dto.setNotificationCreatedAtDtm(now);
		});

		notificationMapper.insertBatch(dtoList);

		dtoList.forEach(dto -> {
			NotificationResponse response = toResponse(dto);
			eventPublisher.publishEvent(new NotificationEvent(dto.getUserSq(), response));
		});
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

	// ================= 읽음 처리 =================
	public void changeReadStatus(Long notificationSq, Long currentUserSq) {
		NotificationDTO notification = findNotification(notificationSq);
		validateUserSq(notification, currentUserSq);

		if (isNotificationDeleted(notification)) return;
		if ("Y".equals(notification.getNotificationIsReadYn())) return;

		notificationMapper.updateReadStatus(notificationSq, "Y");
	}

	private NotificationDTO findNotification(Long notificationSq) {
		NotificationDTO notification = notificationMapper.findBySq(notificationSq);
		if (notification == null) {
			throw new IllegalArgumentException("알림이 존재하지 않습니다.");
		}
		return notification;
	}

	// ================= 삭제 (소프트 삭제: 휴지통 이동) =================
	public void deleteNotification(Long notificationSq, Long currentUserSq) {
		NotificationDTO notification = findNotification(notificationSq);
		validateUserSq(notification, currentUserSq);

		if (isNotificationDeleted(notification)) return;

		notificationMapper.updateDeleteStatus(notificationSq, "Y", LocalDateTime.now());
	}

	private boolean isNotificationDeleted(NotificationDTO notification) {
		return "Y".equals(notification.getNotificationIsDeletedYn());
	}

	private void validateUserSq(NotificationDTO dto, Long userSq) {
		if (!userSq.equals(dto.getUserSq())) {
			throw new IllegalArgumentException("사용자가 일치하지 않습니다.");
		}
	}

	// ================= 모달 알림 조회 =================
	@Transactional(readOnly = true)
	public List<NotificationResponse> getUnreadNotifications(Long userSq) {
		validateUser(userSq);
		return notificationMapper.findUnreadByUser(userSq);
	}

	// ================= 페이지 번호 기반 조회 (페이지네이션) =================
	@Transactional(readOnly = true)
	public NotificationPageResponse getAllNotificationsByPage(Long userSq, int page, int size) {

		if (page < 1) {
			throw new IllegalArgumentException("페이지 번호는 1 이상이어야 합니다.");
		}
		if (size <= 0) {
			throw new IllegalArgumentException("페이지 크기는 1 이상이어야 합니다.");
		}

		int pageSize = Math.min(size, MAX_PAGE_SIZE);
		int offset = (page - 1) * pageSize;

		validateUser(userSq);

		int totalCount = notificationMapper.countByUser(userSq);
		List<NotificationResponse> notifications =
				notificationMapper.findAllByUserPage(userSq, offset, pageSize);

		int totalPages = (int) Math.ceil((double) totalCount / pageSize);
		boolean hasNext = page < totalPages;

		return NotificationPageResponse.builder()
				.notifications(notifications)
				.page(page)
				.size(pageSize)
				.totalCount((long) totalCount)
				.totalPages(totalPages)
				.hasNext(hasNext)
				.build();
	}

	/* ============================================================
	   ✅ 추가: 휴지통(삭제된 알림) 조회 / 복구 / 영구삭제
	   ============================================================ */

	// ✅ 휴지통(삭제됨) 페이지 번호 기반 조회 (페이지네이션)
	@Transactional(readOnly = true)
	public NotificationPageResponse getTrashNotificationsByPage(Long userSq, int page, int size) {

		if (page < 1) {
			throw new IllegalArgumentException("페이지 번호는 1 이상이어야 합니다.");
		}
		if (size <= 0) {
			throw new IllegalArgumentException("페이지 크기는 1 이상이어야 합니다.");
		}

		int pageSize = Math.min(size, MAX_PAGE_SIZE);
		int offset = (page - 1) * pageSize;

		validateUser(userSq);

		int totalCount = notificationMapper.countTrashByUser(userSq);
		List<NotificationResponse> notifications =
				notificationMapper.findTrashByUserPage(userSq, offset, pageSize);

		int totalPages = (int) Math.ceil((double) totalCount / pageSize);
		boolean hasNext = page < totalPages;

		return NotificationPageResponse.builder()
				.notifications(notifications)
				.page(page)
				.size(pageSize)
				.totalCount((long) totalCount)
				.totalPages(totalPages)
				.hasNext(hasNext)
				.build();
	}

	// ✅ 휴지통 복구 (선택 복구: deleted_yn = 'N', deleted_at = null)
	public void restoreNotifications(Long userSq, List<Long> notificationIds) {
		validateUser(userSq);

		if (notificationIds == null || notificationIds.isEmpty()) {
			return;
		}

		notificationMapper.restoreByIds(userSq, notificationIds);
	}

	// ✅ 휴지통 영구 삭제 (선택 삭제: DB에서 DELETE)
	public void deleteNotificationsPermanently(Long userSq, List<Long> notificationIds) {
		validateUser(userSq);

		if (notificationIds == null || notificationIds.isEmpty()) {
			return;
		}

		notificationMapper.deleteByIds(userSq, notificationIds);
	}

	/* ============================================================ */

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
