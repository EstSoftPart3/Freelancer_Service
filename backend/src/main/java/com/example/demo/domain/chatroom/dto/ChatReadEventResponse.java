package com.example.demo.domain.chatroom.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Builder
public class ChatReadEventResponse {
    @Builder.Default
    private String eventType = "READ";
    private Long chatRoomSq;
    private String readerType;   // "PERSONAL" or "COMPANY"
    private Long lastReadMsgSq;
}