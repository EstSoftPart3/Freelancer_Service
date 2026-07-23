package com.example.demo.domain.chatroom.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.demo.domain.chatroom.document.ChatMessageDocument;
import com.example.demo.domain.chatroom.dto.ChatMessageResponse;
import com.example.demo.domain.chatroom.dto.ChatMessageSendRequest;
import com.example.demo.domain.chatroom.service.ChatMessageService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatMessageHandler {
	
	private final ChatMessageService chatMessageService;
	private final SimpMessagingTemplate messagingTemplate;
	
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageSendRequest request) {
        ChatMessageDocument saved = chatMessageService.saveMessage(
                request.getChatRoomSq(),
                request.getSenderSq(),
                request.getContent()
        );

        ChatMessageResponse response = ChatMessageResponse.from(saved);
        
        // 해당 방을 구독 중인 클라이언트들에게 push
        messagingTemplate.convertAndSend(
                "/topic/chatrooms/" + request.getChatRoomSq(),
                response
        );
    }
}
