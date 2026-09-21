package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.domain.admin.mapper.AdminInterviewMapper;
import com.example.demo.domain.interview.dto.request.InterviewReviewRequest;
import com.example.demo.domain.interview.dto.response.InterviewDetailResponse;
import com.example.demo.domain.interview.dto.response.InterviewListItemDTO;
import com.example.demo.domain.interview.dto.response.InterviewListResponse;
import com.example.demo.domain.interview.entity.InterviewReview;
import com.example.demo.domain.interview.mapper.InterviewMapper;
import com.example.demo.domain.interview.service.InterviewService;

import lombok.RequiredArgsConstructor;

/**
 * BO 면접후기 관리. 등록은 {@link InterviewService#createReview} 를 그대로 재사용한다
 * (AdminVoteController가 투표 등록에 VoteService를 그대로 쓰는 것과 같은 이유 — FO와 다른 검증 규칙이
 * 생기지 않게). 목록·상세·수정·삭제만 이 서비스가 맡는다.
 *
 * <p>
 * 면접후기는 투표와 달리 참여자/제출 개념(TBL_VOTE_RECORD_S에 대응하는 하위 테이블)이 아예 없어
 * "참여자가 있으면 일부 필드 잠금" 정책이 적용될 대상이 없다 — 모든 필드를 제한 없이 수정 가능하다.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AdminInterviewService {

    private final AdminInterviewMapper adminInterviewMapper;
    private final InterviewMapper interviewMapper;
    private final InterviewService interviewService;

    @Transactional(readOnly = true)
    public InterviewListResponse getAdminReviews(String keyword, String sortType, Long page, Long size) {
        if (page == null || page < 1) {
            page = 1L;
        }
        if (size == null || size < 1) {
            size = 12L;
        }
        if (size > 100) {
            size = 100L;
        }
        Long offset = (page - 1) * size;

        List<InterviewListItemDTO> reviews = adminInterviewMapper.findAllForAdmin(keyword, sortType, offset, size);
        Long totalElements = adminInterviewMapper.countForAdmin(keyword);

        return InterviewListResponse.builder()
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .reviews(reviews)
                .build();
    }

    /**
     * 상세. FO의 {@code InterviewService.getReview}는 삭제된 후기를 404로 막지만, BO는 감사를 위해
     * 삭제된 후기도 볼 수 있어야 하므로 그 가드 없이 직접 조립한다.
     */
    @Transactional(readOnly = true)
    public InterviewDetailResponse getAdminReview(Long interviewReviewSq) {
        InterviewReview review = interviewMapper.findById(interviewReviewSq);
        if (review == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 면접후기입니다.");
        }

        return interviewService.toDetail(review);
    }

    @Transactional
    public void updateReview(Long interviewReviewSq, InterviewReviewRequest request) {
        InterviewReview review = interviewMapper.findById(interviewReviewSq);
        if (review == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 면접후기입니다.");
        }
        interviewService.validateContent(request);

        review.setCompanyNm(request.getCompanyNm());
        review.setJobNm(request.getJobNm());
        review.setCareerLevel(request.getCareerLevel());
        review.setInterviewDt(request.getInterviewDt());
        review.setInterviewStages(interviewService.joinStages(request.getInterviewStages()));
        review.setQuestionEdt(request.getQuestionEdt());
        review.setDifficultyStar(request.getDifficultyStar());
        review.setAtmosphereEdt(request.getAtmosphereEdt());
        review.setResultCd(request.getResultCd());
        review.setProposedSalary(request.getProposedSalary());
        adminInterviewMapper.updateReviewMaster(review);
    }

    /** 삭제(논리). 작성자 조건 없는 마스터 쿼리 — 관리자는 남의 면접후기도 지울 수 있어야 한다. */
    @Transactional
    public void deleteReview(Long interviewReviewSq) {
        InterviewReview review = interviewMapper.findById(interviewReviewSq);
        if (review == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 면접후기입니다.");
        }
        adminInterviewMapper.deleteReviewMaster(interviewReviewSq);
    }
}
