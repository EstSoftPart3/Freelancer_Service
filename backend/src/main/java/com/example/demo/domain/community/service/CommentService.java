package com.example.demo.domain.community.service;


import org.springframework.stereotype.Service;

import com.example.demo.domain.community.dto.request.*;
import com.example.demo.domain.community.entity.*;
import com.example.demo.domain.community.mapper.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentMapper commentMapper;
    private final BoardMapper boardMapper;
    private final AnswerMapper answerMapper;
    private final RecommendationMapper recommendationMapper;

    @Transactional
    public Comment getComment(Long commentSq) {
        return commentMapper.findById(commentSq);
    }
    
    @Transactional
    public void createComment(CommentRequest commentRequest){
//    	댓글 오류 처리
    	if(commentRequest.getDescription() == null) {
    		throw new IllegalArgumentException("내용을 입력해주세요.");
    	} else if(commentRequest.getBoardSq() == null && commentRequest.getAnswerSq() == null) {
    		throw new IllegalArgumentException("게시판 또는 답변 순번이 없습니다.");
    	}
    	
    	Comment comment = Comment.builder()
    			.userSq(commentRequest.getUserSq())
        		.boardSq(commentRequest.getBoardSq())
        		.answerSq(commentRequest.getAnswerSq())
        		.commentDescriptionTxt(commentRequest.getDescription())
        		.commentTypeCd(commentRequest.getBoardSq() == null ? 1602L : 1601L).build();
        commentMapper.insert(comment);
        
        if (comment.getCommentSq() == null) {
            throw new IllegalStateException("댓글 등록 실패: Primary Key가 생성되지 않았습니다.");
        }
        
//        댓글수 카운트        
        if(comment.getBoardSq() != null) {
        	boardMapper.updateCommentCnt(comment.getBoardSq());
        }
        if(comment.getAnswerSq() != null) {
        	answerMapper.updateCommentCnt(comment.getAnswerSq());
        }

        
        
		return;
    }

    @Transactional
    public void updateComment(CommentRequest commentRequest, Long commentSq) {
//    	댓글 업데이트
    	if(commentRequest.getDescription() == null) {
    		throw new IllegalArgumentException("내용을 입력해주세요.");
    	}
    	
        Comment comment = getComment(commentSq);
        
        // 인턴 수정: Long 타입 비교 연산자 != 에서 equals() 메서드로 변경
        // 수정 내용: != 연산자를 !equals()로 변경
        // 수정 사유: Java에서 Long 타입(래퍼 클래스)은 객체이므로, != 연산자는 객체 참조를 비교합니다.
        //           같은 값이어도 서로 다른 객체 인스턴스일 경우 false를 반환하여 버그가 발생할 수 있습니다.
        //           equals() 메서드를 사용하여 실제 값을 비교하도록 수정했습니다.
        if(!comment.getUserSq().equals(commentRequest.getUserSq())) {
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
        
//      댓글수 카운트        
      if(comment.getBoardSq() != null) {
      	boardMapper.updateCommentCnt(comment.getBoardSq());
      }
      if(comment.getAnswerSq() != null) {
      	answerMapper.updateCommentCnt(comment.getAnswerSq());
      }
    }

    @Transactional
    public void updateRecommendCntComment(Long userSq, Long commentSq) {
    	
    	if(userSq == null) {
    		throw new IllegalArgumentException("로그인 후 이용해주세요.");
    	}
    	
    	Recommendation recommendation = recommendationMapper.findByCommentSq(userSq, commentSq);
    	
    	if(recommendation == null) {
    		recommendation = Recommendation.builder().commentSq(commentSq).userSq(userSq).recommendationTypeCd(1903L).build();
        	recommendationMapper.insert(recommendation);
        	
        } else {
        	recommendationMapper.delete(recommendation.getRecommendationSq());
        }
    	
    	commentMapper.updateRecommendCnt(commentSq);
    }


}
