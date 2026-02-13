package com.example.demo.domain.community.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.management.Notification;

import org.springframework.stereotype.Service;

import com.example.demo.domain.community.dto.request.*;
import com.example.demo.domain.community.dto.response.CommentResponse;
import com.example.demo.domain.community.entity.*;
import com.example.demo.domain.community.mapper.*;
import com.example.demo.domain.user.service.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentMapper commentMapper;
    private final BoardMapper boardMapper;
    private final AnswerMapper answerMapper;
    private final RecommendationMapper recommendationMapper;
    private final NotificationService notificationService;

    @Transactional
    public Comment getComment(Long commentSq) {
        return commentMapper.findById(commentSq);
    }

    @Transactional
    public void createComment(CommentRequest commentRequest) {
        // 1. 댓글 오류 처리
        if (commentRequest.getDescription() == null) {
            throw new IllegalArgumentException("내용을 입력해주세요.");
        } else if (commentRequest.getBoardSq() == null && commentRequest.getAnswerSq() == null) {
            throw new IllegalArgumentException("게시판 또는 답변 순번이 없습니다.");
        }

        // 2. 엔티티 빌드 및 저장
        Comment comment = Comment.builder()
                .userSq(commentRequest.getUserSq())
                .parentCommentSq(commentRequest.getParentCommentSq())
                .boardSq(commentRequest.getBoardSq())
                .answerSq(commentRequest.getAnswerSq())
                .commentDescriptionTxt(commentRequest.getDescription())
                .commentTypeCd(commentRequest.getBoardSq() == null ? 1602L : 1601L)
                .build();

        commentMapper.insert(comment);

        if (comment.getCommentSq() == null) {
            throw new IllegalStateException("댓글 등록 실패: Primary Key가 생성되지 않았습니다.");
        }

        // 3. 알림 관련 변수 초기화
        Long receiverSq = null;
        String targetUrl = "";
        String notiContent = "";

        // 4. [알림 로직 A] 일반 게시판 또는 Q&A 게시글 직접 댓글
        if (comment.getBoardSq() != null) {
            boardMapper.updateCommentCnt(comment.getBoardSq());
            Board board = boardMapper.findByIdOnly(comment.getBoardSq());

            if (board != null) {
                receiverSq = board.getUserSq();
                String pathPrefix = "normal".equals(board.getBoardTyp()) ? "/board/" : "/qna/";
                targetUrl = pathPrefix + board.getBoardSq();
                notiContent = "내 게시글에 새로운 댓글이 달렸습니다.";
            }
        }
        // 5. [알림 로직 B] Q&A 답변(Answer)에 달린 댓글
        else if (comment.getAnswerSq() != null) {
            answerMapper.updateCommentCnt(comment.getAnswerSq());
            // 답변 정보를 가져와서 작성자와 부모 질문글(boardSq) 확인
            Answer answer = answerMapper.findById(comment.getAnswerSq());

            if (answer != null) {
                receiverSq = answer.getUserSq();
                // [중요] 상세 페이지 URL 뒤에 answerSq 파라미터를 붙여 모달 띄우기 대응
                targetUrl = "/qna/" + answer.getBoardSq() + "?answerSq=" + comment.getAnswerSq();
                notiContent = "내 Q&A 답변에 새로운 댓글이 달렸습니다.";
            }
        }

        // 6. [알림 발송 1] 원글/답변 작성자 발송
        if (receiverSq != null && !receiverSq.equals(comment.getUserSq())) {
            notificationService.send(receiverSq, comment.getUserSq(), 2601L, notiContent, targetUrl);
        }

        // 7. [알림 발송 2] 대댓글인 경우 부모 댓글 작성자 발송
        if (comment.getParentCommentSq() != null) {
            Comment parentComment = commentMapper.selectCommentDetail(comment.getParentCommentSq());
            if (parentComment != null) {
                Long parentWriterSq = parentComment.getUserSq();

                // 본인이 아니고, 원글 작성자와 중복되지 않을 때만 발송
                if (!parentWriterSq.equals(comment.getUserSq()) && !parentWriterSq.equals(receiverSq)) {
                    notificationService.send(parentWriterSq, comment.getUserSq(), 2601L, "내 댓글에 새로운 답글이 달렸습니다.",
                            targetUrl);
                }
            }
        }
    }

    /**
     * 평면 리스트를 트리 구조(부모-자식)로 변환하는 유틸리티 메서드
     * BoardService나 QnaService 등에서 댓글 리스트를 조회한 후 이 메서드를 거쳐 반환하면 됩니다.
     */
    public List<CommentResponse> convertToTree(List<CommentResponse> allComments) {
        Map<Long, CommentResponse> map = new HashMap<>();
        List<CommentResponse> roots = new ArrayList<>();

        // 1. 모든 댓글을 Map에 담아 빠른 조회를 준비
        for (CommentResponse comment : allComments) {
            map.put(comment.getSq(), comment);
        }

        // 2. 부모-자식 관계 맺기
        for (CommentResponse comment : allComments) {
            Long parentSq = comment.getParentCommentSq();
            if (parentSq == null || parentSq == 0) {
                // 부모가 없으면 최상위 댓글(루트)
                roots.add(comment);
            } else {
                // 부모가 있으면 부모의 childComments 리스트에 추가
                CommentResponse parent = map.get(parentSq);
                if (parent != null) {
                    parent.getChildComments().add(comment);
                }
            }
        }
        return roots;
    }

    @Transactional
    public void updateComment(CommentRequest commentRequest, Long commentSq) {
        // 댓글 업데이트
        if (commentRequest.getDescription() == null) {
            throw new IllegalArgumentException("내용을 입력해주세요.");
        }

        Comment comment = getComment(commentSq);

        if (comment.getUserSq() != commentRequest.getUserSq()) {
            throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
        }

        comment.setCommentDescriptionTxt(commentRequest.getDescription());

        commentMapper.update(comment);

        return;
    }

    @Transactional
    public void deleteComment(Long userSq, Long commentSq) {
        Comment comment = getComment(commentSq);
        commentMapper.delete(userSq, commentSq);
        recommendationMapper.deleteAll(null, null, commentSq);

        // 댓글수 카운트
        if (comment.getBoardSq() != null) {
            boardMapper.updateCommentCnt(comment.getBoardSq());
        }
        if (comment.getAnswerSq() != null) {
            answerMapper.updateCommentCnt(comment.getAnswerSq());
        }
    }

    @Transactional
    public void updateRecommendCntComment(Long userSq, Long commentSq) {

        if (userSq == null) {
            throw new IllegalArgumentException("로그인 후 이용해주세요.");
        }

        Recommendation recommendation = recommendationMapper.findByCommentSq(userSq, commentSq);

        if (recommendation == null) {
            recommendation = Recommendation.builder().commentSq(commentSq).userSq(userSq).recommendationTypeCd(1903L)
                    .build();
            recommendationMapper.insert(recommendation);

        } else {
            recommendationMapper.delete(recommendation.getRecommendationSq());
        }

        commentMapper.updateRecommendCnt(commentSq);
    }

}
