package com.example.demo.domain.chat.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.chat.dto.ChatMessagesVo;

@Mapper
public interface ChatMessageMapper {
	int insertChatMessage(ChatMessagesVo chatMessageVo);
}
