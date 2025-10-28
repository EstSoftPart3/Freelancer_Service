package com.example.demo.domain.admin.mapper;

import com.example.demo.domain.admin.dto.response.AdminMemberResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {
    
    /**
     * 회원 목록 조회 (페이지네이션, 필터링)
     */
    List<AdminMemberResponse> selectMemberList(
            @Param("searchQuery") String searchQuery,
            @Param("userTypeCd") Long userTypeCd,
            @Param("userIsActivateYn") String userIsActivateYn,
            @Param("offset") int offset,
            @Param("size") int size
    );
    
    /**
     * 회원 목록 전체 개수 조회 (필터링 조건 포함)
     */
    long countMemberList(
            @Param("searchQuery") String searchQuery,
            @Param("userTypeCd") Long userTypeCd,
            @Param("userIsActivateYn") String userIsActivateYn
    );
    
    /**
     * 회원 상세 정보 조회
     */
    AdminMemberResponse selectMemberDetail(@Param("userSq") Long userSq);
    
    /**
     * 회원 계정 상태 변경 (활성화/비활성화)
     */
    int updateMemberStatus(
            @Param("userSq") Long userSq,
            @Param("userIsActivateYn") String userIsActivateYn
    );
}

