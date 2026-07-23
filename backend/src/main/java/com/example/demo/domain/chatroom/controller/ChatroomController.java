package com.example.demo.domain.chatroom.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.chatroom.dto.ChatRoomListItemDto;
import com.example.demo.domain.chatroom.dto.ChatRoomListResultDto;
import com.example.demo.domain.chatroom.service.ChatroomService;
import com.example.demo.domain.user.util.JwtAuthenticationToken;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chatrooms")
@RequiredArgsConstructor
@CrossOrigin(value = "http://localhost:8504")
public class ChatroomController {
	
    private final ChatroomService chatroomService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatRoomListItemDto>> createOrGetRoom(
            @RequestParam Long projectSq,
            Authentication authentication
    ) {
    	JwtAuthenticationToken token = null;
		if (authentication != null) {
			token = (JwtAuthenticationToken) authentication;
		}
        Long userSq = (Long) token.getPrincipal();
        
    	ChatRoomListItemDto result = chatroomService.createOrGetRoom(userSq, projectSq);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK,"채팅룸 생성 성공",result));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<ChatRoomListResultDto>> getRoomList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
    	JwtAuthenticationToken token = null;
		if (authentication != null) {
			token = (JwtAuthenticationToken) authentication;
		}
        Long userSq = (Long) token.getPrincipal();

        ChatRoomListResultDto result = chatroomService.getRoomList(userSq, page, size);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "채팅방 목록 조회 성공", result));
    }
}
