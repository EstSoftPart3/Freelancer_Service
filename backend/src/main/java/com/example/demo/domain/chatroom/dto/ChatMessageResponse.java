package com.example.demo.domain.chatroom.dto;

import java.time.LocalDateTime;

import com.example.demo.domain.chatroom.document.ChatMessageDocument;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Builder
public class ChatMessageResponse {
	@Builder.Default
	private String eventType = "MESSAGE";
    private Long chatMsgSq;
    private Long chatRoomSq;
    private Long senderSq;
    private String content;
    private LocalDateTime sentAt;
    
    public static ChatMessageResponse from(ChatMessageDocument doc) {
        return ChatMessageResponse.builder()
                .chatMsgSq(doc.getChatMsgSq())
                .chatRoomSq(doc.getChatRoomSq())
                .senderSq(doc.getSenderSq())
                .content(doc.getMessageContent())
                .sentAt(doc.getMessageCreatedAt())
                .build();
    }
}
