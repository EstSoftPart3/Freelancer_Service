package com.example.demo.domain.chatroom.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChatRoomListResultDto {
    private List<ChatRoomListItemDto> list;
    private int totalCount;
}
