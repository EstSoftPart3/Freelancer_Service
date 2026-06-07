package com.example.demo.domain.chat.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.chat.dto.ChatRoomVo;

@Mapper
public interface ChatRoomMapper {
	void insertChatRoom(ChatRoomVo chatRoom);
	List<ChatRoomVo> selectChatRoomList(Long userSq);
	int updateChatRoomType(ChatRoomVo chatRoomVo);
	int updateLastMessage(
			@Param("chatroomSq") Long chatroomSq,
			@Param("lastMessage") String lastMessage,
			@Param("lastMessageAt") LocalDateTime lastMessageAt
			);
	
	// 해당 사용자의 채팅방이 맞는지 확인
	int existsUserChatRoom(
			@Param("chatroomSq") Long chatroomSq,
			@Param("userSq") Long userSq
			);
	
	// 해당 상담자의 채팅방이 맞는지
	int existsCounselerChatRoom(
			@Param("chatroomSq") Long chatroomSq
			);
	
	
	
	
	
}
