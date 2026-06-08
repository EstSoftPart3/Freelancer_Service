package com.example.demo.domain.chat.Controller;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.chat.dto.response.ChatMessageListResponse;
import com.example.demo.domain.chat.service.ChatMessageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/chatmessages")
public class ChatMessageController {
	private final ChatMessageService chatMessageService;
	
	@GetMapping("/{chatroomSq}/messages")
	public ResponseEntity<ApiResponse<ChatMessageListResponse>> getMessages(
			@PathVariable Long chatroomSq,
			@AuthenticationPrincipal Long userSq
			
			){
		ChatMessageListResponse response = chatMessageService.getMessages(
				chatroomSq,
				userSq
				);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "채팅 메시지가 조회됐습니다.", response));
	}
	
	@GetMapping("/counselor/{chatroomSq}/messages")
	public ResponseEntity<ApiResponse<ChatMessageListResponse>> getCounselorMessages(
			@PathVariable Long chatroomSq,
			@AuthenticationPrincipal Long userSq
			){
		
		ChatMessageListResponse response = chatMessageService.getCounselorMessages(chatroomSq, userSq);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "상담방 메시지가 조회됐습니다.", response));
	}
	

}
