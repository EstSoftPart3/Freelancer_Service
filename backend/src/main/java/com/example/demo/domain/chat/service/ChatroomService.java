package com.example.demo.domain.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.chat.dto.ChatroomVo;
import com.example.demo.domain.chat.dto.request.ChatroomTypeSwitchRequest;
import com.example.demo.domain.chat.dto.response.ChatroomListResponse;
import com.example.demo.domain.chat.mapper.ChatroomMapper;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatroomService {
	private static final String INITIAL_MESSAGE = "안녕하세요. 무엇을 도와드릴까요?";
	private final ChatroomMapper chatroomMapper;
	private final UserService userService;
	
	@Transactional
	public void createChatroom(Long userSq) {
//		isUserIdExists 사용해서 userSq 조회
		ChatroomVo chatroom = ChatroomVo.builder().
				userSq(userSq).
				lastMessage(INITIAL_MESSAGE).
				build();
		
		chatroomMapper.insertChatroom(chatroom);
				}
	
	
	
	
	@Transactional
	public void switchChatroomType(Long userSq,Long chatroomSq, ChatroomTypeSwitchRequest request) {
		if(userSq == null) {
			throw new IllegalArgumentException(" 로그인이 필요합니다.");
		}
		
		if(chatroomSq == null) {
			throw new IllegalArgumentException("없는 채팅방입니다.");
		}
		if(request == null || request.getChatroomType() == null) {
			throw new IllegalArgumentException("채팅방 타입을 말씀해주세요");
		}
		
		
		ChatroomVo chatroom = ChatroomVo.builder()
				.chatroomSq(chatroomSq)
				.userSq(userSq)
				.chatroomType(request.getChatroomType())
				.build();
		
		int result = chatroomMapper.updateChatroomType(chatroom);
		
		if(result == 0) {
			throw new IllegalArgumentException("채팅방이 없거나 소유자가 아닙니다");
		}
		
		
	}

	
	@Transactional(readOnly = true)
	public ChatroomListResponse getChatrooms(Long userSq) {
		List<ChatroomVo> chatroomList = chatroomMapper.selectChatroomByUser(userSq);
		
		return ChatroomListResponse.builder()
				.chatroomList(chatroomList)
				.build();
		
	}
	
	@Transactional(readOnly = true)
	public ChatroomListResponse getCounselorChatrooms(Long counselorSq) {
		
		validateCounselor(counselorSq);
		List<ChatroomVo> chatroomList = chatroomMapper.selectCounselorRooms();
		
		return ChatroomListResponse.builder()
				.chatroomList(chatroomList)
				.build();
		
	}
	
	private void validateCounselor(Long userSq) {
		LoginResponseDTO user = userService.getUserInfoByUserSq(userSq);
		if (user == null) {
			throw new IllegalArgumentException("사용자 정보가 없습니다.");
		}
		if(user.getUserTypeCd() != 302L && !user.getUserNm().equals("김상담")) {
			throw new IllegalArgumentException("상담사 권한이 없습니다");
		}
	}
}
