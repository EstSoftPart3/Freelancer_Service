package com.example.demo.domain.mypage.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.mypage.dto.response.ProjectScrapResponseDTO;
import com.example.demo.domain.mypage.service.ProjectScrapService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class ProjectScrapController {
    private final ProjectScrapService service;

    @GetMapping("/projectScrap")
    public ApiResponse<ProjectScrapResponseDTO> getScrapList(
            @AuthenticationPrincipal Long userSq,
            @RequestParam(required = false, defaultValue = "전체") String searchType,
            @RequestParam(required = false, defaultValue = "") String searchKeyword,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "4") int size) {
        ProjectScrapResponseDTO response = service.getScrappedProjects(userSq, searchType, searchKeyword, page, size);
        if (response.getContent().isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "스크랩한 프로젝트가 없습니다.");
        } else {
            return ApiResponse.of(HttpStatus.OK, "스크랩한 프로젝트 조회 완료", response);
        }
    }

    @DeleteMapping("/projectScrap/{projectSq}")
    public ApiResponse<Void> deleteScrap(@AuthenticationPrincipal Long userSq,
            @PathVariable("projectSq") Long projectSq) {
        boolean deleted = service.deleteProjectScrap(userSq, projectSq);
        if (deleted) {
            return ApiResponse.of(HttpStatus.OK, "스크랩 삭제 성공", null);
        } else {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "삭제할 스크랩이 없습니다.");
        }
    }

}