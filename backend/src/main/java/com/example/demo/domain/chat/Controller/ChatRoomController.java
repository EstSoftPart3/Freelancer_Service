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
import com.example.demo.domain.chat.dto.request.ChatRoomTypeSwitchRequest;
import com.example.demo.domain.chat.dto.response.ChatRoomListResponse;
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
	@GetMapping
	public ResponseEntity<ApiResponse<ChatRoomListResponse>> getChatRooms(@AuthenticationPrincipal Long userSq){
		ChatRoomListResponse response = chatRoomService.getChatRoomList(userSq);
		
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK," 채팅방 조회 성공",response));
		
	}

	// 채팅방 타입 변화
	@PatchMapping("/{chatRoomSq}/type")
	public ResponseEntity<ApiResponse<NullType>> switchChatRoomType(
			@AuthenticationPrincipal Long userSq,
			@PathVariable Long chatRoomSq,
			@RequestBody ChatRoomTypeSwitchRequest request){
		
		chatRoomService.switchChatRoomType(userSq, chatRoomSq, request);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "타입 전환 완료",null));
	}

}
