package com.example.demo.domain.admin.service;

import com.example.demo.domain.admin.dto.response.AdminMemberListResponse;
import com.example.demo.domain.admin.dto.response.AdminMemberResponse;
import com.example.demo.domain.admin.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final AdminMapper adminMapper;
    
    /**
     * 회원 목록 조회 (페이지네이션, 필터링)
     */
    public AdminMemberListResponse getMemberList(
            String searchQuery,
            Long userTypeCd,
            String userIsActivateYn,
            int page,
            int size
    ) {
        // 페이지네이션 offset 계산
        int offset = page * size;
        
        // 회원 목록 조회
        List<AdminMemberResponse> members = adminMapper.selectMemberList(
                searchQuery,
                userTypeCd,
                userIsActivateYn,
                offset,
                size
        );
        
        // 전체 개수 조회
        long totalElements = adminMapper.countMemberList(searchQuery, userTypeCd, userIsActivateYn);
        
        // 전체 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        return AdminMemberListResponse.builder()
                .content(members)
                .currentPage(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }
    
    /**
     * 회원 상세 정보 조회
     */
    public AdminMemberResponse getMemberDetail(Long userSq) {
        AdminMemberResponse member = adminMapper.selectMemberDetail(userSq);
        if (member == null) {
            throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
        }
        return member;
    }
    
    /**
     * 회원 계정 상태 변경 (활성화/비활성화)
     */
    @Transactional
    public void updateMemberStatus(Long userSq, String userIsActivateYn) {
        // Y 또는 N만 허용
        if (!userIsActivateYn.equals("Y") && !userIsActivateYn.equals("N")) {
            throw new IllegalArgumentException("올바르지 않은 상태 값입니다.");
        }
        
        int result = adminMapper.updateMemberStatus(userSq, userIsActivateYn);
        if (result == 0) {
            throw new RuntimeException("회원 상태 변경에 실패했습니다.");
        }
    }
    
    /**
     * 프로젝트 활성화 상태 변경
     */
    @Transactional
    public void updateProjectActivateStatus(Long projectSq, String projectActivateYn) {
        // Y 또는 N만 허용
        if (!projectActivateYn.equals("Y") && !projectActivateYn.equals("N")) {
            throw new IllegalArgumentException("올바르지 않은 상태 값입니다.");
        }
        
        int result = adminMapper.updateProjectActivateStatus(projectSq, projectActivateYn);
        if (result == 0) {
            throw new RuntimeException("프로젝트 상태 변경에 실패했습니다.");
        }
    }
}

