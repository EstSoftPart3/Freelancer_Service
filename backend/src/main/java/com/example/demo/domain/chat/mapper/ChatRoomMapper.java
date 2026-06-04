package com.example.demo.domain.chat.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.chat.dto.ChatRoomVo;

@Mapper
public interface ChatRoomMapper {
	void insertChatRoom(ChatRoomVo chatRoom);
	List<ChatRoomVo> selectChatRoomList(Long userSq);
	
}
