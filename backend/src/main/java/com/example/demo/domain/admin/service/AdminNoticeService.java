package com.example.demo.domain.admin.service;

import java.util.ArrayList;
import java.util.List;

import javax.management.Notification;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.util.SortDirectionUtil;
import com.example.demo.domain.admin.mapper.AdminNoticeMapper;
import com.example.demo.domain.admin.dto.AdminBoardListDTO;
import com.example.demo.domain.community.dto.request.CommentRequest;
import com.example.demo.domain.admin.dto.response.AdminBoardListResponseDTO;
import com.example.demo.domain.community.entity.Comment;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.mapper.CommentMapper;
import com.example.demo.domain.community.mapper.RecommendationMapper;
import com.example.demo.domain.user.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminNoticeService {

        private final AdminNoticeMapper adminNoticeMapper;
        private final CommentMapper commentMapper;
        private final BoardMapper boardMapper;
        private final RecommendationMapper recommendationMapper;
        private final NotificationService notificationService;

        @Transactional(readOnly = true)
        public AdminBoardListResponseDTO getAdminNotices(Long boardTypeCd, String keyword,
                        String sortField, String sortOrder,
                        Long page, Long size) {

                Long offset = (page - 1) * size;
                Long totalElements = adminNoticeMapper.countNotices(boardTypeCd, keyword);
                // sortOrder는 AdminNoticeMapper.xml에서 ${sortOrder}로 직접 삽입되므로 ASC/DESC로 정규화(SQL Injection 방지)
                List<AdminBoardListDTO> notices = adminNoticeMapper.findAllNotices(boardTypeCd, keyword, sortField,
                                SortDirectionUtil.normalize(sortOrder), offset, size);

                // ZodError 방지: null인 리스트를 빈 리스트로 초기화
                for (AdminBoardListDTO dto : notices) {
                        if (dto.getNormalTags() == null) {
                                dto.setNormalTags(new ArrayList<>());
                        }
                        if (dto.getSkillTags() == null) {
                                dto.setSkillTags(new ArrayList<>());
                        }
                }

                return AdminBoardListResponseDTO.builder()
                                .boards(notices)
                                .totalElements(totalElements)
                                .page(page)
                                .size(size)
                                .build();
        }

        /**
         * 관리자 권한 댓글 삭제 (권한 체크 우회)
         */
        @Transactional
        public void deleteAdminComment(Long commentSq) {
                // 1. 댓글 정보 확인
                Comment comment = adminNoticeMapper.findCommentById(commentSq);
                if (comment == null)
                        throw new IllegalArgumentException("존재하지 않는 댓글입니다.");

                // 2. 관리자 권한으로 삭제 (상태값 변경)
                adminNoticeMapper.deleteCommentByAdmin(commentSq);

                // 3. 관련 데이터 정리 (추천 삭제)
                recommendationMapper.deleteAll(null, null, commentSq);

                // 4. 게시글 댓글수 카운트 업데이트
                if (comment.getBoardSq() != null) {
                        boardMapper.updateCommentCnt(comment.getBoardSq());
                }
        }

        /**
         * 공지사항 댓글 등록
         */
        @Transactional
        public void createAdminComment(CommentRequest commentRequest) {
                if (commentRequest.getDescription() == null || commentRequest.getDescription().isEmpty()) {
                        throw new IllegalArgumentException("내용을 입력해주세요.");
                }

                Comment comment = Comment.builder()
                                .userSq(commentRequest.getUserSq())
                                .parentCommentSq(commentRequest.getParentCommentSq())
                                .boardSq(commentRequest.getBoardSq())
                                .commentDescriptionTxt(commentRequest.getDescription())
                                .commentTypeCd(1601L) // 게시판 댓글 타입 고정
                                .build();

                commentMapper.insert(comment);

                // 댓글수 증가
                boardMapper.updateCommentCnt(comment.getBoardSq());

                // 알림 로직 호출
                if (comment.getCommentSq() != null) {
                        sendNoticeCommentNotification(comment);
                }
        }

        /**
         * 공지사항 전용 알림 발송 로직
         */
        private void sendNoticeCommentNotification(Comment comment) {
                String targetUrl = "";

                // 1. URL 구성 (공지사항은 /notice/ 경로 사용)
                // findByIdOnly를 통해 게시글 정보를 가져오거나, 공지사항임을 확신한다면 바로 경로 생성
                targetUrl = "/notice/" + comment.getBoardSq();

                // 2. [알림 로직 A] 원글 작성자에게 알림
                // 공지사항(관리자 글)에 댓글이 달릴 때는 관리자에게 알림을 보낼 필요가 없으므로 이 부분은 생략합니다.
                // 만약 나중에 공지사항 작성자에게도 알림이 필요하다면 여기에 추가 로직을 넣으면 됩니다.

                // 3. [알림 로직 B] 대댓글인 경우 부모 댓글 작성자에게 알림
                // "일반사용자가 대댓글을 달 때" 또는 "관리자가 대댓글을 달 때" 모두 부모 댓글 작성자에게 알림이 가야 합니다.
                if (comment.getParentCommentSq() != null) {
                        // 부모 댓글 정보 조회 (작성자를 알아내기 위함)
                        Comment parentComment = commentMapper.selectCommentDetail(comment.getParentCommentSq());

                        if (parentComment != null) {
                                Long parentWriterSq = parentComment.getUserSq();

                                // 본인이 쓴 댓글에 본인이 답글을 단 경우가 아닐 때만 발송
                                if (parentWriterSq != null && !parentWriterSq.equals(comment.getUserSq())) {

                                        // 알림 문구 설정 (작성자가 관리자(예: role 체크 등)인지 여부에 따라 문구를 분기할 수도 있습니다)
                                        // 여기서는 요청하신 대로 "관리자가 남겼을 때"와 "일반 사용자가 남겼을 때"를 포괄하는 문구를 사용합니다.
                                        String notiContent = "내 댓글에 관리자가 답글을 남겼습니다.";

                                        // 만약 작성자가 관리자라면(서비스 특성상 구분 가능할 경우) 문구 변경 가능
                                        // 예: if (isAdmin) notiContent = "내 댓글에 관리자가 답글을 남겼습니다.";

                                        notificationService.send(parentWriterSq, comment.getUserSq(), 2601L,
                                                        notiContent, targetUrl);
                                }
                        }
                }
        }

        @Transactional
        public void updateAdminComment(Long commentSq, CommentRequest commentRequest) {
                // 1. 내용 유효성 검사
                if (commentRequest.getDescription() == null || commentRequest.getDescription().isEmpty()) {
                        throw new IllegalArgumentException("수정할 내용을 입력해주세요.");
                }

                // 2. 기존 댓글 조회 (AdminNoticeMapper 또는 CommentMapper 사용)
                Comment comment = adminNoticeMapper.findCommentById(commentSq);
                if (comment == null) {
                        throw new IllegalArgumentException("존재하지 않는 댓글입니다.");
                }

                // 3. 내용 변경 및 업데이트 (작성자 체크 없이 진행)
                comment.setCommentDescriptionTxt(commentRequest.getDescription());
                commentMapper.update(comment);

                log.info("####### [관리자 댓글 수정] commentSq: {} #######", commentSq);
        }
}