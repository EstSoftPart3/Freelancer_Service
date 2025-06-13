package com.example.demo.domain.mypage.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.mypage.dto.response.ResumeListResponse;
import com.example.demo.domain.mypage.mapper.MypageAddressMapper;
import com.example.demo.domain.mypage.mapper.ResumeMapper;
import com.example.demo.domain.mypage.mapper.ResumeSkillMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResumeService {

	private final ResumeMapper resumeMapper;
	private final ResumeSkillMapper resumeSkillMapper;
	// private final AddressRepository addressRepository;
	private final MypageAddressMapper addressMapper;

	// 대표 이력서 설정
	@Transactional
	public void setMainResume(Long resumeSq, Long userSq) {
		resumeMapper.updateAllRepresentativeN(userSq);
		resumeMapper.updateRepresentativeY(resumeSq);
	}

	@Transactional
	public void setOthersMainResume(Long resumeSq) {
		Long memberSq = resumeMapper.findUserByResumeSq(resumeSq);
		resumeMapper.updateAllRepresentativeN(memberSq);
		resumeMapper.updateRepresentativeY(resumeSq);
	}

	// 이력서 전체 조회
	public List<ResumeListResponse> getAllResumes(Long userSq) {
		return resumeMapper.selectAllResumes(userSq);
	}

	// 이력서 삭제
	public void softDeleteResume(Long resumeSq) {
		resumeMapper.updateDeleteYn(resumeSq);
	}

	기술
	@Transactional(readOnly = true)
	public List<ResumeSkillDataResponse> getAllSkillTags() {
	return resumeSkillMapper.findAllSkillTags();
	}

	// // 이력서에 보유 기술 추가 (여러 개)
	// @Transactional
	// public void addSkillsToResume(Long resumeSq, List<String> skillNames) {
	// List<ResumeSkillRequest> skillRequests = fillSkillInsertRequest(skillNames);
	// resumeSkillMapper.insertSkills(resumeSq, skillRequests);
	// }

	// // 이력서에 보유 기술 전체 삭제
	// @Transactional
	// public void deleteSkillsFromResume(Long resumeSq) {
	// resumeSkillMapper.deleteSkillsByResumeSq(resumeSq);
	// }

	// // 기술명 리스트를 ResumeSkillRequest 리스트로 변환
	// public List<ResumeSkillRequest> fillSkillInsertRequest(List<String>
	// skillNames) {
	// List<ResumeSkillRequest> requests = new ArrayList<>();
	// for (String skillName : skillNames) {
	// ResumeSkillDataResponse tagInfo =
	// resumeSkillMapper.findSkillTagInfoByName(skillName);
	// if (tagInfo != null) {
	// requests.add(new ResumeSkillRequest(tagInfo.getSkillTagSq()));
	// }
	// }
	// return requests;
	// }

	// @Transactional
	// public ResumeRegisterResponse registerResume(ResumeRegisterRequest request) {

	// // 기본값 설정
	// setDefaultValues(request);

	// // 주소 처리
	// if (request.getAddressSq() == null) {
	// processAddress(request);
	// }

	// // 이력서 등록
	// resumeMapper.insertResume(request);
	// System.out.println("insertResume 후 resumeSq: " + request.getResumeSq());

	// // 학력 리스트 저장
	// if (request.getEducation() != null) {
	// for (ResumeEducationRequest edu : request.getEducation()) {
	// edu.setResumeSq(request.getResumeSq()); // FK 세팅
	// resumeMapper.insertEducation(edu); // insert 쿼리 호출
	// }
	// }

	// // 경력
	// if (request.getCareer() != null) {
	// for (ResumeCareerRequest career : request.getCareer()) {
	// career.setResumeSq(request.getResumeSq());
	// resumeMapper.insertCareer(career);
	// }
	// }

	// return createResponse(request);

	// }

	// private void setDefaultValues(ResumeRegisterRequest request) {
	// if (request.getResumeIsRepresentativeYn() == null) {
	// request.setResumeIsRepresentativeYn("N");
	// }
	// if (request.getResumeIsNotificationYn() == null) {
	// request.setResumeIsNotificationYn("N");
	// }
	// if (request.getResumePhotoUrl() == null) {
	// request.setResumePhotoUrl("");
	// }
	// }

	// private void processAddress(ResumeRegisterRequest request) {
	// // 시/도와 시/군/구 기준으로 지역코드 조회
	// Long areaCodeSq =
	// addressMapper.selectAreaCodeBySigungu(request.getSigungu());
	// if (areaCodeSq == null) {
	// throw new IllegalArgumentException("해당 시/군/구에 대한 지역 코드가 없습니다.");
	// }

	// System.out.println("✅ DB 기준 sigungu = " + request.getSigungu());

	// // 주소 객체 생성 및 저장
	// AddressDTO addressDTO = AddressDTO.builder()
	// .zonecode(request.getZonecode())
	// .address(request.getAddress())
	// .detailAddress(request.getDetailAddress())
	// .sigungu(request.getSigungu())
	// .latitude(request.getLatitude())
	// .longitude(request.getLongitude())
	// .areaCodeSq(areaCodeSq)
	// .build();

	// addressRepository.insertAddress(addressDTO);

	// Long addressSq = addressDTO.getAddressSq();

	// request.setAddressSq(addressDTO.getAddressSq());
	// }

	// private ResumeRegisterResponse createResponse(ResumeRegisterRequest request)
	// {
	// return ResumeRegisterResponse.builder()
	// .userSq(request.getUserSq())
	// .resumeSq(request.getResumeSq())
	// .resumeTtl(request.getResumeTtl())
	// .representative("Y".equals(request.getResumeIsRepresentativeYn()))
	// .build();
	// }

	// //이력서 상세조회
	// public ResumeRegisterResponse getResumeById(Long resumeSq) {

	// // 학력 리스트 별도 조회 후 세팅
	// ResumeRegisterResponse result = resumeMapper.selectResumeById(resumeSq);
	// result.setEducation(resumeMapper.selectEducationByResumeSq(resumeSq));
	// // 경력 상세 조회
	// result.setCareer(resumeMapper.selectCareerByResumeSq(resumeSq));
	// System.out.println("selectResumeById result: " + result);

	// // ( projects, certificates, skills 등도 동일하게 조회 후 set)

	// return result;
	// }

	// //이력서 수정
	// @Transactional
	// public void updateResume(ResumeRegisterRequest request) {
	// // 1. 이력서 기본 정보 수정
	// resumeMapper.updateResume(request);

	// // 2. 기존 학력 모두 삭제
	// resumeMapper.deleteEducationByResumeSq(request.getResumeSq());
	// resumeMapper.deleteCareerByResumeSq(request.getResumeSq());

	// // 3. 새 학력 리스트가 있으면 insert
	// if (request.getEducation() != null) {
	// for (ResumeEducationRequest edu : request.getEducation()) {
	// edu.setResumeSq(request.getResumeSq()); // FK 세팅
	// resumeMapper.insertEducation(edu);
	// }
	// }

	// }

	// // 이력서별 보유 기술명 전체 조회
	// public List<String> getAllSkillNamesByResume(Long resumeSq) {
	// return resumeSkillMapper.findAllSkillsByResumeSq(resumeSq);
	// }

	// // 대분류-소분류 트리 구조 조회 (기술 선택용)
	// public List<ResumeSkillPairResponse> getSkillTree() {
	// return resumeSkillMapper.findSkillInfoList();
	// }

	// // 기술명으로 태그 정보 조회
	// public ResumeSkillDataResponse getSkillTagInfoByName(String name) {
	// return resumeSkillMapper.findSkillTagInfoByName(name);
	// }

	// public List<ResumeSkillPairResponse> getGroupedSkills() {
	// return resumeSkillMapper.findSkillInfoList();
	// }

	// // 특정 기술의 상위(대분류) skill_tag_sq 조회
	// public Long getParentSkillTagSq(Long skillTagSq) {
	// return resumeSkillMapper.findParentSkillTagSq(skillTagSq);
	// }
}
