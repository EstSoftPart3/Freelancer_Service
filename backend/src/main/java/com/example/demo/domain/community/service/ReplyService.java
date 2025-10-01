package com.example.demo.domain.community.service;

import org.springframework.stereotype.Service;
import com.example.demo.domain.community.entity.Reply;
import com.example.demo.domain.community.entity.Recommendation;
import com.example.demo.domain.community.mapper.ReplyMapper;
import com.example.demo.domain.community.mapper.RecommendationMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReplyService {
    private final ReplyMapper replyMapper;
    private final RecommendationMapper recommendationMapper;

    @Transactional
    public Reply getReply(Long replyCommentSq) {
        return replyMapper.findById(replyCommentSq);
    }

    @Transactional
    public void createReply(Long userSq, Long commentSq, Long boardSq, String description) {
        // 유효성 검증
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("내용을 입력해주세요.");
        }
        if (commentSq == null) {
            throw new IllegalArgumentException("댓글 순번이 없습니다.");
        }

        Reply reply = Reply.builder()
                .userSq(userSq)
                .commentSq(commentSq)
                .boardSq(boardSq)
                .replyCommentDescriptionTxt(description)
                .build();
        
        replyMapper.insert(reply);

        if (reply.getReplyCommentSq() == null) {
            throw new IllegalStateException("대댓글 등록 실패: Primary Key가 생성되지 않았습니다.");
        }
    }

    @Transactional
    public void updateReply(Long userSq, Long replyCommentSq, String description) {
        // 유효성 검증
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("내용을 입력해주세요.");
        }

        Reply reply = getReply(replyCommentSq);

        if (!reply.getUserSq().equals(userSq)) {
            throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
        }

        reply.setReplyCommentDescriptionTxt(description);
        replyMapper.update(reply);
    }

    @Transactional
    public void deleteReply(Long userSq, Long replyCommentSq) {
        Reply reply = getReply(replyCommentSq);
        replyMapper.delete(userSq, replyCommentSq);
        
        // 대댓글과 연관된 추천 삭제 (deleteAll 메서드에 replyCommentSq 파라미터 추가 필요)
        // recommendationMapper.deleteAll(null, null, null, replyCommentSq);
    }

    @Transactional
    public void updateRecommendCntReply(Long userSq, Long replyCommentSq) {
        if (userSq == null) {
            throw new IllegalArgumentException("로그인 후 이용해주세요.");
        }

        Recommendation recommendation = recommendationMapper.findByReplyCommentSq(userSq, replyCommentSq);

        if (recommendation == null) {
            // 추천 추가
            recommendation = Recommendation.builder()
                    .userSq(userSq)
                    .replyCommentSq(replyCommentSq)
                    .recommendationTypeCd(1904L)
                    .build();
            recommendationMapper.insert(recommendation);
        } else {
            // 추천 취소
            recommendationMapper.delete(recommendation.getRecommendationSq());
        }

        replyMapper.updateRecommendCnt(replyCommentSq);
    }
}

