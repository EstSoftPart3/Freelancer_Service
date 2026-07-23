package com.example.demo.domain.chatroom.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.chatroom.dto.ChatRoomListItemDto;

@Mapper
public interface ChatroomMapper {

    Long selectChatRoomSqByProjectAndUser(@Param("projectSq") Long projectSq,
                                           @Param("userSq") Long userSq);

    String selectChatRoomUserDeletedYn(@Param("chatRoomSq") Long chatRoomSq);

    void updateChatRoomUserDeletedYnToN(@Param("chatRoomSq") Long chatRoomSq);

    Long selectCompanySqByProjectSq(@Param("projectSq") Long projectSq);

    void insertChatRoom(ChatRoomListItemDto param);
    // 생성/재사용 이후 상세 정보 채워서 응답용으로 조회
    ChatRoomListItemDto selectChatRoomDetailBySq(@Param("chatRoomSq") Long chatRoomSq);
    
    // 마지막 메세지 정보 업데이트
    void updateLastMessage(
            @Param("chatRoomSq") Long chatRoomSq,
            @Param("lastMessage") String lastMessage,
            @Param("lastMessageAt") LocalDateTime lastMessageAt
    );
    
    // 채팅방 목록 조회
    Long selectCompanySqByUserSq(@Param("userSq") Long userSq);

    List<ChatRoomListItemDto> selectChatRoomListForUser(@Param("userSq") Long userSq,
            @Param("offset") int offset, @Param("size") int size);
    int countChatRoomListForUser(@Param("userSq") Long userSq);

    List<ChatRoomListItemDto> selectChatRoomListForCompany(@Param("companySq") Long companySq,
            @Param("offset") int offset, @Param("size") int size);
    int countChatRoomListForCompany(@Param("companySq") Long companySq);
    
    void updateUserLastReadMsgSq(@Param("chatRoomSq") Long chatRoomSq,
            @Param("lastReadMsgSq") Long lastReadMsgSq);

	void updateCompanyLastReadMsgSq(@Param("chatRoomSq") Long chatRoomSq,
	               @Param("lastReadMsgSq") Long lastReadMsgSq);
    
}
