package com.example.demo.domain.notification.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.notification.dto.NotificationDTO;
import com.example.demo.domain.notification.dto.response.NotificationResponse;

@Mapper
public interface NotificationMapper {

    // ====================== 기본 CRUD ======================

    void insert(NotificationDTO dto);

    void insertBatch(List<NotificationDTO> dtoList);

    NotificationDTO findBySq(@Param("notificationSq") Long notificationSq);

    void updateReadStatus(
            @Param("notificationSq") Long notificationSq,
            @Param("notificationIsReadYn") String isRead
    );

    void updateDeleteStatus(
            @Param("notificationSq") Long notificationSq,
            @Param("notificationIsDeletedYn") String isDeleted,
            @Param("notificationDeletedAtDtm") LocalDateTime deletedAt
    );

    // ====================== 조회 ======================

    // 모달용(읽지 않은 알림)
    List<NotificationResponse> findUnreadByUser(@Param("userSq") Long userSq);

    // 커서 기반(기존 유지)
    List<NotificationResponse> findAllByUser(
            @Param("userSq") Long userSq,
            @Param("cursor") Long cursor,
            @Param("size") int size
    );

    // ====================== 페이지 번호 기반 Pagination ======================

    // 전체(삭제되지 않은) 개수
    int countByUser(@Param("userSq") Long userSq);

    // 전체(삭제되지 않은) 목록 - offset 기반
    List<NotificationResponse> findAllByUserPage(
            @Param("userSq") Long userSq,
            @Param("offset") int offset,
            @Param("size") int size
    );

    // ====================== ✅ 휴지통 기능 (삭제됨 알림) ======================

    // 휴지통(삭제됨) 개수
    int countTrashByUser(@Param("userSq") Long userSq);

    // 휴지통(삭제됨) 목록 - offset 기반
    List<NotificationResponse> findTrashByUserPage(
            @Param("userSq") Long userSq,
            @Param("offset") int offset,
            @Param("size") int size
    );

    // 선택 복구: 삭제 Y -> N, deleted_at NULL
    int restoreByIds(
            @Param("userSq") Long userSq,
            @Param("notificationIds") List<Long> notificationIds
    );

    // 선택 영구삭제: DB에서 실제 삭제
    int deleteByIds(
            @Param("userSq") Long userSq,
            @Param("notificationIds") List<Long> notificationIds
    );
}
