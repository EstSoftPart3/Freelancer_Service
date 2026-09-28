package com.example.demo.domain.community.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.security.CurrentUser;
import com.example.demo.domain.community.constant.BoardTypeCode;
import com.example.demo.domain.community.dto.request.CommentRequest;
import com.example.demo.domain.community.dto.response.CommentResponse;
import com.example.demo.domain.community.entity.Answer;
import com.example.demo.domain.community.entity.Board;
import com.example.demo.domain.community.entity.Comment;
import com.example.demo.domain.community.entity.Recommendation;
import com.example.demo.domain.community.mapper.AnswerMapper;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.mapper.CommentMapper;
import com.example.demo.domain.community.mapper.RecommendationMapper;
import com.example.demo.domain.user.service.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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

        // 1-2. 비공개 고객의 소리에는 작성자·관리자만 댓글을 달 수 있다.
        // VocService.requireReadable / AnswerService.createAnswer 와 같은 기준이다 —
        // 여기만 열어 두면 본문은 403 으로 막아 둔 문의에 아무나 댓글을 달고
        // 문의자에게 알림까지 나간다.
        // 댓글은 글(boardSq)에도, 답변(answerSq)에도 달린다. 답변 쪽을 빼면 비공개 문의에 달린
        // 운영자 답변에 아무나 댓글을 달 수 있어 본문 잠금이 반쪽이 된다 — 두 갈래 모두 원글로
        // 거슬러 올라가 같은 기준으로 판정한다.
        Long targetBoardSq = commentRequest.getBoardSq();
        if (targetBoardSq == null && commentRequest.getAnswerSq() != null) {
            Answer parentAnswer = answerMapper.findById(commentRequest.getAnswerSq());
            if (parentAnswer != null) {
                targetBoardSq = parentAnswer.getBoardSq();
            }
        }
        if (targetBoardSq != null) {
            Board voc = boardMapper.findByIdBoard(targetBoardSq, BoardTypeCode.VOC.getCode());
            if (voc != null && "Y".equals(voc.getBoardIsSecretYn())
                    && !CurrentUser.isAdmin()
                    && !Objects.equals(commentRequest.getUserSq(), voc.getUserSq())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비공개 문의입니다. 작성자와 관리자만 댓글을 달 수 있습니다.");
            }
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
                // 게시판이 늘어날 때마다 여기 삼항식이 틀리는 것을 막으려고 BoardTypeCode 로 옮겼다
                // (기존: "normal" 이 아니면 전부 /qna/ 로 보내서 공지·고객의소리가 Q&A 로 갔다).
                targetUrl = BoardTypeCode.pathPrefixOfTyp(board.getBoardTyp()) + board.getBoardSq();
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
                // 답변을 지원하는 게시판이 QnA 하나뿐이던 시절엔 "/qna/"로 못박아도 됐지만,
                // 커리어/기술소통도 답변을 지원하게 되면서 실제 부모 글의 타입을 찾아야 한다
                // (AdminBoardService.getAdminBoardDetail과 같은 이유의 같은 수정).
                Long parentBoardTypeCd = boardMapper.findParentBoardTypeCdOrDefault(answer.getBoardSq(),
                        BoardTypeCode.QNA.getCode());
                // [중요] 상세 페이지 URL 뒤에 answerSq 파라미터를 붙여 모달 띄우기 대응
                targetUrl = "/" + BoardTypeCode.pathOfCode(parentBoardTypeCd) + "/" + answer.getBoardSq()
                        + "?answerSq=" + comment.getAnswerSq();
                // 링크와 같은 이유로 문구도 "Q&A" 로 못박지 않는다 — 커리어/기술소통 답변에 달린
                // 댓글에도 이 분기가 타므로 "Q&A 답변" 이라고 하면 실제 게시판과 다른 문구가 나간다.
                notiContent = "내 답변에 새로운 댓글이 달렸습니다.";
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
        // findById 는 삭제되지 않은 댓글만 돌려준다. 없는 번호로 수정 요청이 오면
        // 아래 getUserSq() 에서 NPE 500 이 났다(AnswerService.updateAnswer 와 같은 처리).
        if (comment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 댓글입니다.");
        }

        // if (comment.getUserSq() != commentRequest.getUserSq()) {
        // throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
        // }

        // log.info("수정 시도 - DB 작성자 SQ: {}, 요청자(세션) SQ: {}", comment.getUserSq(),
        // commentRequest.getUserSq());

        // sq 비교 방식 변경
        if (!Objects.equals(comment.getUserSq(), commentRequest.getUserSq())) {
            throw new IllegalArgumentException("작성자와 사용자가 일치하지 않습니다.");
        }

        comment.setCommentDescriptionTxt(commentRequest.getDescription());

        commentMapper.update(comment);

        return;
    }

    @Transactional
    public void deleteComment(Long userSq, Long commentSq) {
        // delete 쿼리만 user_sq 로 걸려 있고 추천 정리·댓글수 재계산은 comment_sq 만 본다.
        // 소유자 확인 없이 내려가면 남의 댓글 번호로 호출했을 때 댓글은 그대로 남은 채
        // 추천 기록만 지워진다(BoardService.deleteBoard·AnswerService.deleteAnswer 와 같은 이유).
        // 없는 번호면 아래 comment.getBoardSq() 에서 NPE 500 이 났다.
        Comment comment = getComment(commentSq);
        if (comment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 댓글입니다.");
        }
        if (!Objects.equals(comment.getUserSq(), userSq)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

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

        // 400 이 아니라 401 이어야 FO 의 refresh 인터셉터가 토큰을 재발급해 자동 재시도한다
        // (BoardService.updateBoardRecommend·AnswerService.updateAnswerRecommend 와 같은 규약).
        if (userSq == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
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
