package com.example.demo.domain.chat.service;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.chat.dto.ChatMessagesVo;
import com.example.demo.domain.chat.dto.SenderType;
import com.example.demo.domain.chat.dto.request.ChatMessageSendRequest;
import com.example.demo.domain.chat.dto.response.ChatMessageListResponse;
import com.example.demo.domain.chat.dto.response.ChatMessageResponse;
import com.example.demo.domain.chat.mapper.ChatMessageMapper;
import com.example.demo.domain.chat.mapper.ChatroomMapper;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {
	
	private final ChatMessageMapper chatMessageMapper;
	private final ChatroomMapper chatroomMapper;
	private final UserService userService;
	
	@Transactional
	public ChatMessageResponse saveUserMessage(
			Long userSq,
			ChatMessageSendRequest request
			) {
		validateMessage(request);
		
		int result = chatroomMapper.existsUserChatroom(request.getChatroomSq(), userSq);
		if (result == 0) {
			throw new IllegalArgumentException("채팅방 접근 권한이 없습니다.");
		}
		
		return saveMessage(
				request.getChatroomSq(),
				SenderType.USER,
				request.getMessageContent()
				);
	}
	
	
	@Transactional
	public ChatMessageResponse saveCounselorMessage(
			Long userSq,
			ChatMessageSendRequest request
			) {
		validateMessage(request);
		validateCounselor(userSq);
		
		
		if(chatroomMapper.existsCounselerChatroom(request.getChatroomSq()) == 0) {
			throw new IllegalArgumentException("상담사 전환된 채팅방이 압니다.");
		}
		
		return saveMessage(
				request.getChatroomSq(),
				SenderType.COUNSELOR,
				request.getMessageContent()
				);
	}
	
	
	@Transactional(readOnly = true)
	public ChatMessageListResponse getMessages(
			Long chatroomSq,
			Long userSq
			) {
		int exists = chatroomMapper.existsUserChatroom(chatroomSq, userSq);
		if(exists != 1) {
			throw new IllegalArgumentException("접근할 수 없는 채팅방입니다.");
		}
		
		List<ChatMessagesVo> messageList = chatMessageMapper.selectMessageByChatroom(chatroomSq);
		return ChatMessageListResponse.builder()
				.messageList(messageList)
				.build();
	}
	
	
	@Transactional(readOnly = true)
	public ChatMessageListResponse getCounselorMessages(
			Long chatroomSq,
			Long counselorSq
			) {
		validateCounselor(counselorSq);
		
		List<ChatMessagesVo> messageList = chatMessageMapper.selectMessageByChatroom(chatroomSq);
		
		return ChatMessageListResponse.builder()
				.messageList(messageList)
				.build();
	}
	
	
	
	
	public ChatMessageResponse saveMessage(
			Long chatroomSq,
			SenderType senderType,
			String messageContent
			) {
	
	LocalDateTime time = LocalDateTime.now();
	ChatMessagesVo vo = ChatMessagesVo.builder()
			.chatroomSq(chatroomSq)
			.senderType(senderType)
			.messageContent(messageContent)
			.messageCreatedAt(time)
			.build();
	
	chatMessageMapper.insertChatMessage(vo);
	
	chatroomMapper.updateLastMessage(chatroomSq, messageContent, time);
	
	return ChatMessageResponse.builder()
			.chatMessagesSq(vo.getChatMessagesSq())
			.chatroomSq(chatroomSq)
			.senderType(senderType)
			.messageContent(messageContent)
			.messageCreatedAt(time)
			.build();
	}
	
	private void validateMessage(ChatMessageSendRequest request) {
		if(request == null || request.getChatroomSq() == null || request.getMessageContent() == null || request.getMessageContent().trim().isEmpty()){
			
			throw new IllegalArgumentException("메시지 요청 값이 올바르지 않습니다.");
		}
	}
	
	
	private void validateCounselor(Long userSq) {
		LoginResponseDTO userVo = userService.getUserInfoByUserSq(userSq);
		if (userVo == null) {
			throw new IllegalArgumentException("사용자 정보가 없습니다.");
		}
		if(userVo.getUserTypeCd() != 302L && !userVo.getUserNm().equals("김상담")) {
			throw new IllegalArgumentException("상담사 권한이 없습니다");
		}
	}
}