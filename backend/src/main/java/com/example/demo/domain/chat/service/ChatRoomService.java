package com.example.demo.domain.chat.service;

import org.springframework.stereotype.Service;

import com.example.demo.domain.chat.dto.ChatRoomVo;
import com.example.demo.domain.chat.mapper.ChatRoomMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
	private static final String INITIAL_MESSAGE = "안녕하세요. 무엇을 도와드릴까요?";
	
	private final ChatRoomMapper chatRoomMapper;
	
	@Transactional
	public void createChatRoom(Long userSq) {
		ChatRoomVo chatRoom = ChatRoomVo.builder().
				userSq(userSq).
				lastMessage(INITIAL_MESSAGE).
				build();
		
		chatRoomMapper.insertChatRoom(chatRoom);
				}

}
