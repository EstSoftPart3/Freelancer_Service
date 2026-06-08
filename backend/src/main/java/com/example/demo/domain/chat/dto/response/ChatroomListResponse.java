package com.example.demo.domain.chat.dto.response;

import java.util.List;

import com.example.demo.domain.chat.dto.ChatroomVo;

import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class ChatroomListResponse {
	private List<ChatroomVo> chatroomList;
}
