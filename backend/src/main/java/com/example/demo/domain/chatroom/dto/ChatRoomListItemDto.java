package com.example.demo.domain.chatroom.dto;

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
public class ChatRoomListItemDto {
    private Long chatRoomSq;
    private Long projectSq;
    private String projectNm;
    private Long userSq;
    private String userNm;
    private Long companySq;
    private String companyNm;
    private LocalDateTime chatroomCreatedDt;
    private String lastMsg;
    private LocalDateTime lastMsgAt;
    private String chatroomUserDeletedYn;
    private String chatroomCompanyDeletedYn;
    private Integer unreadCnt;
    private boolean isNewRoom;
    private Long userLastReadMsgSq;
    private Long companyLastReadMsgSq;
}
