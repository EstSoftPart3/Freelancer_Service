package com.example.demo.domain.mypage.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.mypage.dto.ApplicationPassDTO;

@Mapper
public interface ApplicationMapper {

    // 해당 유저가 이미 소속되어 있는지 확인
    boolean existsCompanyAffiliation(Long userSq);

    // 지원자 정보 가져오기
    ApplicationPassDTO findApplicationDetail(Long applicationSq);

    // 소속 정보 등록
    void insertCompanyMember(ApplicationPassDTO dto);
}
