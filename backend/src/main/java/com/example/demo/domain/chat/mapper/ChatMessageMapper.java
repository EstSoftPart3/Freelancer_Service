package com.example.demo.domain.chat.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.chat.dto.ChatMessagesVo;

@Mapper
public interface ChatMessageMapper {
	int insertChatMessage(ChatMessagesVo chatMessageVo);
	List<ChatMessagesVo> selectMessageByChatroom(
			@Param("chatroomSq") Long chatroomSq
			);
	
}
