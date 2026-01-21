package com.example.demo.domain.mypage.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.support.PagedListHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.map.dto.response.AreaCoordinateResponse;
import com.example.demo.domain.map.mapper.MapAddressMapper;
import com.example.demo.domain.map.util.DistanceUtil;
import com.example.demo.domain.mypage.dto.CompanyDTO;
import com.example.demo.domain.mypage.dto.ProjectDTO;
import com.example.demo.domain.mypage.dto.ProjectScrapAddressDTO;
import com.example.demo.domain.mypage.dto.ProjectScrapDTO;
import com.example.demo.domain.mypage.dto.ProjectScrapSortDTO;
import com.example.demo.domain.mypage.dto.response.ProjectScrapResponseDTO;
import com.example.demo.domain.mypage.repository.ProjectScrapRepository;
import com.example.demo.domain.user.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectScrapService {
    private final ProjectScrapRepository repository;
    private final UserMapper userMapper; 
    private final MapAddressMapper addressMapper; 

    public ProjectScrapResponseDTO getScrappedProjects(Long userSq, String searchType, String searchKeyword, int page,
            int size) {
    	int pageIndex = (page>0) ? page -1 : 0; 
        int offset = (page - 1) * size;

        int totalCount = repository.countScrappedProjects(userSq, searchType, searchKeyword);
        if (totalCount == 0) {
            return new ProjectScrapResponseDTO(Collections.emptyList(), 0);
        }
        
        //user 위치 획득        
       	Long userAddressSq = (userSq != null) ? userMapper.findAddressSqByUserSq(userSq) : null;
        AreaCoordinateResponse userCoord = (userAddressSq != null) ? addressMapper.findCoordinates(userAddressSq) : null; 
        Double userLatitude = (userCoord != null) ? userCoord.getLatitude() : null; 
        Double userLongitude = (userCoord != null) ? userCoord.getLongitude() : null;  

//        List<Long> projectSqs = repository.findScrappedProjects(userSq, searchType, searchKeyword, offset, size);
//        List<Long> projectSqs = repository.getScrapProjectIds(userSq);   
        List<Long> projectSqs = repository.findScrappedProjectsWithoutPaging(userSq, searchType, searchKeyword); 
        
        //정렬 기준되는 정보만 조회
        if (projectSqs == null || projectSqs.isEmpty()) {
        	return new ProjectScrapResponseDTO(Collections.emptyList(), 0);
        }
        List<ProjectScrapSortDTO> sortList = repository.findSortInfoBySqs(projectSqs); 
        System.out.println("1. DB SEARCH RESULT : "+(sortList==null?"NULL":sortList.size())); 
        
        if (sortList != null && !sortList.isEmpty()) {
        	System.out.println(" -> First Data Date : "+sortList.get(0).getCreatedAt()); 
        }
        // 정렬 기준 정렬
        String sortType = "latest"; 
        Stream<ProjectScrapSortDTO> sortListStream = sortList.stream(); 
        if("latest".equals(sortType)) {
        	//최신순
        	sortListStream = sortListStream.sorted(Comparator.comparing(ProjectScrapSortDTO::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))); 
        } else {
        	//마감순
        	sortListStream = sortListStream.sorted(Comparator.comparing(ProjectScrapSortDTO::getRecruitEndDt, Comparator.nullsLast(Comparator.naturalOrder()))); 
        }
        List<ProjectScrapSortDTO> sortedList = sortListStream.collect(Collectors.toList());
        
        // 메모리 페이징
        int start = pageIndex * size; 
        System.out.println("2. Paging start point : "+ start + ", size : "+sortedList.size()); 
        int end = Math.min((pageIndex+1)*size, sortedList.size()); 
        if (start >= sortedList.size()) {
        	return new ProjectScrapResponseDTO(Collections.emptyList(), 0); 
        }
        List<ProjectScrapSortDTO> pagedList = sortedList.subList(start, end);
        List<Long> pagedProjectSqs = pagedList.stream()
        		.map(ProjectScrapSortDTO::getProjectSq)
        		.collect(Collectors.toList());
        System.out.println("3. Combination number : " + pagedList.size()); 
        
        List<ProjectScrapDTO> dtos = pagedProjectSqs.stream().map(projectSq -> {
            ProjectDTO basic = repository.findBasic(projectSq);
            CompanyDTO company = repository.findCompany(projectSq);
            ProjectScrapAddressDTO address = repository.findAddress(projectSq);
            String education = repository.findEducationName(basic.getRequiredEducationCd());
            String developer = repository.findDeveloperGradeName(basic.getDeveloperGradeCd());
            List<String> skillTags = repository.findSkillTags(projectSq);
            long dDay = ChronoUnit.DAYS.between(LocalDate.now(), basic.getRecruitEndDt());
            //거리 정보 추가
            Long comAddressSq = repository.findAddressSq(projectSq); 
            
            Double comLatitude = null;
            Double comLongitude = null; 
            
            if (comAddressSq != null) {
            	AreaCoordinateResponse comCoord = addressMapper.findCoordinates(comAddressSq);  
            	
            	if (comCoord != null) {
            		comLatitude = comCoord.getLatitude();
            		comLongitude = comCoord.getLongitude();             		
            	}
            }
            Double distance = DistanceUtil.calculateDistance(userLatitude, userLongitude, comLatitude, comLongitude); 

            return ProjectScrapDTO.builder()
                    .projectSq(projectSq)
                    .projectTtl(basic.getProjectTtl())
                    .recruitStartDt(basic.getRecruitStartDt())
                    .recruitEndDt(basic.getRecruitEndDt())
                    .candidateCnt(basic.getCandidateCnt())
                    .createdAt(basic.getCreatedAt())
                    .company(company)
                    .address(address)
                    .requiredEducation(education)
                    .developerGrade(developer)
                    .skillTags(skillTags)
                    .dDay(dDay)
                    .distance(distance)
                    .build();
        }).collect(Collectors.toList());

        return new ProjectScrapResponseDTO(dtos, totalCount);
    }

    @Transactional
    public boolean deleteProjectScrap(Long userSq, Long projectSq) {
        int affected = repository.deleteByUserAndProject(userSq, projectSq);
        return affected > 0;
    }
    @Transactional
	public List<Long> getSCrapProjectIds(Long userSq) {
		List<Long>projectIds = repository.getScrapProjectIds(userSq);
		return projectIds;
	}
}
