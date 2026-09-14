package com.example.demo.domain.vote.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.domain.vote.dto.request.VoteCreateRequest;
import com.example.demo.domain.vote.dto.response.VoteDetailResponse;
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

    public VoteListResponse getAllVotes(String keyword, String sortType, Long page, Long size) {
        Long offset = (page - 1L) * size;
        List<com.example.demo.domain.vote.dto.response.VoteListItemDTO> votes = voteMapper.findAll(keyword, sortType,
                size, offset);
        Long totalElements = voteMapper.findAllCnt(keyword);
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
                .voteEndDt(vote.getVoteEndDt())
                .voteCreatedAtDtm(vote.getVoteCreatedAtDtm())
                .voteViewCnt(vote.getVoteViewCnt())
                .closed(vote.getVoteEndDt() != null && vote.getVoteEndDt().isBefore(LocalDateTime.now()))
                .totalVoteCnt(totalVoteCnt)
                .myVoteOptionSq(myVoteOptionSq)
                .options(options)
                .build();
    }

    public Long createVote(VoteCreateRequest request) {
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "선택지는 2개 이상이어야 합니다.");
        }

        Vote vote = new Vote();
        vote.setUserSq(request.getUserSq());
        vote.setVoteTtl(request.getVoteTtl());
        vote.setVoteDescriptionEdt(request.getVoteDescriptionEdt());
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
