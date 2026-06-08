package com.example.demo.domain.chat.Controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.demo.domain.chat.dto.request.ChatMessageSendRequest;
import com.example.demo.domain.chat.dto.response.ChatMessageResponse;
import com.example.demo.domain.chat.service.ChatMessageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatMessageController {
	
	private final ChatMessageService chatMessageService;
	private final SimpMessagingTemplate messageingTemplate;
	
	@MessageMapping("/chat/send")
	public void sendMessage(ChatMessageSendRequest request, Principal principal) {

		
		Long userSq = Long.parseLong(principal.getName());
		
		String destination = "/sub/chat/room/" + request.getChatroomSq();

		
		ChatMessageResponse response = chatMessageService.saveUserMessage(userSq, request);
		

		messageingTemplate.convertAndSend(
				"/sub/chat/room/" + response.getChatroomSq(),
				response
				);
		
		

		
	}
	
	
	@MessageMapping("/counselor/chat/send")
	public void sendCounselorMessage(
			ChatMessageSendRequest request,
			Principal principal
			) {
		Long userSq = Long.parseLong(principal.getName());
		ChatMessageResponse response = chatMessageService.saveCounselorMessage(userSq, request);
		messageingTemplate.convertAndSend(
				"/sub/chat/room/" + response.getChatroomSq(),
				response
				);
		
	}
}
