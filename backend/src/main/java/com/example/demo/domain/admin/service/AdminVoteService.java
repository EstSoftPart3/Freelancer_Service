package com.example.demo.domain.admin.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.domain.admin.dto.request.AdminVoteUpdateRequestDTO;
import com.example.demo.domain.admin.mapper.AdminVoteMapper;
import com.example.demo.domain.vote.dto.response.VoteDetailResponse;
import com.example.demo.domain.vote.dto.response.VoteListItemDTO;
import com.example.demo.domain.vote.dto.response.VoteListResponse;
import com.example.demo.domain.vote.dto.response.VoteOptionResultDTO;
import com.example.demo.domain.vote.entity.Vote;
import com.example.demo.domain.vote.entity.VoteOption;
import com.example.demo.domain.vote.mapper.VoteMapper;
import com.example.demo.domain.vote.service.VoteService;

import lombok.RequiredArgsConstructor;

/**
 * BO 투표 관리. 투표 등록/삭제는 {@link com.example.demo.domain.vote.service.VoteService} 를
 * 직접 재사용한다(AdminBoardController 가 게시글 등록에 BoardService 를 그대로 쓰는 것과 같은 이유
 * — FO 와 다른 검증 규칙이 생기지 않게). 목록·상세·수정만 이 서비스가 맡는다.
 */
@Service
@RequiredArgsConstructor
public class AdminVoteService {

    private final AdminVoteMapper adminVoteMapper;
    private final VoteMapper voteMapper;

    @Transactional(readOnly = true)
    public VoteListResponse getAdminVotes(String keyword, Long category, String sortType, Long page, Long size) {
        if (page == null || page < 1) {
            page = 1L;
        }
        if (size == null || size < 1) {
            size = 10L;
        }
        if (size > 100) {
            size = 100L;
        }
        Long offset = (page - 1) * size;

        List<VoteListItemDTO> votes = adminVoteMapper.findAllForAdmin(keyword, category, sortType, offset, size);
        Long totalElements = adminVoteMapper.countForAdmin(keyword, category);

        return VoteListResponse.builder()
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .votes(votes)
                .build();
    }

    /**
     * 상세. FO 의 {@code VoteService.getVote} 는 삭제된 투표를 404 로 막지만, BO 는 감사를 위해
     * 삭제된 투표도 볼 수 있어야 하므로 그 가드 없이 직접 조립한다.
     */
    @Transactional(readOnly = true)
    public VoteDetailResponse getAdminVote(Long voteSq) {
        Vote vote = voteMapper.findById(voteSq);
        if (vote == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 투표입니다.");
        }

        List<VoteOptionResultDTO> options = voteMapper.findOptionResultsByVoteSq(voteSq);
        Long totalVoteCnt = voteMapper.countTotalBallots(voteSq);

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
                .voteIsDeletedYn(vote.getVoteIsDeletedYn())
                .options(options)
                .build();
    }

    /**
     * 수정. 선택지(options)는 참여자가 한 명도 없을 때만 바꿀 수 있다 — 사용자 확정 정책
     * (참여자가 있으면 결과 집계 무결성이 깨지므로 제목/설명/카테고리/마감일만 허용).
     */
    @Transactional
    public void updateVote(Long voteSq, AdminVoteUpdateRequestDTO request) {
        Vote vote = voteMapper.findById(voteSq);
        if (vote == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 투표입니다.");
        }
        if (request.getVoteCategoryCd() == null || !VoteService.VALID_CATEGORY_CODES.contains(request.getVoteCategoryCd())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리를 선택해주세요.");
        }
        if (request.getVoteTtl() == null || request.getVoteTtl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제목을 입력해주세요.");
        }
        if (request.getVoteEndDt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "마감 일시를 선택해주세요.");
        }

        vote.setVoteTtl(request.getVoteTtl());
        vote.setVoteDescriptionEdt(request.getVoteDescriptionEdt());
        vote.setVoteCategoryCd(request.getVoteCategoryCd());
        vote.setVoteEndDt(request.getVoteEndDt());
        adminVoteMapper.updateVoteMaster(vote);

        if (request.getOptions() != null) {
            Long ballotCnt = voteMapper.countTotalBallots(voteSq);
            if (ballotCnt > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 참여자가 있어 선택지를 수정할 수 없습니다.");
            }
            if (request.getOptions().size() < 2
                    || request.getOptions().stream().anyMatch(opt -> opt == null || opt.isBlank())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "선택지는 2개 이상 입력해주세요.");
            }
            adminVoteMapper.deleteOptionsByVoteSq(voteSq);
            int order = 0;
            for (String optionNm : request.getOptions()) {
                VoteOption option = new VoteOption();
                option.setVoteSq(voteSq);
                option.setVoteOptionNm(optionNm);
                option.setVoteOptionOrder(order++);
                voteMapper.insertOption(option);
            }
        }
    }

    /** 삭제(논리). 작성자 조건 없는 마스터 쿼리 — 관리자는 남의 투표도 지울 수 있어야 한다. */
    @Transactional
    public void deleteVote(Long voteSq) {
        Vote vote = voteMapper.findById(voteSq);
        if (vote == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 투표입니다.");
        }
        adminVoteMapper.deleteVoteMaster(voteSq);
    }
}
