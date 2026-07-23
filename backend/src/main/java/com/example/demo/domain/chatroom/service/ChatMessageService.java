package com.example.demo.domain.chatroom.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.domain.chatroom.document.ChatMessageDocument;
import com.example.demo.domain.chatroom.mapper.ChatroomMapper;
import com.example.demo.domain.chatroom.repository.ChatMessageRepository;
import com.example.demo.domain.chatroom.sequence.ChatMsgSequenceGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
	
	private final ChatMessageRepository chatMessageRepository;
	private final ChatMsgSequenceGenerator sequenceGenerator;
	private final ChatroomMapper chatroomMapper;
	
    /* 메시지 저장 (WebSocket SEND 수신 시 호출) */
    public ChatMessageDocument saveMessage(Long chatRoomSq, Long senderSq, String content) {
        Long chatMsgSq = sequenceGenerator.nextChatMsgSq();

        ChatMessageDocument message = ChatMessageDocument.builder()
            .chatMsgSq(chatMsgSq)
            .chatRoomSq(chatRoomSq)
            .senderSq(senderSq)
            .messageContent(content)
            .messageCreatedAt(LocalDateTime.now())
            .chatMsgDeletedYn("N")
            .build();

        ChatMessageDocument saved = chatMessageRepository.save(message);

        // tbl_chatroom_s.last_message / last_message_at 캐싱 갱신
        chatroomMapper.updateLastMessage(chatRoomSq, content, saved.getMessageCreatedAt());

        return saved;
    }

    /* 채팅 이력 조회 - 커서 기반 페이지네이션 | cursor가 null이면 최신 메시지부터 조회 */
    public List<ChatMessageDocument> getMessages(Long chatRoomSq, Long cursor, int size) {
        Pageable pageable = PageRequest.of(0, size);

        if (cursor == null) {
            return chatMessageRepository
                .findByChatRoomSqOrderByChatMsgSqDesc(chatRoomSq, pageable);
        }

        return chatMessageRepository
            .findByChatRoomSqAndChatMsgSqLessThanOrderByChatMsgSqDesc(chatRoomSq, cursor, pageable);
    }

    /* 신고 등록 전 메시지 존재 검증 */
    public ChatMessageDocument getMessageOrThrow(Long chatMsgSq) {
        return chatMessageRepository.findByChatMsgSq(chatMsgSq)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 메시지입니다."));
    }

    /* 안읽은 메시지 수 (읽음 처리 API / 목록 조회에서 사용) */
    public long countUnread(Long chatRoomSq, Long lastReadMsgSq) {
        long readCursor = lastReadMsgSq != null ? lastReadMsgSq : 0L;
        return chatMessageRepository.countByChatRoomSqAndChatMsgSqGreaterThan(chatRoomSq, readCursor);
    }
    public Long getLatestMsgSq(Long chatRoomSq) {
        return chatMessageRepository.findFirstByChatRoomSqOrderByChatMsgSqDesc(chatRoomSq)
                .map(ChatMessageDocument::getChatMsgSq)
                .orElse(null);
    }
}
