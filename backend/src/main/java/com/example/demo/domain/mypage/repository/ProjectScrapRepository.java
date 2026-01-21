package com.example.demo.domain.mypage.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.map.dto.response.AreaCoordinateResponse;
import com.example.demo.domain.mypage.dto.CompanyDTO;
import com.example.demo.domain.mypage.dto.ProjectDTO;
import com.example.demo.domain.mypage.dto.ProjectScrapAddressDTO;
import com.example.demo.domain.mypage.dto.ProjectScrapSortDTO;
import com.example.demo.domain.mypage.mapper.ProjectScrapMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ProjectScrapRepository {
    private final ProjectScrapMapper mapper;

    // 페이징+검색 조건 반영 리스트 조회
    public List<Long> findScrappedProjects(Long userSq, String searchType, String searchKeyword, int offset,
            int limit) {
        return mapper.findScrappedProjectSqsByUserSqWithPaging(userSq, searchType, searchKeyword, offset, limit);
    }

    // 조건에 맞는 총 개수 조회
    public int countScrappedProjects(Long userSq, String searchType, String searchKeyword) {
        return mapper.countScrappedProjectsByUserSq(userSq, searchType, searchKeyword);
    }

    public ProjectDTO findBasic(Long projectSq) {
        return mapper.findProjectBasic(projectSq);
    }

    public CompanyDTO findCompany(Long projectSq) {
        return mapper.findCompanyByProjectSq(projectSq);
    }

    public ProjectScrapAddressDTO findAddress(Long projectSq) {
        return mapper.findAddressByProjectSq(projectSq);
    }

    public String findEducationName(Long codeSq) {
        return mapper.findEducationName(codeSq);
    }

    public String findDeveloperGradeName(Long codeSq) {
        return mapper.findDeveloperGradeName(codeSq);
    }

    public List<String> findSkillTags(Long projectSq) {
        return mapper.findSkillTagsByProjectSq(projectSq);
    }

    public int deleteByUserAndProject(Long userSq, Long projectSq) {
        return mapper.deleteByUserAndProject(userSq, projectSq);
    }

	public List<Long> getScrapProjectIds(Long userSq) {
		// TODO Auto-generated method stub
		return mapper.getScrapProjectIds(userSq);
	}
	//위치정보 
	public Long findAddressSq(Long projectSq) {
		return mapper.findAddressSq(projectSq); 
	}
	//정렬 정보
	public List<ProjectScrapSortDTO> findSortInfoBySqs(List<Long> projectSqs) {
		return mapper.findSortInfoBySqs(projectSqs);
	}
	//페이징 없는 전체 ID 조회
	public List<Long> findScrappedProjectsWithoutPaging(Long userSq, String searchType, String searchKeyword) {
		return mapper.findScrappedProjectSqsByUserSqWithoutPaging(userSq, searchType, searchKeyword);
	}
}