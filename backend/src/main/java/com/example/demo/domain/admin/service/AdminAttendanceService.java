package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.domain.admin.dto.AdminAttendanceListDTO;
import com.example.demo.domain.admin.dto.response.AdminAttendanceListResponseDTO;
import com.example.demo.domain.admin.mapper.AdminAttendanceMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminAttendanceService {

    private final AdminAttendanceMapper adminAttendanceMapper;

    public AdminAttendanceListResponseDTO getAdminAttendanceList(
            Long page,
            Long size,
            String startDate,
            String endDate
    ) {
        if (page == null || page < 1) {
            page = 1L;
        }

        if (size == null || size < 1) {
            size = 10L;
        }

        int offset = (int) ((page - 1) * size);

        List<AdminAttendanceListDTO> attendances =
                adminAttendanceMapper.selectAdminAttendanceList(
                        startDate,
                        endDate,
                        offset,
                        size.intValue()
                );

        Long totalElements =
                adminAttendanceMapper.selectAdminAttendanceCount(
                        startDate,
                        endDate
                );

        return AdminAttendanceListResponseDTO.builder()
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .attendances(attendances)
                .build();
    }
}