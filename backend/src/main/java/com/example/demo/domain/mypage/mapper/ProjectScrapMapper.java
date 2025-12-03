package com.example.demo.domain.mypage.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.mypage.dto.CompanyDTO;
import com.example.demo.domain.mypage.dto.ProjectDTO;
import com.example.demo.domain.mypage.dto.ProjectScrapAddressDTO;

@Mapper
public interface ProjectScrapMapper {
    List<Long> findScrappedProjectSqsByUserSq(Long userSq);

    ProjectDTO findProjectBasic(Long projectSq);

    CompanyDTO findCompanyByProjectSq(Long projectSq);

    ProjectScrapAddressDTO findAddressByProjectSq(Long projectSq);

    String findEducationName(Long commonCodeSq);

    String findDeveloperGradeName(Long commonCodeSq);

    List<String> findSkillTagsByProjectSq(Long projectSq);

    int deleteByUserAndProject(@Param("userSq") Long userSq, @Param("projectSq") Long projectSq);

    List<Long> findScrappedProjectSqsByUserSqWithPaging(
            @Param("userSq") Long userSq,
            @Param("searchType") String searchType,
            @Param("searchKeyword") String searchKeyword,
            @Param("offset") int offset,
            @Param("limit") int limit);

    int countScrappedProjectsByUserSq(
            @Param("userSq") Long userSq,
            @Param("searchType") String searchType,
            @Param("searchKeyword") String searchKeyword);

	List<Long> getScrapProjectIds(Long userSq);
}