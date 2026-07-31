package com.example.demo.domain.admin.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.util.SortDirectionUtil;
import com.example.demo.domain.admin.dto.request.AdminProjectUpdateRequestDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectDetailDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectListDTO;
import com.example.demo.domain.admin.dto.response.AdminProjectListResponseDTO;
import com.example.demo.domain.admin.mapper.AdminProjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminProjectService {

    /** 매퍼 {@code <choose>} 가 아는 값. 그 외는 무시하고 전체를 보여준다. */
    private static final Set<String> RECRUIT_STATUSES = Set.of("RECRUITING", "SCHEDULED", "CLOSED");

    private final AdminProjectMapper adminProjectMapper;

    @Transactional(readOnly = true)
    public AdminProjectListResponseDTO getProjects(String keyword, List<String> recruitStatuses,
            boolean includeDeleted, String sortField, String sortOrder, Long page, Long size) {

        // 알 수 없는 상태값은 걸러낸다. 전부 걸러져 비면 필터를 걸지 않은 것으로 본다 —
        // URL 을 손으로 고친 경우 빈 목록보다 전체 목록이 덜 혼란스럽다.
        List<String> safeStatuses = (recruitStatuses == null)
                ? null
                : recruitStatuses.stream().filter(RECRUIT_STATUSES::contains).collect(Collectors.toList());
        if (safeStatuses != null && safeStatuses.isEmpty()) {
            safeStatuses = null;
        }

        Long offset = (page - 1) * size;
        Long totalElements = adminProjectMapper.countProjects(keyword, safeStatuses, includeDeleted);
        // sortOrder 는 XML 에서 ${sortOrder} 로 직접 삽입되므로 ASC/DESC 로 정규화(SQL Injection 방지)
        List<AdminProjectListDTO> projects = adminProjectMapper.findAllProjects(
                keyword, safeStatuses, includeDeleted, sortField,
                SortDirectionUtil.normalize(sortOrder), offset, size);

        return AdminProjectListResponseDTO.builder()
                .projects(projects)
                .totalElements(totalElements)
                .page(page)
                .size(size)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminProjectDetailDTO getProject(Long projectSq) {
        AdminProjectDetailDTO detail = adminProjectMapper.findProject(projectSq);
        if (detail == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 프로젝트입니다.");
        }
        return detail;
    }

    @Transactional
    public void updateProject(Long projectSq, AdminProjectUpdateRequestDTO dto) {
        if (adminProjectMapper.findProject(projectSq) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 프로젝트입니다.");
        }
        validateDates(projectSq, dto);
        adminProjectMapper.updateProject(projectSq, dto);
    }

    /**
     * 논리 삭제/복구. 물리 삭제하지 않는 이유는 지원 이력({@code TBL_PROJECT_APPLICATION_H})이
     * 프로젝트를 참조하고 있어서다 — 행을 지우면 지원자의 지원 내역이 깨진다.
     */
    @Transactional
    public void setDeleted(Long projectSq, boolean deleted) {
        if (adminProjectMapper.findProject(projectSq) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 프로젝트입니다.");
        }
        adminProjectMapper.softDeleteProject(projectSq, deleted);
    }

    /**
     * 날짜 규칙 검증. <b>Phase 3에서 확정한 규칙을 그대로 쓴다</b> —
     * 모집 종료 &le; 수행 종료는 강제하되, <b>모집 종료 &gt; 수행 시작은 허용</b>한다.
     * 실측상 전체 공고의 다수가 "수행 중 추가 모집"이었기 때문에 이 서비스에서는 예외가 아니다.
     *
     * <p>
     * 부분 수정(PATCH)이라 넘어온 값만으로는 판단할 수 없다. 빠진 값은 기존 값으로 채워
     * <b>저장 후의 최종 상태</b>를 기준으로 검사한다 — 종료일만 당겨 보내는 경우를 놓치지 않기 위해서다.
     * </p>
     */
    private void validateDates(Long projectSq, AdminProjectUpdateRequestDTO dto) {
        AdminProjectDetailDTO current = adminProjectMapper.findProject(projectSq);

        LocalDate recruitStart = dto.getRecruitStartDt() != null ? dto.getRecruitStartDt() : current.getRecruitStartDt();
        LocalDate recruitEnd = dto.getRecruitEndDt() != null ? dto.getRecruitEndDt() : current.getRecruitEndDt();
        LocalDate workStart = dto.getProjectStartDt() != null ? dto.getProjectStartDt() : current.getProjectStartDt();
        LocalDate workEnd = dto.getProjectEndDt() != null ? dto.getProjectEndDt() : current.getProjectEndDt();

        if (recruitStart != null && recruitEnd != null && recruitStart.isAfter(recruitEnd)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "모집 시작일이 모집 종료일보다 늦을 수 없습니다.");
        }
        if (workStart != null && workEnd != null && workStart.isAfter(workEnd)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "수행 시작일이 수행 종료일보다 늦을 수 없습니다.");
        }
        if (recruitEnd != null && workEnd != null && recruitEnd.isAfter(workEnd)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "모집 종료일이 수행 종료일보다 늦을 수 없습니다.");
        }
    }
}
