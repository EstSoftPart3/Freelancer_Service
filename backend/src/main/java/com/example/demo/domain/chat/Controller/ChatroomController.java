package com.example.demo.domain.chat.Controller;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.chat.dto.request.ChatroomTypeSwitchRequest;
import com.example.demo.domain.chat.dto.response.ChatroomListResponse;
import com.example.demo.domain.chat.service.ChatroomService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatroomController {

	private final ChatroomService chatroomService;

	// 채팅방 생성
	@PostMapping
	public ResponseEntity<ApiResponse<NullType>> createChatroom(@AuthenticationPrincipal Long userSq){
		
		chatroomService.createChatroom(userSq);
		
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "채팅방 생성 완료", null));
	}

	// 채팅방 조회
	@GetMapping
	public ResponseEntity<ApiResponse<ChatroomListResponse>> getChatrooms(@AuthenticationPrincipal Long userSq){
		ChatroomListResponse response = chatroomService.getChatrooms(userSq);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK," 채팅방 조회 성공",response));
		
	}
	
	@GetMapping("/counselor")
	public ResponseEntity<ApiResponse<ChatroomListResponse>> getCounselorChatrooms(
			@AuthenticationPrincipal Long userSq
			){
		
		ChatroomListResponse response = chatroomService.getCounselorChatrooms(userSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "상담방 조회 성공", response));
	}

	// 채팅방 타입 변화
	@PatchMapping("/{chatroomSq}/type")
	public ResponseEntity<ApiResponse<NullType>> switchChatroomType(
			@AuthenticationPrincipal Long userSq,
			@PathVariable Long chatroomSq,
			@RequestBody ChatroomTypeSwitchRequest request){
		
		chatroomService.switchChatroomType(userSq, chatroomSq, request);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "타입 전환 완료",null));
	}

}
