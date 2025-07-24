package com.example.demo.domain.company.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.company.dto.request.BaseRequest;
import com.example.demo.domain.company.dto.request.CompanyMemberSearchRequest;

@Mapper
public interface CompanyMapper {
    String findCompanyNmByCompanySq(@Param("companySq") Long companySq);

    String findCompanyImageUrlBySq(@Param("companySq") Long companySq);

    String findBizNumByUserSq(@Param("userSq") Long userSq);

    String findBizNumByCompanySq(@Param("companySq") Long companySq);

    Long countUsersBySearch(@Param("companySq") Long companySq, @Param("request") CompanyMemberSearchRequest request);

    Long findCompanySqByUserSq(@Param("userSq") Long userSq);

    Long findUserSqByCompanySq(@Param("companySq") Long companySq);

    Long findCompanyMemberStatus(@Param("userSq") Long userSq);

    List<Long> findUserSqsByCompanySqAndSearch(@Param("companySq") Long companySq,
            @Param("request") CompanyMemberSearchRequest request);

    LocalDate findCompanyJoinDt(@Param("userSq") Long userSq);

    LocalDate findCompanyLeaveDt(@Param("userSq") Long userSq);

    void updateMemberStatus(@Param("userSq") Long userSq, @Param("memberStatusCd") Long memberStatusCd);

}
