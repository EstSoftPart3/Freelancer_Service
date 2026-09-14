package com.example.demo.domain.freelancer.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.freelancer.dto.PageInfoDto;
import com.example.demo.domain.freelancer.dto.request.FreelancerRequestDto;
import com.example.demo.domain.freelancer.dto.response.FreelancerResponseDto;
import com.example.demo.domain.freelancer.dto.response.FreelancerSearchResponse;
import com.example.demo.domain.freelancer.dto.response.FreelancerSearchResponse.Container;
import com.example.demo.domain.freelancer.mapper.FreelancerMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FreelancerService {
	
	private final FreelancerMapper freelancerMapper;

    @Transactional(readOnly = true)
    public FreelancerSearchResponse searchFreelancers(FreelancerRequestDto requestDto) {
        int offset = requestDto.getPage() * requestDto.getSize();
        
        List<FreelancerResponseDto> freelancers = freelancerMapper.selectFreelancers(requestDto, offset);
        for (FreelancerResponseDto item : freelancers) {
            List<String> skillList = freelancerMapper.selectFreelancerSkills(item.getFreelancerSq());
            item.setSkills(skillList);
        }

        long totalElements = freelancerMapper.countFreelancers(requestDto);
        int totalPages = (int) Math.ceil((double) totalElements / requestDto.getSize());
        boolean isLast = (requestDto.getPage() + 1) >= totalPages;

        PageInfoDto pageInfo = PageInfoDto.builder()
                .currentPage(requestDto.getPage())
                .totalPages(totalPages)
                .totalElements(totalElements)
                .isLast(isLast)
                .build();

        Container container = FreelancerSearchResponse.Container.builder()
                .freelancers(freelancers)
                .pageInfo(pageInfo)
                .build();

        return FreelancerSearchResponse.builder()
                .data(container)
                .build();
    }

}
