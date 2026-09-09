package com.example.demo.domain.mypage.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.example.demo.domain.mypage.dto.response.ResumeSkillPairResponse;
import com.example.demo.domain.mypage.dto.request.ResumeSkillRequest;
import com.example.demo.domain.mypage.dto.response.ResumeSkillDataResponse;

import org.apache.ibatis.annotations.Param;

@Mapper
public interface ResumeSkillMapper {
    // 전체 조회
    List<ResumeSkillDataResponse> findAllSkillTags();

    // 이력서별 보유 기술명 전체 조회
    List<String> findAllNmBySq(@Param("resumeSq") Long resumeSq);

    // 대분류-소분류 트리 구조 조회
    // List<ResumeSkillPairResponse> findSkillInfoList();

    // 기술명으로 태그 정보 조회 (예: skill_tag_sq, parent_skill_tag_sq 등)
    // ResumeSkillDataResponse findSkillTagInfoByName(@Param("name") String name);

    // 특정 기술의 상위(대분류) skill_tag_sq 조회
    // Long findParentSkillTagSq(@Param("skill_tag_sq") Long skillTagSq);

    // 이력서별 보유 기술 삭제
    void deleteSkillsByResumeSq(@Param("resumeSq") Long resumeSq);

    // 이력서별 보유 기술명 전체 조회
    // List<String> findAllSkillsByResumeSq(@Param("resumeSq") Long resumeSq);

    // 이력서별 보유 기술 추가 (여러 개)
    void insertSkills(@Param("resumeSq") Long resumeSq, @Param("skills") List<ResumeSkillRequest> skills);

    // (필요하다면) 이력서별 보유 기술 단건 추가
    void insertSkill(@Param("resumeSq") Long resumeSq, @Param("skill") ResumeSkillRequest skill);

}