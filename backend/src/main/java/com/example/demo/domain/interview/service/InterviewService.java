package com.example.demo.domain.interview.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.interview.dto.request.InterviewRequestDTO;
import com.example.demo.domain.interview.dto.response.InterviewResponseDTO;
import com.example.demo.domain.interview.mapper.InterviewMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {
	
	private final InterviewMapper interviewMapper;
	
	// 인터뷰 신청
	@Transactional
	public int createInterview(InterviewRequestDTO dto) {
		log.info("인터뷰 신청 시작");
		
		int existInterview = interviewMapper.selectInterviewByUserSq(dto.getUserSq(), dto.getCompanySq());
		
		if(existInterview > 0) {
			log.warn("중복된 인터뷰 신청");
			throw new IllegalArgumentException("이미 신청중인 인터뷰입니다.");
		}
		
		if (dto.getInterviewRequestTxt() == null || dto.getInterviewRequestTxt().trim().isEmpty()) {
			log.warn("요청글 없음. 유저 순번 : {}", dto.getUserSq());
		    throw new IllegalArgumentException("요청글을 입력해주세요.");
		}
		
		if(dto.getInterviewRequestTxt() != null) {
			// 글자수 검증
			if(dto.getInterviewRequestTxt().length() > 100) {
				log.warn("글자수 초과. 유저 순번 : {}", dto.getUserSq());
				throw new IllegalArgumentException("요청글은 100자를 초과할 수 없습니다.");
			}
            // 정규식 검증 (한글, 자음, 모음, 영어, 숫자, 공백, 마침표, 느낌표, 쉼표만 허용)
			if (!dto.getInterviewRequestTxt().matches("^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\\s.!,]*$")) {
				log.warn("정규식 검증 실패. 유저 순번 : {}", dto.getUserSq());
                throw new IllegalArgumentException("소개글은 한글, 영어, 숫자, 마침표(.), 느낌표(!), 쉼표(,)만 입력 가능합니다.");
            }
		}
		
		int result = interviewMapper.insertInterview(dto);
		
        if (result <= 0) {
        	log.warn("인터뷰 요청 실패 기업 순번 : {}", dto.getCompanySq());
            throw new IllegalArgumentException("인터뷰 신청 실패");
        }
		
        log.info("인터뷰 신청 완료. 기업 순번 : {}, 유저 순번 : {}", dto.getCompanySq(), dto.getUserSq());
		return result;
	}
	
	// 인터뷰 목록 조회
	@Transactional(readOnly = true)
	public List<InterviewResponseDTO> getInterviewList(Long userSq, String userType) {
	    log.info("인터뷰 목록 조회 시작");
	    List<InterviewResponseDTO> result;

	    if ("COMPANY".equals(userType)) {
	        result = interviewMapper.selectInterviewListByCompanyUserSq(userSq);
	    } else {
	        result = interviewMapper.selectInterviewList(userSq);
	    }

	    log.info("인터뷰 목록 조회 성공. 유저 순번 : {}", userSq);
	    return result;
	}
	
	// 인터뷰 상태 변경
	@Transactional
	public int updateInterviewStatus(Long interviewSq, String interviewStatus) {
		log.info("인터뷰 상태 변경 시작");
		int result = interviewMapper.updateInterviewStatus(interviewSq, interviewStatus);
		log.info("인터뷰 상태 변경 완료 인터뷰 순번 : {}, 인터뷰 상태 : {}", interviewSq, interviewStatus);
	    return result;
	}
	

}
