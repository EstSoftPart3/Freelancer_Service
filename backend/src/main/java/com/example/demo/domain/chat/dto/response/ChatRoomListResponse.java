package com.example.demo.domain.chat.dto.response;

import java.util.List;

import com.example.demo.domain.chat.dto.ChatRoomVo;

import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class ChatRoomListResponse {
	private List<ChatRoomVo> chatRoomList;
}
