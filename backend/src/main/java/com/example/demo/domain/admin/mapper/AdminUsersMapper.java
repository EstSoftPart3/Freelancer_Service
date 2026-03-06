package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.domain.admin.dto.AdminUsersListDTO;
import com.example.demo.domain.admin.dto.request.AdminUsersUpdateRequestDTO;

@Mapper
public interface AdminUsersMapper {
    List<AdminUsersListDTO> findAllUsers(
            @Param("typeCds") List<Long> typeCds,
            @Param("keyword") String keyword,
            @Param("tagKeyword") String tagKeyword,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder,
            @Param("offset") Long offset,
            @Param("size") Long size);
    
    Long findAllUsersCnt(
    		@Param("typeCds") List<Long> typeCds,
            @Param("keyword") String keyword,
            @Param("tagKeyword") String tagKeyword);
    
    void updateUser(
    		@Param("userSq") Long userSq,
    		@Param("dto") AdminUsersUpdateRequestDTO dto,
    		@Param("encodePw") String encodePw);
    
    Long findFileSqByUserSq(
    		@Param("userSq") Long userSq);
    
    String findFileSaveNmByFileSq(
    		@Param("fileSq") Long fileSq);
    
    void updateFileSaveNm(
    		@Param("fileSq") Long fileSq,
    		@Param("savedNm") String savedNm);
    
    void updateCompanyNm(
    		@Param("userSq") Long userSq,
    		@Param("companyNm") String companyNm);
    
    void insertFile(
    		@Param("uploaded") UploadedFileDTO uploaded);
    
    Long findFileSqBySavedNm(
    		@Param("savedNm") String savedNm);
    
    void insertUserProfileImage(
    		@Param("userSq") Long userSq,
    		@Param("fileSq") Long fileSq);
}
