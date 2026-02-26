package com.example.demo.domain.admin.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.admin.mapper.AdminNoticeMapper;
import com.example.demo.domain.community.dto.BoardListDTO;
import com.example.demo.domain.community.dto.request.CommentRequest;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.entity.Comment;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.mapper.CommentMapper;
import com.example.demo.domain.community.mapper.RecommendationMapper;

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

        @Transactional(readOnly = true)
        public BoardListResponse getAdminNotices(Long boardTypeCd, String keyword,
                        String sortField, String sortOrder,
                        Long page, Long size) {

                Long offset = (page - 1) * size;
                Long totalElements = adminNoticeMapper.countNotices(boardTypeCd, keyword);
                List<BoardListDTO> notices = adminNoticeMapper.findAllNotices(boardTypeCd, keyword, sortField,
                                sortOrder, offset, size);

                // ZodError 방지: null인 리스트를 빈 리스트로 초기화
                for (BoardListDTO dto : notices) {
                        if (dto.getNormalTags() == null) {
                                dto.setNormalTags(new ArrayList<>());
                        }
                        if (dto.getSkillTags() == null) {
                                dto.setSkillTags(new ArrayList<>());
                        }
                }

                return BoardListResponse.builder()
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