package com.example.demo.domain.mypage.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.AmazonS3.AmazonS3Service;
import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.domain.community.entity.CommonSkillTag;
import com.example.demo.domain.community.mapper.CmntTagMapper;
import com.example.demo.domain.mypage.dto.ProjectHistoryTypeCodeDTO;
import com.example.demo.domain.mypage.dto.request.ResumeRequestDTO;
import com.example.demo.domain.mypage.dto.response.ProjectHistoryTypeCodeGroupResponseDTO;
import com.example.demo.domain.mypage.dto.response.ResumeListResponse;
import com.example.demo.domain.mypage.mapper.ResumeMapper;
import com.example.demo.domain.mypage.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResumeService {

	private final ResumeMapper resumeMapper;
	private final ResumeRepository resumeRepository;
	private final AmazonS3Service amazonS3Service;
	// private final ResumeSkillMapper resumeSkillMapper;
	// private final AddressRepository addressRepository;
	// private final MypageAddressMapper addressMapper;

	@Transactional
	public int createResume(Long userSq, ResumeRequestDTO dto, List<MultipartFile> profileImages,
			List<MultipartFile> attachments) {

		UploadedFileDTO profileImageDTO = null;
		if (profileImages != null && !profileImages.isEmpty()) {
			profileImageDTO = amazonS3Service.uploadFile(profileImages.get(0)); // 프로필 이미지는 1개만 가정
			dto.setProfileImage(convertToResumeFileDTO(profileImageDTO));
		}

		List<ResumeRequestDTO.ResumeFileDTO> attachmentFileDTOs = new ArrayList<>();
		if (attachments != null) {
			for (MultipartFile file : attachments) {
				UploadedFileDTO fileDTO = amazonS3Service.uploadFile(file);
				attachmentFileDTOs.add(convertToResumeFileDTO(fileDTO));
			}
			dto.setAttachmentList(attachmentFileDTOs);
		}

		// 주소 저장
		if (dto.getAddress() != null) {
			resumeRepository.insertAddress(dto.getAddress());
		}
		// 이력서 저장
		int result = resumeRepository.insertResume(userSq, dto);
		Long resumeSq = dto.getResumeSq();

		// 학력 저장
		if (dto.getEducationList() != null) {
			for (ResumeRequestDTO.EducationDTO edu : dto.getEducationList()) {
				edu.setResumeSq(resumeSq);
				resumeRepository.insertEducation(edu);
			}
		}

		// 경력 저장
		if (dto.getCareerList() != null) {
			for (ResumeRequestDTO.CareerDTO career : dto.getCareerList()) {
				career.setResumeSq(resumeSq);
				resumeRepository.insertCareer(career);
			}
		}

		// 프로젝트 이력 저장
		if (dto.getProjectHistoryList() != null) {
			for (ResumeRequestDTO.ProjectHistoryDTO ph : dto.getProjectHistoryList()) {
				ph.setResumeSq(resumeSq);
				resumeRepository.insertProjectHistory(ph);

				if (ph.getSkillTagList() != null) {
					for (ResumeRequestDTO.ProjectHistorySkillTagDTO tag : ph.getSkillTagList()) {
						tag.setProjectHistorySq(ph.getProjectHistorySq());
						resumeRepository.insertProjectHistorySkillTag(tag);
					}
				}
			}
		}

		// 자격증 저장
		if (dto.getCertificationList() != null) {
			for (ResumeRequestDTO.CertificationDTO cert : dto.getCertificationList()) {
				cert.setResumeSq(resumeSq);
				resumeRepository.insertCertification(cert);
			}
		}

		// 교육 이력 저장
		if (dto.getTrainingHistoryList() != null) {
			for (ResumeRequestDTO.TrainingHistoryDTO training : dto.getTrainingHistoryList()) {
				training.setResumeSq(resumeSq);
				resumeRepository.insertTrainingHistory(training);
			}
		}

		// 보유 기술 태그 저장
		if (dto.getSkillTagList() != null) {
			for (ResumeRequestDTO.SkillTagDTO tag : dto.getSkillTagList()) {
				tag.setResumeSq(resumeSq);
				resumeRepository.insertResumeSkillTag(tag);
			}
		}

		// 프로필 이미지 저장 + 매핑
		if (dto.getProfileImage() != null) {
			ResumeRequestDTO.ResumeFileDTO image = dto.getProfileImage();
			resumeRepository.insertProfileImage(image);
			resumeRepository.insertResumeProfileImageMapping(resumeSq, image.getFileSq());
		}

		// 첨부파일 저장 + 매핑
		if (dto.getAttachmentList() != null) {
			for (ResumeRequestDTO.ResumeFileDTO file : dto.getAttachmentList()) {
				resumeRepository.insertAttachmentFile(file);
				resumeRepository.insertResumeAttachmentMapping(resumeSq, file.getFileSq());
			}
		}

		return result;
	}

	@Transactional
	public int updateResume(Long userSq, ResumeRequestDTO dto, List<MultipartFile> profileImages,
			List<MultipartFile> attachments) {

		// 기존 파일 S3 삭제
		if (dto.getProfileImage() != null && dto.getProfileImage().getFileSaveNm() != null) {
			amazonS3Service.deleteFile(dto.getProfileImage().getFileSaveNm());
			resumeRepository.deleteResumeProfileImageMapping(dto.getProfileImage().getFileSq());
			resumeRepository.deleteProfileImage(dto.getProfileImage().getFileSq());
		}

		if (dto.getAttachmentList() != null) {
			for (ResumeRequestDTO.ResumeFileDTO file : dto.getAttachmentList()) {
				if (file.getFileSaveNm() != null) {
					amazonS3Service.deleteFile(file.getFileSaveNm());
					resumeRepository.deleteResumeAttachmentMapping(file.getFileSq());
					resumeRepository.deleteAttachmentFile(file.getFileSq());
				}
			}
		}

		int result = resumeRepository.updateResume(dto);
		Long resumeSq = dto.getResumeSq();

		// 주소 업데이트
		if (dto.getAddress() != null) {
			Long addressSq = resumeRepository.selectAddressSqByResumeSq(resumeSq);
			dto.getAddress().setAddressSq(addressSq); // 주소 DTO에 addressSq 설정
			resumeRepository.updateAddressByAddressSq(dto.getAddress());
		}

		// 학력: 기존 삭제 후 재등록
		if (dto.getEducationList() != null) {
			for (ResumeRequestDTO.EducationDTO edu : dto.getEducationList()) {
				if (edu.getEducationSq() != null) {
					resumeRepository.deleteEducation(edu.getEducationSq());
				}
			}
			for (ResumeRequestDTO.EducationDTO edu : dto.getEducationList()) {
				edu.setResumeSq(resumeSq);
				resumeRepository.insertEducation(edu);
			}
		}

		// 경력: 기존 삭제 후 재등록
		if (dto.getCareerList() != null) {
			for (ResumeRequestDTO.CareerDTO career : dto.getCareerList()) {
				if (career.getCareerSq() != null) {
					resumeRepository.deleteCareer(career.getCareerSq());
				}
			}
			for (ResumeRequestDTO.CareerDTO career : dto.getCareerList()) {
				career.setResumeSq(resumeSq);
				resumeRepository.insertCareer(career);
			}
		}

		// 프로젝트 이력: 기존 삭제 후 재등록
		if (dto.getProjectHistoryList() != null) {
			for (ResumeRequestDTO.ProjectHistoryDTO ph : dto.getProjectHistoryList()) {
				if (ph.getProjectHistorySq() != null) {
					if (ph.getSkillTagList() != null) {
						for (ResumeRequestDTO.ProjectHistorySkillTagDTO tag : ph.getSkillTagList()) {
							if (tag.getProjectHistorySkillSq() != null) {
								resumeRepository.deleteProjectHistorySkillTag(tag.getProjectHistorySkillSq());
							}
						}
					}
					resumeRepository.deleteProjectHistory(ph.getProjectHistorySq());
				}
			}
			for (ResumeRequestDTO.ProjectHistoryDTO ph : dto.getProjectHistoryList()) {
				ph.setResumeSq(resumeSq);
				resumeRepository.insertProjectHistory(ph);

				if (ph.getSkillTagList() != null) {
					for (ResumeRequestDTO.ProjectHistorySkillTagDTO tag : ph.getSkillTagList()) {
						tag.setProjectHistorySq(ph.getProjectHistorySq());
						resumeRepository.insertProjectHistorySkillTag(tag);
					}
				}
			}
		}

		// 자격증: 기존 삭제 후 재등록
		if (dto.getCertificationList() != null) {
			for (ResumeRequestDTO.CertificationDTO cert : dto.getCertificationList()) {
				if (cert.getCertificationSq() != null) {
					resumeRepository.deleteCertification(cert.getCertificationSq());
				}
			}
			for (ResumeRequestDTO.CertificationDTO cert : dto.getCertificationList()) {
				cert.setResumeSq(resumeSq);
				resumeRepository.insertCertification(cert);
			}
		}

		// 교육 이력: 기존 삭제 후 재등록
		if (dto.getTrainingHistoryList() != null) {
			for (ResumeRequestDTO.TrainingHistoryDTO training : dto.getTrainingHistoryList()) {
				if (training.getTrainingSq() != null) {
					resumeRepository.deleteTrainingHistory(training.getTrainingSq());
				}
			}
			for (ResumeRequestDTO.TrainingHistoryDTO training : dto.getTrainingHistoryList()) {
				training.setResumeSq(resumeSq);
				resumeRepository.insertTrainingHistory(training);
			}
		}

		// 보유 기술 태그: 기존 삭제 후 재등록
		if (dto.getSkillTagList() != null) {
			for (ResumeRequestDTO.SkillTagDTO tag : dto.getSkillTagList()) {
				if (tag.getSkillTagSq() != null) {
					resumeRepository.deleteResumeSkillTag(tag.getSkillTagSq());
				}
			}
			for (ResumeRequestDTO.SkillTagDTO tag : dto.getSkillTagList()) {
				resumeRepository.insertResumeSkillTag(tag);
			}
		}

		// 프로필 이미지 업데이트
		if (dto.getProfileImage() != null) {

			if (dto.getProfileImage().getFileSq() != null) {
				resumeRepository.deleteResumeProfileImageMapping(dto.getProfileImage().getFileSq());
				resumeRepository.deleteProfileImage(dto.getProfileImage().getFileSq());
			}

			resumeRepository.insertProfileImage(dto.getProfileImage());
			resumeRepository.insertResumeAttachmentMapping(resumeSq, dto.getProfileImage().getFileSq());

		}

		// 첨부파일: 기존 삭제 후 재등록
		if (dto.getAttachmentList() != null) {
			for (ResumeRequestDTO.ResumeFileDTO file : dto.getAttachmentList()) {
				if (file.getFileSq() != null) {
					resumeRepository.deleteResumeAttachmentMapping(file.getFileSq());
					resumeRepository.deleteAttachmentFile(file.getFileSq());
				}
			}
			for (ResumeRequestDTO.ResumeFileDTO file : dto.getAttachmentList()) {
				resumeRepository.insertAttachmentFile(file);
				resumeRepository.insertResumeAttachmentMapping(resumeSq, file.getFileSq());
			}
		}

		return result;
	}

	private ResumeRequestDTO.ResumeFileDTO convertToResumeFileDTO(UploadedFileDTO uploadedFileDTO) {
		ResumeRequestDTO.ResumeFileDTO dto = new ResumeRequestDTO.ResumeFileDTO();
		dto.setFileOriginalNm(uploadedFileDTO.getOriginalName());
		dto.setFileSaveNm(uploadedFileDTO.getSavedName());
		dto.setFileTyp(uploadedFileDTO.getContentType());
		dto.setFileSize(uploadedFileDTO.getSize());
		return dto;
	}

	// 프로젝트 업무단, 역할
	public ProjectHistoryTypeCodeGroupResponseDTO getGroupedProjectHistoryTypeCodes() {
		ProjectHistoryTypeCodeGroupResponseDTO dto = new ProjectHistoryTypeCodeGroupResponseDTO();
		dto.setProjectRoleTypeList(resumeRepository.getRoleTypes());
		dto.setProjectTaskTypeList(resumeRepository.getTaskTypes());
		return dto;
	}

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

	// 전체 스킬 태그 리스트 조회
	@Transactional
	public List<CommonSkillTag> getAllSkillTags() {
		List<CommonSkillTag> parentTags = resumeMapper.findParentSkillTags();
		List<CommonSkillTag> childrenTags = resumeMapper.findAll(parentTags);
		List<CommonSkillTag> allTags = new ArrayList<>();
		allTags.addAll(parentTags);
		allTags.addAll(childrenTags);

		return allTags;

	}

	// // 기술
	// @Transactional(readOnly = true)
	// public List<ResumeSkillDataResponse> getAllSkillTags() {
	// return resumeSkillMapper.findAllSkillTags();
	// }

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
