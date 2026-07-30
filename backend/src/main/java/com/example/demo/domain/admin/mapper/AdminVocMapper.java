package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.AdminBoardListDTO;

/**
 * BO 고객의 소리 관리 전용 조회.
 *
 * <p>
 * {@code AdminBoardMapper}(게시물 관리)와 합치지 않는다 — 그쪽은 게시글+답변 UNION 목록이고
 * 여기는 "문의 한 건 = 한 행 + 답변 개수"라 축이 다르다. 무엇보다 VOC 를 그 목록에 섞으면
 * 관리자가 비공개 문의를 일반 게시글과 같은 표에서 보게 되어 실수로 공개 답글을 달기 쉽다.
 * </p>
 */
@Mapper
public interface AdminVocMapper {

    Long countVocs(
            @Param("keyword") String keyword,
            @Param("answered") Boolean answered);

    List<AdminBoardListDTO> findAllVocs(
            @Param("keyword") String keyword,
            @Param("answered") Boolean answered,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder,
            @Param("offset") Long offset,
            @Param("size") Long size);
}
