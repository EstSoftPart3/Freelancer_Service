package com.example.demo.domain.freelancer.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.domain.freelancer.dto.request.FreelancerFileDTO;
import com.example.demo.domain.freelancer.dto.request.FreelancerRequestDTO;
import com.example.demo.domain.freelancer.dto.request.FreelancerSearchRequestDTO;
import com.example.demo.domain.freelancer.dto.response.FreelancerResponseDTO;
import com.example.demo.domain.freelancer.mapper.FreelancerMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FreelancerService {
	
	private final FreelancerMapper freelancerMapper;
	private final FileStorageService fileStorageService;
	
    // 프리랜서 등록
	@Transactional
    public int createFreelancer(FreelancerRequestDTO dto, MultipartFile profileImages) {
        log.info("프리랜서 등록 시작");

        // 프리랜서 중복 확인
        int existFreelancer = freelancerMapper.selectFreelancerByUserSq(dto.getUserSq());
        if (existFreelancer > 0) {
        	log.warn("이미 등록된 프리랜서. 유저 순번 : {}", dto.getUserSq());
            throw new IllegalArgumentException("이미 등록된 프리랜서입니다.");
        }
        
        // 소개글 검증
        if (dto.getFreelancerGreetingTxt() != null) {
            // 글자수 검증
            if (dto.getFreelancerGreetingTxt().length() > 100) {
            	log.warn("글자수 초과. 유저 순번 : {}", dto.getUserSq());
                throw new IllegalArgumentException("소개글은 100자를 초과할 수 없습니다.");
            }
            // 정규식 검증 (한글, 자음, 모음, 영어, 숫자, 공백, 마침표, 느낌표, 쉼표만 허용)
            if (!dto.getFreelancerGreetingTxt().matches("^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\\s.!,]*$")) {
            	log.warn("정규식 검증 실패. 유저 순번 : {}", dto.getUserSq());
                throw new IllegalArgumentException("소개글은 한글, 영어, 숫자, 마침표(.), 느낌표(!), 쉼표(,)만 입력 가능합니다.");
            }
        }
        
        // 프로필 이미지 업로드
        if (profileImages != null && !profileImages.isEmpty()) {
            UploadedFileDTO profileImageDTO = fileStorageService.uploadFile(profileImages);
            if (profileImageDTO == null) {
            	log.warn("프로필 이미지 업로드 실패. 유저 순번 : {}", dto.getUserSq());
                throw new IllegalArgumentException("프로필 이미지 업로드 실패");
            }
            dto.setProfileImage(convertToFreelancerFileDTO(profileImageDTO));
            log.info("프로필 업로드 성공");
        }

        // 프리랜서 등록
        int result = freelancerMapper.insertFreelancer(dto);
        if (result <= 0) {
        	log.warn("프리랜서 등록 실패. 유저 순번 : {}", dto.getUserSq());
            throw new IllegalArgumentException("프리랜서 등록 실패");
        }

        log.info("프리랜서 등록 완료. 유저 순번 : {}", dto.getUserSq());
        
        // 프로필 이미지 저장
        if (dto.getProfileImage() != null) {
            // TBL_COMMON_FILE_S 저장
            int fileResult = freelancerMapper.insertFreelancerProfileImage(dto.getProfileImage());
            if (fileResult <= 0) {
            	log.warn("프로필 이미지 파일 저장 실패");
                throw new IllegalArgumentException("프로필 이미지 파일 저장 실패");
            }
            int mappingResult = freelancerMapper.insertFreelancerProfileImageMapping(dto.getFreelancerSq(),dto.getProfileImage().getFileSq());
            if (mappingResult <= 0) {
            	log.warn("프로필 이미지 매핑 저장 실패");
                throw new IllegalArgumentException("프로필 이미지 매핑 저장 실패");
            }
            log.info("프로필 이미지 저장 완료. 유저 순번 : {}", dto.getUserSq());
        }
        
        return result;
    }
	
    // 프리랜서 전체 조회
	@Transactional(readOnly = true)
    public List<FreelancerResponseDTO> getFreelancerAll() {
    	log.info("프리랜서 조회 시작");
    	List<FreelancerResponseDTO> result = freelancerMapper.selectFreelancerAll();
    	log.info("프리랜서 조회 완료 - 건수: {}", result.size());
    	log.info("프리랜서 조회 완료");
        return result;
    }

    // 프리랜서 검색
	@Transactional(readOnly = true)
    public List<FreelancerResponseDTO> getFreelancerSearch(FreelancerSearchRequestDTO dto) {
    	log.info("프로랜서 검색 시작");
    	List<FreelancerResponseDTO> result = freelancerMapper.selectFreelancerSearch(dto);
    	log.info("프리랜서 검색 완료. 카테고리 : {}, 키워드 : {}", dto.getCategory(), dto.getKeyword());
        return result;
    }
    
    private FreelancerFileDTO convertToFreelancerFileDTO(UploadedFileDTO uploadedFileDTO) {
        FreelancerFileDTO dto = new FreelancerFileDTO();
        dto.setFileOriginalNm(uploadedFileDTO.getOriginalName());
        dto.setFileSaveNm(uploadedFileDTO.getSavedName());
        dto.setFileTyp(uploadedFileDTO.getContentType());
        dto.setFileSize(uploadedFileDTO.getSize());
        return dto;
    }
    
    // 프리랜서 삭제
    @Transactional
    public int deleteFreelancer(Long freelancerSq, Long userSq) {
        log.info("프리랜서 삭제 시작");
        int result = freelancerMapper.deleteFreelancer(freelancerSq, userSq);
        if (result <= 0) {
            throw new IllegalArgumentException("프리랜서 삭제 실패");
        }
        log.info("프리랜서 삭제 완료. freelancerSq: {}", freelancerSq);
        return result;
    }

}
