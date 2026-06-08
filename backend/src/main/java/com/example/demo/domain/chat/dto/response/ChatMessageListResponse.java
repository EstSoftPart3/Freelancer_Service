package com.example.demo.domain.chat.dto.response;

import java.util.List;

import com.example.demo.domain.chat.dto.ChatMessagesVo;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatMessageListResponse {
	
	private List<ChatMessagesVo> messageList;

}
