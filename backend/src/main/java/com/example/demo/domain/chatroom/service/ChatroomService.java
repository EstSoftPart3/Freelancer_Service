package com.example.demo.domain.chatroom.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.domain.chatroom.dto.ChatReadEventResponse;
import com.example.demo.domain.chatroom.dto.ChatRoomListItemDto;
import com.example.demo.domain.chatroom.dto.ChatRoomListResultDto;
import com.example.demo.domain.chatroom.mapper.ChatroomMapper;
import com.mongodb.DuplicateKeyException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatroomService {

    private final ChatroomMapper chatRoomMapper;
    private final ChatMessageService chatMessageService;   // unreadCnt 조회용
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatRoomListItemDto createOrGetRoom(Long userSq, Long projectSq) {
    	
        Long existingChatRoomSq = chatRoomMapper.selectChatRoomSqByProjectAndUser(projectSq, userSq);

        if (existingChatRoomSq != null) {
            String deletedYn = chatRoomMapper.selectChatRoomUserDeletedYn(existingChatRoomSq);

            if ("Y".equals(deletedYn)) {
                chatRoomMapper.updateChatRoomUserDeletedYnToN(existingChatRoomSq);
            }
            return buildResult(existingChatRoomSq, userSq, false);
        }

        Long companySq = chatRoomMapper.selectCompanySqByProjectSq(projectSq);
        
        if (companySq == null) {
            throw new IllegalArgumentException("존재하지 않는 프로젝트입니다. projectSq=" + projectSq);
        }

        ChatRoomListItemDto param = new ChatRoomListItemDto();
        
        param.setProjectSq(projectSq);
        param.setCompanySq(companySq);
        param.setUserSq(userSq);

        try {
        	
            chatRoomMapper.insertChatRoom(param);
        } catch (DuplicateKeyException e) {
            Long raceWinnerSq = chatRoomMapper.selectChatRoomSqByProjectAndUser(projectSq, userSq);
            if (raceWinnerSq == null) {
                throw e;
            }
            return buildResult(raceWinnerSq, userSq, false);
        }

        return buildResult(param.getChatRoomSq(), userSq, true);
    }

    private ChatRoomListItemDto buildResult(Long chatRoomSq, Long userSq, boolean isNewRoom) {
    	
        ChatRoomListItemDto detail = chatRoomMapper.selectChatRoomDetailBySq(chatRoomSq);
       
        detail.setNewRoom(isNewRoom);

        // 신규 생성 방은 메시지가 없으니 몽고 조회 없이 0으로 처리 (불필요한 쿼리 스킵)
        int unreadCnt = isNewRoom ? 0 : (int) chatMessageService.countUnread(chatRoomSq, null);
        detail.setUnreadCnt(unreadCnt);

        return detail;
    }
    
    // 목록 조회 - 커서 기준으로 unreadCnt 계산
    public ChatRoomListResultDto getRoomList(Long userSq, int page, int size) {
        int offset = page * size;
        List<ChatRoomListItemDto> rooms;
        int totalCount;

        Long companySq = chatRoomMapper.selectCompanySqByUserSq(userSq);
        boolean isCompany = companySq != null;

        if (isCompany) {
            rooms = chatRoomMapper.selectChatRoomListForCompany(companySq, offset, size);
            totalCount = chatRoomMapper.countChatRoomListForCompany(companySq);
        } else {
            rooms = chatRoomMapper.selectChatRoomListForUser(userSq, offset, size);
            totalCount = chatRoomMapper.countChatRoomListForUser(userSq);
        }

        for (ChatRoomListItemDto room : rooms) {
            Long lastReadMsgSq = isCompany ? room.getCompanyLastReadMsgSq() : room.getUserLastReadMsgSq();
            int unreadCnt = (int) chatMessageService.countUnread(room.getChatRoomSq(), lastReadMsgSq);
            room.setUnreadCnt(unreadCnt);
        }

        ChatRoomListResultDto result = new ChatRoomListResultDto();
        result.setList(rooms);
        result.setTotalCount(totalCount);
        return result;
    }

    // 읽음 처리 - 해당 방의 최신 메시지 SQ까지 읽음 처리
    @Transactional
    public void markAsRead(Long userSq, Long chatRoomSq) {
        Long companySq = chatRoomMapper.selectCompanySqByUserSq(userSq);
        boolean isCompany = companySq != null;

        Long latestMsgSq = chatMessageService.getLatestMsgSq(chatRoomSq);
        if (latestMsgSq == null) {
            return;
        }

        String readerType;
        if (isCompany) {
            chatRoomMapper.updateCompanyLastReadMsgSq(chatRoomSq, latestMsgSq);
            readerType = "COMPANY";
        } else {
            chatRoomMapper.updateUserLastReadMsgSq(chatRoomSq, latestMsgSq);
            readerType = "PERSONAL";
        }

        ChatReadEventResponse event = ChatReadEventResponse.builder()
                .chatRoomSq(chatRoomSq)
                .readerType(readerType)
                .lastReadMsgSq(latestMsgSq)
                .build();

        messagingTemplate.convertAndSend("/topic/chatrooms/" + chatRoomSq, event);
    }
}