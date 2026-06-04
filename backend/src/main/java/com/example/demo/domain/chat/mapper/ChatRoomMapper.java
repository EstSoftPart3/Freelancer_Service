package com.example.demo.domain.chat.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.chat.dto.ChatRoomVo;

@Mapper
public interface ChatRoomMapper {
	void insertChatRoom(ChatRoomVo chatRoom);
	
}
