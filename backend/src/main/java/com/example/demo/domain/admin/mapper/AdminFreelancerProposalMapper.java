package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.admin.dto.response.AdminFreelancerProposalResponseDTO;

@Mapper
public interface AdminFreelancerProposalMapper {
	List<AdminFreelancerProposalResponseDTO> selectAllProposal();
}
