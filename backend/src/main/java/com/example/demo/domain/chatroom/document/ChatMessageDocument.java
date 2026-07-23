package com.example.demo.domain.chatroom.document;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Builder;
import lombok.Data;

@Document(collection = "chat_messages")
@CompoundIndexes({
    @CompoundIndex(name = "room_seq_idx", def = "{'chatRoomSq': 1, 'chatMsgSq': -1}"),
    @CompoundIndex(name = "room_msg_idx", def = "{'chatRoomSq': 1, 'messageCreatedAt': -1}")
})
@Data
@Builder
public class ChatMessageDocument {
    
	@Id
    private String id;                 // Mongo ObjectId (문자열)

    private Long chatMsgSq;            // 기존 chatmessages_sq 역할

    private Long chatRoomSq;           // tbl_chatroom_s.chatroom_sq FK 개념

    private Long senderSq;             // tbl_user_m.user_sq FK 개념 (nullable)

    private String messageContent;     // message_content

    private LocalDateTime messageCreatedAt;  // message_created_at

    private String chatMsgDeletedYn;   // chat_msg_deleted_yn ('Y'/'N')
}
