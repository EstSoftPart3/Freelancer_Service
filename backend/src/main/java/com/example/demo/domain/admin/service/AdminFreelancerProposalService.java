package com.example.demo.domain.admin.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.admin.dto.response.AdminFreelancerProposalResponseDTO;
import com.example.demo.domain.admin.mapper.AdminFreelancerProposalMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminFreelancerProposalService {
	
	private final AdminFreelancerProposalMapper mapper;
	
	
	
	public List<AdminFreelancerProposalResponseDTO> getAllProposal() {
		log.info("프리랜서 제안 목록 조회 시작");
		List<AdminFreelancerProposalResponseDTO> result =
				mapper.selectAllProposal();
		log.info("프리랜서 제안 목록 조회 완료 - {} 건", result.size());
		return result;
	}
	
	

}
