package com.example.demo.domain.chatroom.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChatMessageSendRequest {
    private Long chatRoomSq;
    private Long senderSq;
    private String content;
}
