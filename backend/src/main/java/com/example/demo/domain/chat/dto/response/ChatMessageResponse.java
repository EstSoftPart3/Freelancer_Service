package com.example.demo.domain.chat.dto.response;

import java.time.LocalDateTime;

import com.example.demo.domain.chat.dto.SenderType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {
	private Long chatMessagesSq;
	private Long chatroomSq;
	private SenderType senderType;
	private String messageContent;
	private LocalDateTime messageCreatedAt;
	
	
}
