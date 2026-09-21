package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.vote.dto.response.VoteListItemDTO;
import com.example.demo.domain.vote.entity.Vote;

@Mapper
public interface AdminVoteMapper {

    List<VoteListItemDTO> findAllForAdmin(@Param("keyword") String keyword, @Param("category") Long category,
            @Param("sortType") String sortType, @Param("offset") Long offset, @Param("size") Long size);

    Long countForAdmin(@Param("keyword") String keyword, @Param("category") Long category);

    void updateVoteMaster(Vote vote);

    void deleteOptionsByVoteSq(@Param("voteSq") Long voteSq);

    void deleteVoteMaster(@Param("voteSq") Long voteSq);
}
