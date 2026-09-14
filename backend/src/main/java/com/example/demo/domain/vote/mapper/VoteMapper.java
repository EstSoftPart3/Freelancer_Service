package com.example.demo.domain.vote.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.vote.dto.response.VoteListItemDTO;
import com.example.demo.domain.vote.dto.response.VoteOptionResultDTO;
import com.example.demo.domain.vote.entity.Vote;
import com.example.demo.domain.vote.entity.VoteOption;

@Mapper
public interface VoteMapper {

    void insertVote(Vote vote);

    void insertOption(VoteOption option);

    Vote findById(@Param("voteSq") Long voteSq);

    List<VoteListItemDTO> findAll(@Param("keyword") String keyword, @Param("sortType") String sortType,
            @Param("size") Long size, @Param("offset") Long offset);

    Long findAllCnt(@Param("keyword") String keyword);

    List<VoteOption> findOptionsByVoteSq(@Param("voteSq") Long voteSq);

    List<VoteOptionResultDTO> findOptionResultsByVoteSq(@Param("voteSq") Long voteSq);

    Long countTotalBallots(@Param("voteSq") Long voteSq);

    Long findMyOptionSq(@Param("voteSq") Long voteSq, @Param("userSq") Long userSq);

    boolean existsOptionInVote(@Param("voteOptionSq") Long voteOptionSq, @Param("voteSq") Long voteSq);

    void insertBallot(@Param("voteSq") Long voteSq, @Param("voteOptionSq") Long voteOptionSq,
            @Param("userSq") Long userSq);

    void addViewCnt(@Param("voteSq") Long voteSq);

    int deleteVote(@Param("voteSq") Long voteSq, @Param("userSq") Long userSq);
}
