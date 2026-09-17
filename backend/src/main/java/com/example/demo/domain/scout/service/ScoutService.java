package com.example.demo.domain.scout.service;

import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.domain.scout.dto.request.ScoutListRequestDto;
import com.example.demo.domain.scout.dto.request.ScoutRequestDto;
import com.example.demo.domain.scout.dto.request.ScoutStatusUpdateRequestDto;
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
    public ScoutResponseDto createScoutOffer(Long companySq, ScoutRequestDto reuqest) {
        ScoutEntity scoutOffer = ScoutEntity.builder()
                .companySq(companySq)
                .resumeSq(reuqest.getFreelancerSq())
                .projectSq(reuqest.getProjectSq())
                .scoutOfferTtl(reuqest.getTitle())
                .scoutOfferCnt(reuqest.getContent())
                .scoutOfferSalary(reuqest.getOfferedPay())
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
    
    public ScoutListResponseDto getScoutList(ScoutListRequestDto request, Long userSq) {
        int offset = request.getOffset();
        int size = request.getSize();

        List<ScoutListResponseDto.ScoutItem> scouts = scoutMapper.selectScoutList(userSq, request.getStatus(), offset, size, request.getSearchType(), request.getKeyword());
        long totalElements = scoutMapper.selectScoutCount(userSq, request.getStatus(), request.getSearchType(), request.getKeyword());

        int totalPages = (int) Math.ceil((double) totalElements / size);
        boolean isLast = (request.getPage() + 1) >= totalPages;

        ScoutListResponseDto.PageInfo pageInfo = ScoutListResponseDto.PageInfo.builder()
                .currentPage(request.getPage())
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

    @Transactional
    public void updateStatus(Long scoutSq, ScoutStatusUpdateRequestDto request) {
        int updatedRows = scoutMapper.updateScoutStatus(scoutSq, request.getStatus(), request.getRejectReason());
        if (updatedRows == 0) {
            throw new IllegalStateException("스카우트 제안 상태 변경 실패. (sq: " + scoutSq + ")");
        }
    }

}
