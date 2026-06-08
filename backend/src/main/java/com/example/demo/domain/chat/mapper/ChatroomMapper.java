package com.example.demo.domain.chat.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.chat.dto.ChatroomVo;

@Mapper
public interface ChatroomMapper {
	void insertChatroom(ChatroomVo chatroom);
	int updateChatroomType(ChatroomVo chatroomVo);
	int updateLastMessage(
			@Param("chatroomSq") Long chatroomSq,
			@Param("lastMessage") String lastMessage,
			@Param("lastMessageAt") LocalDateTime lastMessageAt
			);
	
	// 해당 사용자의 채팅방이 맞는지 확인
	int existsUserChatroom(
			@Param("chatroomSq") Long chatroomSq,
			@Param("userSq") Long userSq
			);
	
	// 해당 상담자의 채팅방이 맞는지
	int existsCounselerChatroom(
			@Param("chatroomSq") Long chatroomSq
			);
	
	
	// 채팅방 조회
	List<ChatroomVo> selectChatroomByUser(
			@Param("userSq") Long userSq
			);
	// 상담 채팅방 조회
	List<ChatroomVo> selectCounselorRooms();
	
}
