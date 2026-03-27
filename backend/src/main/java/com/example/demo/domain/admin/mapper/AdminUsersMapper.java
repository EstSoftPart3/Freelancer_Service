package com.example.demo.domain.admin.mapper;

import java.util.List;

import com.example.demo.domain.admin.dto.request.AdminUsersUpdateCompanyRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminUsersCompanyListResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.domain.admin.dto.AdminUsersListDTO;
import com.example.demo.domain.admin.dto.request.AdminUsersUpdateRequestDTO;

@Mapper
public interface AdminUsersMapper {
    List<AdminUsersListDTO> findAllUsers(
            @Param("typeCds") List<Long> typeCds,
            @Param("companySqs") List<Long> companySqs,
            @Param("userGenderCds") List<Long> userGenderCds,
            @Param("keyword") String keyword,
            @Param("tagKeyword") String tagKeyword,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder,
            @Param("offset") Long offset,
            @Param("size") Long size);

    Long findAllUsersCnt(
            @Param("typeCds") List<Long> typeCds,
            @Param("companySqs") List<Long> companySqs,
            @Param("userGenderCds") List<Long> userGenderCds,
            @Param("keyword") String keyword,
            @Param("tagKeyword") String tagKeyword);

    List<AdminUsersCompanyListResponseDTO> findAllCompanies(@Param("keyword") String keyword);

    List<AdminUsersCompanyListResponseDTO> findCompany(
            @Param("companySq") Long companySq
    );

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

    /** 일반 유저를 특정 회사에 소속시키는 JOIN 기록 */
    void insertCompanyMember(
            @Param("userSq") Long userSq,
            @Param("companySq") Long companySq);

    /** 현재 활성 소속을 LEAVE 처리 (leave_dt = NOW, status = 402) */
    void updateCompanyMemberLeave(@Param("userSq") Long userSq);

    /** 회사 정보 수정 */
    void updateCompany(
            @Param("companySq") Long companySq,
            @Param("dto") AdminUsersUpdateCompanyRequestDTO dto);

    void insertFile(
    		@Param("uploaded") UploadedFileDTO uploaded);
    
    Long findFileSqBySavedNm(
    		@Param("savedNm") String savedNm);
    
    void insertUserProfileImage(
    		@Param("userSq") Long userSq,
    		@Param("fileSq") Long fileSq);
}
