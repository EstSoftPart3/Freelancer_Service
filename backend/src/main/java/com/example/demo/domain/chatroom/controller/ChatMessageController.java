package com.example.demo.domain.chatroom.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.chatroom.document.ChatMessageDocument;
import com.example.demo.domain.chatroom.dto.ChatMessageResponse;
import com.example.demo.domain.chatroom.service.ChatMessageService;
import com.example.demo.domain.chatroom.service.ChatroomService;
import com.example.demo.domain.user.util.JwtAuthenticationToken;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chatrooms/{chatRoomSq}/messages")
@RequiredArgsConstructor
public class ChatMessageController {

	private final ChatMessageService chatMessageService;
	private final ChatroomService chatroomService;
	
	@GetMapping
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @PathVariable Long chatRoomSq,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "30") int size
    ) {
		List<ChatMessageResponse> messages = chatMessageService.getMessages(chatRoomSq, cursor, size)
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
		
		 return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "채팅 이력 조회 성공", messages));
    }
	
	@PatchMapping("/read")
	public ResponseEntity<ApiResponse<Void>> markAsRead(
	        @PathVariable Long chatRoomSq,
	        Authentication authentication
	) {
	    JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
	    Long userSq = (Long) token.getPrincipal();

	    chatroomService.markAsRead(userSq, chatRoomSq);
	    return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "읽음 처리 성공", null));
	}
	
}
