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

    // 값 자체에 올 수 있는 일반 문자(콤마 등)와 절대 겹치지 않도록 유닛 구분자(U+001F)를
    // 쓴다 — 키보드로 입력할 수 없어 값에 우연히 섞일 일이 없다(판단 대기 3번 해결).
    private static final String STAGE_DELIMITER = "";

    private final InterviewMapper interviewMapper;

    public InterviewListResponse getAllReviews(String keyword, String companyNm, String sortType, Long page,
            Long size) {
        // page/size 를 그대로 LIMIT/OFFSET 에 흘려보내면 ?page=0·음수 는 음수 OFFSET 으로,
        // ?size=0·음수 는 음수 LIMIT 으로 내려가 SQL 문법 오류 500 이 난다
        // (BoardService.getAllBoards, VoteService.getAllVotes 와 동일한 함정). 여기서 방어한다.
        if (page == null || page < 1) {
            page = 1L;
        }
        if (size == null || size < 1) {
            size = 12L;
        }
        if (size > 100) {
            size = 100L;
        }
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
        return toDetail(review);
    }

    /** FO 상세와 BO 상세(삭제된 후기 포함)가 같이 쓰는 엔티티 → 응답 변환. */
    public InterviewDetailResponse toDetail(InterviewReview review) {
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
                .interviewIsDeletedYn(review.getInterviewIsDeletedYn())
                .build();
    }

    public Long createReview(InterviewReviewRequest request) {
        // /api/interviews 는 JwtAuthenticationFilter.EXCLUDE_URLS 에 접두사로 통째로 올라 있고
        // SecurityConfigProd 는 POST /interviews 를 permitAll 하지 않는다 — 토큰이 없거나 만료되면
        // 필터가 인증 세팅 없이 그냥 통과시키는데, Spring Security 의 anyRequest().authenticated()
        // 는 익명 Authentication 도 "인증됨"으로 쳐서 컨트롤러까지 들어와 버린다
        // (b6291e11 에서 /api/projects 에 대해, VoteService.createVote 에서 동일하게 고친 것과 같은
        // 함정). deleteReview 는 이미 이 null 가드가 있었는데 createReview 만 빠져 있어
        // 비로그인/만료 토큰 사용자가 user_sq 없는 면접후기를 만들 수 있었다.
        if (request.getUserSq() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        validateContent(request);

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

    /** 등록(FO·BO)과 BO 수정이 같이 쓰는 내용 검증 — 두 곳에 규칙이 따로 생기지 않게 한다. */
    public void validateContent(InterviewReviewRequest request) {
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
        if (request.getProposedSalary() != null && request.getProposedSalary() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제안 연봉은 0 이상이어야 합니다.");
        }
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

    // BO(AdminInterviewService)도 동일 구분자로 join/split해야 해서 public으로 연다.
    public String joinStages(List<String> stages) {
        if (stages == null || stages.isEmpty()) return null;
        return String.join(STAGE_DELIMITER, stages);
    }

    public List<String> splitStages(String stages) {
        if (stages == null || stages.isBlank()) return List.of();
        return Arrays.asList(stages.split(STAGE_DELIMITER));
    }
}
