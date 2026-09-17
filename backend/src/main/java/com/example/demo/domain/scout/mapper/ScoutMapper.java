package com.example.demo.domain.scout.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.scout.dto.response.ScoutDetailResponse;
import com.example.demo.domain.scout.dto.response.ScoutListResponseDto;
import com.example.demo.domain.scout.entity.ScoutEntity;

@Mapper
public interface ScoutMapper {
	
	// 스카우트 제안 등록 (PK 자동 생성)
    int insertScoutOffer(ScoutEntity scoutOffer);
    
    // 생성된 데이터 단건 조회 (응답 데이터 생성용)
    ScoutEntity selectScoutOfferById(Long scoutOfferSq);
    
    List<ScoutListResponseDto.ScoutItem> selectScoutList(
            @Param("userSq") Long userSq,
            @Param("status") String status,
            @Param("offset") int offset,
            @Param("size") int size,
            @Param("searchType") String searchType,
            @Param("keyword") String keyword
    );

    long selectScoutCount(
            @Param("userSq") Long userSq,
            @Param("status") String status,
            @Param("searchType") String searchType,
            @Param("keyword") String keyword
    );
    
    // 상세 단건 조회
    ScoutDetailResponse selectScoutDetail(@Param("scoutSq") Long scoutSq);

    // 상태 변경 (ACCEPTED, REJECTED)
    int updateScoutStatus(@Param("scoutSq") Long scoutSq,
    					  @Param("status") String status,
    					  @Param("rejectReason") String rejectReason);
}


