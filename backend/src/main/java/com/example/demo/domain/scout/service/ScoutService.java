package com.example.demo.domain.scout.service;

import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.domain.scout.dto.request.ScoutListRequestDto;
import com.example.demo.domain.scout.dto.request.ScoutRequestDto;
import com.example.demo.domain.scout.dto.response.ScoutDetailResponse;
import com.example.demo.domain.scout.dto.response.ScoutListResponseDto;
import com.example.demo.domain.scout.dto.response.ScoutResponseDto;
import com.example.demo.domain.scout.entity.ScoutEntity;
import com.example.demo.domain.scout.mapper.ScoutMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScoutService {
	
	private final ScoutMapper scoutMapper;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public ScoutResponseDto createScoutOffer(Long companySq, ScoutRequestDto dto) {
        ScoutEntity scoutOffer = ScoutEntity.builder()
                .companySq(companySq)
                .resumeSq(dto.getFreelancerSq())
                .projectSq(dto.getProjectSq())
                .scoutOfferTtl(dto.getTitle())
                .scoutOfferCnt(dto.getContent())
                .scoutOfferSalary(dto.getOfferedPay())
                .scoutOfferStatusCd("PENDING")
                .build();

        scoutMapper.insertScoutOffer(scoutOffer);

        ScoutEntity saved = scoutMapper.selectScoutOfferById(scoutOffer.getScoutOfferSq());

        return ScoutResponseDto.builder()
                .scoutSq(saved.getScoutOfferSq())
                .status(saved.getScoutOfferStatusCd())
                .createdAt(saved.getScoutOfferCreatedAtDtm().format(FORMATTER))
                .build();
    }
    
    public ScoutListResponseDto getScoutList(ScoutListRequestDto req, Long userSq) {
        int offset = req.getOffset();
        int size = req.getSize();

        List<ScoutListResponseDto.ScoutItem> scouts = scoutMapper.selectScoutList(userSq, req.getStatus(), offset, size, req.getSearchType(), req.getKeyword());
        long totalElements = scoutMapper.selectScoutCount(userSq, req.getStatus(), req.getSearchType(), req.getKeyword());

        int totalPages = (int) Math.ceil((double) totalElements / size);
        boolean isLast = (req.getPage() + 1) >= totalPages;

        ScoutListResponseDto.PageInfo pageInfo = ScoutListResponseDto.PageInfo.builder()
                .currentPage(req.getPage())
                .totalPages(totalPages)
                .totalElements(totalElements)
                .isLast(isLast)
                .build();

        ScoutListResponseDto.DataContainer dataContainer = ScoutListResponseDto.DataContainer.builder()
                .scouts(scouts)
                .pageInfo(pageInfo)
                .build();

        return ScoutListResponseDto.builder()
                .data(dataContainer)
                .build();
    }
    
    @Transactional
    public ScoutDetailResponse getScoutDetail(Long scoutSq) {
        ScoutDetailResponse detail = scoutMapper.selectScoutDetail(scoutSq);
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않는 스카우트 제안입니다. (sq: " + scoutSq + ")");
        }
        return detail;
    }

    /**
     * 스카우트 제안 상태 변경 (수락 / 거절)
     */
    @Transactional
    public void updateStatus(Long scoutSq, String status) {
        int updatedRows = scoutMapper.updateScoutStatus(scoutSq, status);
        if (updatedRows == 0) {
            throw new IllegalStateException("스카우트 제안 상태 변경 실패. (sq: " + scoutSq + ")");
        }
    }

}
