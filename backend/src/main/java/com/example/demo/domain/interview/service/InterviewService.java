package com.example.demo.domain.interview.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.domain.interview.dto.request.InterviewReviewRequest;
import com.example.demo.domain.interview.dto.response.InterviewDetailResponse;
import com.example.demo.domain.interview.dto.response.InterviewListItemDTO;
import com.example.demo.domain.interview.dto.response.InterviewListResponse;
import com.example.demo.domain.interview.entity.InterviewReview;
import com.example.demo.domain.interview.mapper.InterviewMapper;

import lombok.RequiredArgsConstructor;

/**
 * 면접후기(Interview) — 커리어소통 통합피드와 완전 분리된 전용 도메인(사용자 확정).
 * 댓글·추천·신고 없음(MVP 확정 범위). 목록은 FO에서 카드 형태로 렌더링한다.
 *
 * <p>
 * 면접단계({@code interviewStages})는 신고·검색 요구가 없어 자식 테이블 대신 콤마로 이어붙인
 * 문자열 하나로 저장한다 — 상세 조회 시에만 다시 리스트로 쪼갠다.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class InterviewService {

    private static final String STAGE_DELIMITER = ",";

    private final InterviewMapper interviewMapper;

    public InterviewListResponse getAllReviews(String keyword, String companyNm, String sortType, Long page,
            Long size) {
        Long offset = (page - 1L) * size;
        List<InterviewListItemDTO> reviews = interviewMapper.findAll(keyword, companyNm, sortType, size, offset);
        Long totalElements = interviewMapper.findAllCnt(keyword, companyNm);
        return InterviewListResponse.builder()
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .reviews(reviews)
                .build();
    }

    public InterviewDetailResponse getReview(Long interviewReviewSq) {
        InterviewReview review = interviewMapper.findById(interviewReviewSq);
        if (review == null || "Y".equals(review.getInterviewIsDeletedYn())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 면접후기입니다.");
        }
        return InterviewDetailResponse.builder()
                .interviewReviewSq(review.getInterviewReviewSq())
                .userSq(review.getUserSq())
                .userNickname(review.getUserNickname())
                .companyNm(review.getCompanyNm())
                .jobNm(review.getJobNm())
                .careerLevel(review.getCareerLevel())
                .interviewDt(review.getInterviewDt())
                .interviewStages(splitStages(review.getInterviewStages()))
                .questionEdt(review.getQuestionEdt())
                .difficultyStar(review.getDifficultyStar())
                .atmosphereEdt(review.getAtmosphereEdt())
                .resultCd(review.getResultCd())
                .proposedSalary(review.getProposedSalary())
                .interviewViewCnt(review.getInterviewViewCnt())
                .interviewCreatedAtDtm(review.getInterviewCreatedAtDtm())
                .build();
    }

    public Long createReview(InterviewReviewRequest request) {
        if (request.getCompanyNm() == null || request.getCompanyNm().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회사명을 입력해주세요.");
        }
        if (request.getJobNm() == null || request.getJobNm().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "직무를 선택해주세요.");
        }
        if (request.getCareerLevel() == null || request.getCareerLevel().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "경력을 선택해주세요.");
        }
        if (request.getDifficultyStar() != null && (request.getDifficultyStar() < 1 || request.getDifficultyStar() > 5)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "면접난이도는 1~5 사이여야 합니다.");
        }

        InterviewReview review = new InterviewReview();
        review.setUserSq(request.getUserSq());
        review.setCompanyNm(request.getCompanyNm());
        review.setJobNm(request.getJobNm());
        review.setCareerLevel(request.getCareerLevel());
        review.setInterviewDt(request.getInterviewDt());
        review.setInterviewStages(joinStages(request.getInterviewStages()));
        review.setQuestionEdt(request.getQuestionEdt());
        review.setDifficultyStar(request.getDifficultyStar());
        review.setAtmosphereEdt(request.getAtmosphereEdt());
        review.setResultCd(request.getResultCd());
        review.setProposedSalary(request.getProposedSalary());
        interviewMapper.insert(review);
        return review.getInterviewReviewSq();
    }

    public void deleteReview(Long userSq, Long interviewReviewSq) {
        if (userSq == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        InterviewReview review = interviewMapper.findById(interviewReviewSq);
        if (review == null || "Y".equals(review.getInterviewIsDeletedYn())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 면접후기입니다.");
        }
        int updated = interviewMapper.deleteById(interviewReviewSq, userSq);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 면접후기만 삭제할 수 있습니다.");
        }
    }

    public void addViewCnt(Long interviewReviewSq) {
        interviewMapper.addViewCnt(interviewReviewSq);
    }

    private String joinStages(List<String> stages) {
        if (stages == null || stages.isEmpty()) return null;
        return String.join(STAGE_DELIMITER, stages);
    }

    private List<String> splitStages(String stages) {
        if (stages == null || stages.isBlank()) return List.of();
        return Arrays.asList(stages.split(STAGE_DELIMITER));
    }
}
