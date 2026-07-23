package com.example.demo.domain.chatroom.sequence;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;

@Getter
@Document(collection = "chat_msg_sequence")
public class ChatMsgSequenceDocument {
    @Id
    private String id;   // 고정값, 예: "chatMsgSq"
    private Long seq;
}
