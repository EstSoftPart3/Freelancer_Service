package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.AdminUsersListDTO;

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
}
