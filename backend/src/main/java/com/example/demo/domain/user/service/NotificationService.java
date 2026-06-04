package com.example.demo.domain.user.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.user.dto.request.NotificationBatchRequestDTO;
import com.example.demo.domain.user.dto.request.NotificationRequestDTO;
import com.example.demo.domain.user.dto.request.NotificationSearchDTO;
import com.example.demo.domain.user.dto.response.NotificationListResponse;
import com.example.demo.domain.user.dto.response.NotificationResponseDTO;
import com.example.demo.domain.user.mapper.NotificationMapper;
import com.example.demo.domain.user.mapper.UserMapper;
import com.example.demo.domain.user.util.EmailSender;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;
    private final UserMapper userMapper;
    private final EmailSender emailSender;

    // 1. 알림 목록 조회
    public NotificationListResponse getNotificationList(Long userSq, NotificationSearchDTO notificationSearchDTO) {

    	System.out.println(notificationSearchDTO.toString());
    	List<NotificationResponseDTO> notifications = notificationMapper.selectNotificationList(userSq, notificationSearchDTO);
        
    	Long totalCount = notificationMapper.countNotificationList(userSq, notificationSearchDTO);
        
    	NotificationListResponse response = new NotificationListResponse();
    	
    	response.setNotifications(notifications);
    	response.setPage(notificationSearchDTO.getPage());
    	response.setSize(notificationSearchDTO.getSize());
    	response.setTotalCount(totalCount);
    	response.setTotalPages((int)Math.ceil((double)totalCount / notificationSearchDTO.getSize()));
    	        
    	return response;
    }

    // 1-2. 최근 알림 목록 조회(5개)
    public List<NotificationResponseDTO> getRecentNotifications(Long userSq) {
    	return notificationMapper.selectRecentNotifications(userSq);
    }       
    
    // 2. 안 읽은 알림 수 조회
    public int getUnreadCount(Long userSq) {
        return notificationMapper.selectUnreadNotificationCnt(userSq);
    }

    // 3. 공통 알림 발송 메서드
    @Transactional
    public void send(Long receiver, Long sender, Long type, String content, String url) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setReceiverUserSq(receiver);
        dto.setSenderUserSq(sender);
        dto.setNotificationTypeCd(type);
        dto.setNotificationContentTxt(content);
        dto.setNotificationTargetUrl(url);

        notificationMapper.insertNotification(dto);

        String email = userMapper.selectEmailByUserSq(receiver);
        if (email != null) {
            String subject = "[프리랜서 플랫폼] 새 알림이 도착했습니다.";
            String body = "<h3>새 알림</h3><p>" + content + "</p>";
            emailSender.sendAsync(email, subject, body);
        }
    }

    // 4. 읽음 처리
    @Transactional
    public void markAsRead(Long notificationSq) {
        notificationMapper.updateNotificationRead(notificationSq);
    }

    // 5. 삭제 처리
    @Transactional
    public void removeNotification(Long notificationSq) {
        notificationMapper.deleteNotification(notificationSq);
    }

    // 6. 모두 읽음 처리
    @Transactional
    public void markAllAsRead(Long userSq) {
        notificationMapper.updateAllNotificationsRead(userSq);
    }

    // 7. 전체 삭제
    @Transactional
    public void removeAllNotifications(Long userSq) {
        notificationMapper.deleteAllNotifications(userSq);
    }

    // 알림 대량 등록 (Batch Insert)
    @Transactional
    public void insertNotificationBatch(List<NotificationBatchRequestDTO> list) {
        notificationMapper.insertNotificationBatch(list);
    }

}