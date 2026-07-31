package com.example.demo.domain.admin.controller;

import java.util.List;

import javax.lang.model.type.NullType;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.admin.dto.request.AdminProjectUpdateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectDetailDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectListResponseDTO;
import com.example.demo.domain.admin.service.AdminProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BO 프로젝트 관리.
 *
 * <p>
 * <b>등록(POST)은 두지 않는다.</b> 프로젝트 등록은 소속·주소(좌표·지역코드)·기술태그·모집직군이
 * 함께 만들어져야 하는데({@code ProjectService} 참조), 그 연계를 BO 에서 반쪽만 만들면
 * 검색·지도에서 보이지 않는 유령 공고가 생긴다. 관리자는 조회·수정·삭제만 한다.
 * </p>
 */
@RestController
@RequestMapping("/admin/projects")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminProjectController {

    private final AdminProjectService adminProjectService;

    /**
     * 목록. {@code recruitStatus} 는 RECRUITING / SCHEDULED / CLOSED 를 <b>여러 개</b> 받는다
     * (예: {@code ?recruitStatus=RECRUITING&recruitStatus=SCHEDULED}). 미지정이면 전체다.
     * {@code includeDeleted=true} 면 삭제된 공고도 함께 본다.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminProjectListResponseDTO>> getProjects(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "recruitStatus", required = false) List<String> recruitStatus,
            @RequestParam(value = "includeDeleted", defaultValue = "false") boolean includeDeleted,
            @RequestParam(value = "sortField", defaultValue = "createdAt") String sortField,
            @RequestParam(value = "sortOrder", defaultValue = "DESC") String sortOrder,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 목록 조회 성공",
                adminProjectService.getProjects(keyword, recruitStatus, includeDeleted,
                        sortField, sortOrder, page, size)));
    }

    @GetMapping("/{projectSq}")
    public ResponseEntity<ApiResponse<AdminProjectDetailDTO>> getProject(
            @PathVariable("projectSq") Long projectSq) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트 상세 조회 성공",
                adminProjectService.getProject(projectSq)));
    }

    /** 수정. 넘기지 않은 필드는 기존 값을 유지한다. */
    @PatchMapping("/{projectSq}")
    public ResponseEntity<ApiResponse<NullType>> updateProject(
            @PathVariable("projectSq") Long projectSq,
            @Valid @RequestBody AdminProjectUpdateRequestDTO dto) {

        adminProjectService.updateProject(projectSq, dto);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트가 수정되었습니다.", null));
    }

    /** 논리 삭제. 지원 이력이 프로젝트를 참조하므로 행을 지우지 않는다. */
    @DeleteMapping("/{projectSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteProject(
            @PathVariable("projectSq") Long projectSq) {

        adminProjectService.setDeleted(projectSq, true);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트가 삭제되었습니다.", null));
    }

    /** 삭제 복구. 실수로 지운 공고를 되살린다 — 논리 삭제라 가능하다. */
    @PatchMapping("/{projectSq}/restore")
    public ResponseEntity<ApiResponse<NullType>> restoreProject(
            @PathVariable("projectSq") Long projectSq) {

        adminProjectService.setDeleted(projectSq, false);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "프로젝트가 복구되었습니다.", null));
    }
}
