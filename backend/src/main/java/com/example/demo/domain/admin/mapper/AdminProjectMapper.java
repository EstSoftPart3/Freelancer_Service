package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.request.AdminProjectUpdateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectDetailDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectListDTO;

@Mapper
public interface AdminProjectMapper {

    List<AdminProjectListDTO> findAllProjects(
            @Param("keyword") String keyword,
            @Param("recruitStatuses") List<String> recruitStatuses,
            @Param("includeDeleted") boolean includeDeleted,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder,
            @Param("offset") Long offset,
            @Param("size") Long size);

    Long countProjects(
            @Param("keyword") String keyword,
            @Param("recruitStatuses") List<String> recruitStatuses,
            @Param("includeDeleted") boolean includeDeleted);

    AdminProjectDetailDTO findProject(@Param("projectSq") Long projectSq);

    /**
     * 관리자 수정. <b>작성자 조건이 없다</b> — 그게 이 매퍼가 따로 있는 이유다.
     * FO 쪽 update 는 소유자 확인이 붙어 있어 관리자가 부르면 0행이 반영되고 조용히 성공한다.
     */
    int updateProject(@Param("projectSq") Long projectSq,
            @Param("dto") AdminProjectUpdateRequestDTO dto);

    /** 논리 삭제. 되돌릴 수 있도록 물리 삭제하지 않는다. */
    int softDeleteProject(@Param("projectSq") Long projectSq,
            @Param("deleted") boolean deleted);
}
