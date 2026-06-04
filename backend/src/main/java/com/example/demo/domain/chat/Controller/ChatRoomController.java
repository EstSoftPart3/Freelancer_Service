package com.example.demo.domain.chat.Controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.chat.service.ChatRoomService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatRoomController {

	private final ChatRoomService chatRoomService;

	// 채팅방 생성
	@PostMapping
	public ResponseEntity<ApiResponse<NullType>> createChatRoom(@AuthenticationPrincipal Long userSq){
		
		chatRoomService.createChatRoom(userSq);
		
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "채팅방 생성 완료", null));
	}

	// 채팅방 조회

	// 채팅방 삭제

}
