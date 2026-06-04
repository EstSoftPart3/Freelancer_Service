package com.example.demo.domain.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.chat.dto.ChatRoomVo;
import com.example.demo.domain.chat.dto.request.ChatRoomTypeSwitchRequest;
import com.example.demo.domain.chat.dto.response.ChatRoomListResponse;
import com.example.demo.domain.chat.mapper.ChatRoomMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
	private static final String INITIAL_MESSAGE = "안녕하세요. 무엇을 도와드릴까요?";
	private final ChatRoomMapper chatRoomMapper;
	
	@Transactional
	public void createChatRoom(Long userSq) {
//		isUserIdExists 사용해서 userSq 조회
		ChatRoomVo chatRoom = ChatRoomVo.builder().
				userSq(userSq).
				lastMessage(INITIAL_MESSAGE).
				build();
		
		chatRoomMapper.insertChatRoom(chatRoom);
				}
	
	
	@Transactional(readOnly = true)
	public ChatRoomListResponse getChatRoomList(Long userSq) {
//		isUserIdExists 사용해서 userSq 조회

		List<ChatRoomVo> chatRoomList = chatRoomMapper.selectChatRoomList(userSq);
		
		return ChatRoomListResponse.builder().chatRoomList(chatRoomList).build();
	
	}
	
	@Transactional
	public void switchChatRoomType(Long userSq,Long chatRoomSq, ChatRoomTypeSwitchRequest request) {
		if(userSq == null) {
			throw new IllegalArgumentException(" 로그인이 필요합니다.");
		}
		
		if(chatRoomSq == null) {
			throw new IllegalArgumentException("없는 채팅방입니다.");
		}
		if(request == null || request.getChatRoomType() == null) {
			throw new IllegalArgumentException("채팅방 타입을 말씀해주세요");
		}
		
		
		ChatRoomVo chatRoom = ChatRoomVo.builder()
				.chatroomSq(chatRoomSq)
				.userSq(userSq)
				.chatRoomType(request.getChatRoomType())
				.build();
		
		int result = chatRoomMapper.updateChatRoomType(chatRoom);
		
		if(result == 0) {
			throw new IllegalArgumentException("채팅방이 없거나 소유자가 아닙니다");
		}
		
		
	}

}
