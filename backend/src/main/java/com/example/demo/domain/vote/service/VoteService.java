package com.example.demo.domain.vote.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.domain.vote.dto.request.VoteCreateRequest;
import com.example.demo.domain.vote.dto.response.VoteDetailResponse;
import com.example.demo.domain.vote.dto.response.VoteListItemDTO;
import com.example.demo.domain.vote.dto.response.VoteListResponse;
import com.example.demo.domain.vote.dto.response.VoteOptionResultDTO;
import com.example.demo.domain.vote.entity.Vote;
import com.example.demo.domain.vote.entity.VoteOption;
import com.example.demo.domain.vote.mapper.VoteMapper;

import lombok.RequiredArgsConstructor;

/**
 * 투표(Vote) 전용 도메인. 댓글·추천·신고 없음(사용자 확정 MVP 범위) — 게시판(TBL_BOARD_M)을
 * 재사용하지 않고 TBL_VOTE_M / TBL_VOTE_OPTION_S / TBL_VOTE_RECORD_S 세 테이블을 새로 판다.
 *
 * <p>
 * 중복 투표 방지는 {@code TBL_VOTE_RECORD_S} 의 {@code UNIQUE(vote_sq, user_sq)} 가 최종 방어선이다.
 * {@link #findMyOptionSq} 로 먼저 걸러 사용자에게 친절한 메시지를 주고, 동시 요청 레이스는
 * DB 제약 위반({@link DuplicateKeyException})을 409로 변환해 처리한다.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteMapper voteMapper;

    // 공통코드 3250(IT) / 3251(일반) — parent 1410(투표_카테고리).
    private static final Set<Long> VALID_CATEGORY_CODES = Set.of(3250L, 3251L);

    public VoteListResponse getAllVotes(String keyword, String sortType, Long category, Long page, Long size) {
        // page/size 를 그대로 LIMIT/OFFSET 에 흘려보내면 ?page=0·음수 는 음수 OFFSET 으로,
        // ?size=0·음수 는 음수 LIMIT 으로 내려가 SQL 문법 오류 500 이 난다
        // (BoardService.getAllBoards 와 동일한 함정). 여기서 방어한다.
        if (page == null || page < 1) {
            page = 1L;
        }
        if (size == null || size < 1) {
            size = 10L;
        }
        if (size > 100) {
            size = 100L;
        }
        Long offset = (page - 1L) * size;
        List<VoteListItemDTO> votes = voteMapper.findAll(keyword, sortType, category, size, offset);
        Long totalElements = voteMapper.findAllCnt(keyword, category);
        return VoteListResponse.builder()
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .votes(votes)
                .build();
    }

    public VoteDetailResponse getVote(Long userSq, Long voteSq) {
        Vote vote = voteMapper.findById(voteSq);
        if (vote == null || "Y".equals(vote.getVoteIsDeletedYn())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 투표입니다.");
        }

        List<VoteOptionResultDTO> options = voteMapper.findOptionResultsByVoteSq(voteSq);
        Long totalVoteCnt = voteMapper.countTotalBallots(voteSq);
        Long myVoteOptionSq = userSq == null ? null : voteMapper.findMyOptionSq(voteSq, userSq);

        return VoteDetailResponse.builder()
                .voteSq(vote.getVoteSq())
                .voteTtl(vote.getVoteTtl())
                .voteDescriptionEdt(vote.getVoteDescriptionEdt())
                .userSq(vote.getUserSq())
                .userNickname(vote.getUserNickname())
                .voteCategoryCd(vote.getVoteCategoryCd())
                .voteEndDt(vote.getVoteEndDt())
                .voteCreatedAtDtm(vote.getVoteCreatedAtDtm())
                .voteViewCnt(vote.getVoteViewCnt())
                .closed(vote.getVoteEndDt() != null && vote.getVoteEndDt().isBefore(LocalDateTime.now()))
                .totalVoteCnt(totalVoteCnt)
                .myVoteOptionSq(myVoteOptionSq)
                .options(options)
                .build();
    }

    @Transactional
    public Long createVote(VoteCreateRequest request) {
        // /api/votes 는 JwtAuthenticationFilter.EXCLUDE_URLS 에 접두사로 통째로 올라 있고
        // SecurityConfigProd 는 POST /votes 를 permitAll 하지 않는다 — 토큰이 없거나 만료되면
        // 필터가 인증 세팅 없이 그냥 통과시키는데, Spring Security 의 anyRequest().authenticated()
        // 는 익명 Authentication 도 "인증됨"으로 쳐서 컨트롤러까지 들어와 버린다
        // (b6291e11 에서 /api/projects 에 대해 고친 것과 동일한 함정). deleteVote/castBallot 은
        // 이미 이 null 가드가 있었는데 createVote 만 빠져 있어 비로그인/만료 토큰 사용자가
        // user_sq 없는 투표를 만들 수 있었다.
        if (request.getUserSq() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "선택지는 2개 이상이어야 합니다.");
        }
        if (request.getVoteCategoryCd() == null || !VALID_CATEGORY_CODES.contains(request.getVoteCategoryCd())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리를 선택해주세요.");
        }

        Vote vote = new Vote();
        vote.setUserSq(request.getUserSq());
        vote.setVoteTtl(request.getVoteTtl());
        vote.setVoteDescriptionEdt(request.getVoteDescriptionEdt());
        vote.setVoteCategoryCd(request.getVoteCategoryCd());
        vote.setVoteEndDt(request.getVoteEndDt());
        voteMapper.insertVote(vote);

        int order = 0;
        for (String optionNm : request.getOptions()) {
            VoteOption option = new VoteOption();
            option.setVoteSq(vote.getVoteSq());
            option.setVoteOptionNm(optionNm);
            option.setVoteOptionOrder(order++);
            voteMapper.insertOption(option);
        }

        return vote.getVoteSq();
    }

    public void deleteVote(Long userSq, Long voteSq) {
        if (userSq == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }
        Vote vote = voteMapper.findById(voteSq);
        if (vote == null || "Y".equals(vote.getVoteIsDeletedYn())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 투표입니다.");
        }
        int updated = voteMapper.deleteVote(voteSq, userSq);
        if (updated == 0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 투표만 삭제할 수 있습니다.");
        }
    }

    public void addViewCnt(Long voteSq) {
        voteMapper.addViewCnt(voteSq);
    }

    public void castBallot(Long userSq, Long voteSq, Long voteOptionSq) {
        if (userSq == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 후 이용해주세요.");
        }

        Vote vote = voteMapper.findById(voteSq);
        if (vote == null || "Y".equals(vote.getVoteIsDeletedYn())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 투표입니다.");
        }
        if (vote.getVoteEndDt() != null && vote.getVoteEndDt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "마감된 투표입니다.");
        }
        if (!voteMapper.existsOptionInVote(voteOptionSq, voteSq)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이 투표에 속하지 않는 선택지입니다.");
        }
        if (voteMapper.findMyOptionSq(voteSq, userSq) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 참여한 투표입니다.");
        }

        try {
            voteMapper.insertBallot(voteSq, voteOptionSq, userSq);
        } catch (DuplicateKeyException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 참여한 투표입니다.");
        }
    }
}
