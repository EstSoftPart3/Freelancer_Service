package com.example.demo.domain.chat.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomVo {

    private Long chatroomSq;
    private LocalDateTime chatRoomCreatedAt;
    private LocalDateTime lastMessageAt;
    private Long userSq;
    private String lastMessage;
    private ChatRoomType chatRoomType;
}