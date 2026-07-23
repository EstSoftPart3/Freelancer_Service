package com.example.demo.domain.chatroom.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.domain.chatroom.document.ChatMessageDocument;

public interface ChatMessageRepository extends MongoRepository<ChatMessageDocument, String>{

    // 특정 메시지 SQ 단건 조회 (신고 검증용)
    Optional<ChatMessageDocument> findByChatMsgSq(Long chatMsgSq);

    // 커서 기반 이력 조회 - cursor보다 작은 SQ를 최신순으로
    List<ChatMessageDocument> findByChatRoomSqAndChatMsgSqLessThanOrderByChatMsgSqDesc(
        Long chatRoomSq, Long cursor, Pageable pageable
    );

    // 최초 진입(커서 없음) 시 최신 메시지부터
    List<ChatMessageDocument> findByChatRoomSqOrderByChatMsgSqDesc(
        Long chatRoomSq, Pageable pageable
    );

    // 안읽은 메시지 수 계산 (읽음 커서보다 큰 SQ 개수)
    long countByChatRoomSqAndChatMsgSqGreaterThan(Long chatRoomSq, Long lastReadMsgSq);

    // 채팅방 목록의 마지막 메시지 캐싱 갱신용 - 방별 최신 1건
    Optional<ChatMessageDocument> findFirstByChatRoomSqOrderByChatMsgSqDesc(Long chatRoomSq);
}
