package com.example.demo.domain.mypage.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.example.demo.common.AmazonS3.AmazonS3Service;
import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.domain.community.entity.CommonSkillTag;
import com.example.demo.domain.mypage.dto.ParentSkillTagDTO;
import com.example.demo.domain.mypage.dto.request.ResumeRequestDTO;
import com.example.demo.domain.mypage.dto.response.CertificateListResponseDTO;
import com.example.demo.domain.mypage.dto.response.CertificateResponseDTO;
import com.example.demo.domain.mypage.dto.response.ProjectHistoryTypeCodeGroupResponseDTO;
import com.example.demo.domain.mypage.dto.response.ResumeListResponse;
import com.example.demo.domain.mypage.mapper.ResumeMapper;
import com.example.demo.domain.mypage.repository.ResumeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

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
	private final AmazonS3 amazonS3;

	@Value("${cloud.aws.s3.bucket}")
	private String bucket;

	public int createResume(Long userSq, ResumeRequestDTO dto, List<MultipartFile> profileImages,
			List<MultipartFile> attachments) {

		// 프로필 이미지 업로드
		UploadedFileDTO profileImageDTO = null;
		if (profileImages != null && !profileImages.isEmpty()) {
			profileImageDTO = amazonS3Service.uploadFile(profileImages.get(0));
			if (profileImageDTO == null) {
				throw new IllegalArgumentException("프로필 이미지 업로드 실패");
			}
			dto.setProfileImage(convertToResumeFileDTO(profileImageDTO));
		}

		// 첨부파일 업로드
		List<ResumeRequestDTO.ResumeFileDTO> attachmentFileDTOs = new ArrayList<>();
		if (attachments != null) {
			for (MultipartFile file : attachments) {
				UploadedFileDTO fileDTO = amazonS3Service.uploadFile(file);
				if (fileDTO == null) {
					throw new IllegalArgumentException("첨부파일 업로드 실패");
				}
				attachmentFileDTOs.add(convertToResumeFileDTO(fileDTO));
			}
			dto.setAttachmentList(attachmentFileDTOs);
		}

		// 주소 저장
		if (dto.getAddress() != null) {
			int addressResult = resumeRepository.insertAddress(dto.getAddress());
			if (addressResult <= 0) {
				throw new IllegalArgumentException("주소 저장 실패");
			}
		}

		// 이력서 저장
		int result = resumeRepository.insertResume(userSq, dto);
		if (result <= 0) {
			throw new IllegalArgumentException("이력서 저장 실패");
		}
		Long resumeSq = dto.getResumeSq();

		// 학력 저장
		if (dto.getEducationList() != null) {
			for (ResumeRequestDTO.EducationDTO edu : dto.getEducationList()) {
				edu.setResumeSq(resumeSq);
				if (resumeRepository.insertEducation(edu) <= 0) {
					throw new IllegalArgumentException("학력 저장 실패");
				}
			}
		}

		// 경력 저장
		if (dto.getCareerList() != null) {
			for (ResumeRequestDTO.CareerDTO career : dto.getCareerList()) {
				career.setResumeSq(resumeSq);
				if (resumeRepository.insertCareer(career) <= 0) {
					throw new IllegalArgumentException("경력 저장 실패");
				}
			}
		}

		// 프로젝트 이력 + 기술 태그 저장
		if (dto.getProjectHistoryList() != null) {
			for (ResumeRequestDTO.ProjectHistoryDTO ph : dto.getProjectHistoryList()) {
				ph.setResumeSq(resumeSq);
				if (resumeRepository.insertProjectHistory(ph) <= 0) {
					throw new IllegalArgumentException("프로젝트 이력 저장 실패");
				}

				if (ph.getSkillTagList() != null) {
					for (ResumeRequestDTO.ProjectHistorySkillTagDTO tag : ph.getSkillTagList()) {
						tag.setProjectHistorySq(ph.getProjectHistorySq());
						if (resumeRepository.insertProjectHistorySkillTag(tag) <= 0) {
							throw new IllegalArgumentException("프로젝트 기술 태그 저장 실패");
						}
					}
				}
			}
		}

		// 자격증 저장
		if (dto.getCertificationList() != null) {
			for (ResumeRequestDTO.CertificationDTO cert : dto.getCertificationList()) {
				cert.setResumeSq(resumeSq);
				if (resumeRepository.insertCertification(cert) <= 0) {
					throw new IllegalArgumentException("자격증 저장 실패");
				}
			}
		}

		// 교육 이력 저장
		if (dto.getTrainingHistoryList() != null) {
			for (ResumeRequestDTO.TrainingHistoryDTO training : dto.getTrainingHistoryList()) {
				training.setResumeSq(resumeSq);
				if (resumeRepository.insertTrainingHistory(training) <= 0) {
					throw new IllegalArgumentException("교육 이력 저장 실패");
				}
			}
		}

		// 기술 태그 저장
		if (dto.getSkillTagList() != null) {
			for (ResumeRequestDTO.SkillTagDTO tag : dto.getSkillTagList()) {
				tag.setResumeSq(resumeSq);
				if (resumeRepository.insertResumeSkillTag(tag) <= 0) {
					throw new IllegalArgumentException("기술 태그 저장 실패");
				}
			}
		}

		// 프로필 이미지 저장 및 매핑
		if (dto.getProfileImage() != null) {
			ResumeRequestDTO.ResumeFileDTO image = dto.getProfileImage();
			if (resumeRepository.insertProfileImage(image) <= 0) {
				throw new IllegalArgumentException("프로필 이미지 저장 실패");
			}
			if (resumeRepository.insertResumeProfileImageMapping(resumeSq, image.getFileSq()) <= 0) {
				throw new IllegalArgumentException("프로필 이미지 매핑 실패");
			}
		}

		// 첨부파일 저장 및 매핑
		if (dto.getAttachmentList() != null) {
			for (ResumeRequestDTO.ResumeFileDTO file : dto.getAttachmentList()) {
				if (resumeRepository.insertAttachmentFile(file) <= 0) {
					throw new IllegalArgumentException("첨부파일 저장 실패");
				}
				if (resumeRepository.insertResumeAttachmentMapping(resumeSq, file.getFileSq()) <= 0) {
					throw new IllegalArgumentException("첨부파일 매핑 실패");
				}
			}
		}

		return result;
	}

	@Transactional
	public int updateResume(Long userSq, ResumeRequestDTO dto,
			List<MultipartFile> profileImages,
			List<MultipartFile> attachments) {

		Long resumeSq = dto.getResumeSq();
		if (resumeSq == null) {
			throw new IllegalArgumentException("이력서 번호(resumeSq)는 필수입니다.");
		}

		// 1. 기본 이력서 정보 업데이트
		int result = resumeRepository.updateResume(userSq, dto);
		if (result == 0) {
			throw new IllegalArgumentException("수정 대상 이력서가 존재하지 않거나 권한이 없습니다.");
		}

		// 2. 주소 업데이트
		if (dto.getAddress() != null) {
			Long addressSq = resumeRepository.selectAddressSqByResumeSq(resumeSq);
			if (addressSq == null) {
				throw new IllegalArgumentException("주소 정보가 존재하지 않습니다.");
			}
			dto.getAddress().setAddressSq(addressSq);
			int addrResult = resumeRepository.updateAddressByAddressSq(dto.getAddress());
			if (addrResult == 0) {
				throw new IllegalArgumentException("주소 수정에 실패했습니다.");
			}
		}

		// ===================
		// 3. 학력 처리
		// ===================
		List<ResumeRequestDTO.EducationDTO> dbEducationList = resumeRepository
				.selectEducationListForUpdateByResumeSq(resumeSq);

		// dto에 없는 기존 학력 삭제
		if (dbEducationList != null) {
			for (ResumeRequestDTO.EducationDTO dbEdu : dbEducationList) {
				boolean existsInDto = false;
				if (dto.getEducationList() != null) {
					for (ResumeRequestDTO.EducationDTO edu : dto.getEducationList()) {
						if (dbEdu.getEducationSq().equals(edu.getEducationSq())) {
							existsInDto = true;
							break;
						}
					}
				}
				if (!existsInDto) {
					int del = resumeRepository.deleteEducation(dbEdu.getEducationSq());
					if (del == 0) {
						throw new IllegalArgumentException("존재하지 않는 학력 정보 삭제 시도.");
					}
				}
			}
		}

		// dto에 있는 학력은 삭제 후 다시 삽입
		if (dto.getEducationList() != null) {
			for (ResumeRequestDTO.EducationDTO edu : dto.getEducationList()) {
				edu.setResumeSq(resumeSq);
				if (edu.getEducationSq() != null) {
					resumeRepository.deleteEducation(edu.getEducationSq());
				}
				int inserted = resumeRepository.insertEducation(edu);
				if (inserted == 0) {
					throw new IllegalArgumentException("학력 등록 실패.");
				}
			}
		}

		// ===================
		// 4. 경력 처리 (학력 처리와 동일 로직)
		// ===================
		List<ResumeRequestDTO.CareerDTO> dbCareerList = resumeRepository.selectCareerListForUpdateByResumeSq(resumeSq);

		if (dbCareerList != null) {
			for (ResumeRequestDTO.CareerDTO dbCareer : dbCareerList) {
				boolean existsInDto = false;
				if (dto.getCareerList() != null) {
					for (ResumeRequestDTO.CareerDTO career : dto.getCareerList()) {
						if (dbCareer.getCareerSq().equals(career.getCareerSq())) {
							existsInDto = true;
							break;
						}
					}
				}
				if (!existsInDto) {
					int del = resumeRepository.deleteCareer(dbCareer.getCareerSq());
					if (del == 0) {
						throw new IllegalArgumentException("존재하지 않는 경력 정보 삭제 시도.");
					}
				}
			}
		}

		if (dto.getCareerList() != null) {
			for (ResumeRequestDTO.CareerDTO career : dto.getCareerList()) {
				career.setResumeSq(resumeSq);
				if (career.getCareerSq() != null) {
					resumeRepository.deleteCareer(career.getCareerSq());
				}
				int inserted = resumeRepository.insertCareer(career);
				if (inserted == 0) {
					throw new IllegalArgumentException("경력 등록 실패.");
				}
			}
		}

		// ===================
		// 5. 프로젝트 이력 처리
		// ===================
		List<ResumeRequestDTO.ProjectHistoryDTO> dbProjectList = resumeRepository
				.selectProjectHistoryListForUpdateByResumeSq(resumeSq);

		// 5-1. 기존 DB에 있는 프로젝트가 dto에 없으면 삭제 (그리고 프로젝트별 기술 태그도 삭제)
		if (dbProjectList != null) {
			for (ResumeRequestDTO.ProjectHistoryDTO dbPh : dbProjectList) {
				boolean existsInDto = false;
				if (dto.getProjectHistoryList() != null) {
					for (ResumeRequestDTO.ProjectHistoryDTO ph : dto.getProjectHistoryList()) {
						if (dbPh.getProjectHistorySq().equals(ph.getProjectHistorySq())) {
							existsInDto = true;
							break;
						}
					}
				}
				if (!existsInDto) {
					// 프로젝트 기술 태그 삭제
					List<ResumeRequestDTO.ProjectHistorySkillTagDTO> dbSkillTags = resumeRepository
							.selectProjectHistorySkillTagListForUpdateByProjectHistorySq(dbPh.getProjectHistorySq());
					if (dbSkillTags != null) {
						for (ResumeRequestDTO.ProjectHistorySkillTagDTO tag : dbSkillTags) {
							resumeRepository.deleteProjectHistorySkillTag(tag.getProjectHistorySkillSq());
						}
					}
					// 프로젝트 이력 삭제
					resumeRepository.deleteProjectHistory(dbPh.getProjectHistorySq());
				}
			}
		}

		// 5-2. dto에 있는 프로젝트는 삭제 후 다시 삽입 + 기술 태그 삽입
		if (dto.getProjectHistoryList() != null) {
			for (ResumeRequestDTO.ProjectHistoryDTO ph : dto.getProjectHistoryList()) {
				ph.setResumeSq(resumeSq);
				if (ph.getProjectHistorySq() != null) {
					// 기존 프로젝트 기술 태그 먼저 삭제
					List<ResumeRequestDTO.ProjectHistorySkillTagDTO> dbSkillTags = resumeRepository
							.selectProjectHistorySkillTagListForUpdateByProjectHistorySq(ph.getProjectHistorySq());
					if (dbSkillTags != null) {
						for (ResumeRequestDTO.ProjectHistorySkillTagDTO tag : dbSkillTags) {
							resumeRepository.deleteProjectHistorySkillTag(tag.getProjectHistorySkillSq());
						}
					}
					// 프로젝트 이력 삭제
					resumeRepository.deleteProjectHistory(ph.getProjectHistorySq());
				}
				int inserted = resumeRepository.insertProjectHistory(ph);
				if (inserted == 0) {
					throw new IllegalArgumentException("프로젝트 이력 등록 실패.");
				}

				if (ph.getSkillTagList() != null) {
					for (ResumeRequestDTO.ProjectHistorySkillTagDTO tag : ph.getSkillTagList()) {
						tag.setProjectHistorySq(ph.getProjectHistorySq());
						int skillResult = resumeRepository.insertProjectHistorySkillTag(tag);
						if (skillResult == 0) {
							throw new IllegalArgumentException("프로젝트 기술태그 등록 실패.");
						}
					}
				}
			}
		}

		// ===================
		// 6. 자격증 처리
		// ===================
		List<ResumeRequestDTO.CertificationDTO> dbCertList = resumeRepository
				.selectCertificationListForUpdateByResumeSq(resumeSq);

		if (dbCertList != null) {
			for (ResumeRequestDTO.CertificationDTO dbCert : dbCertList) {
				boolean existsInDto = false;
				if (dto.getCertificationList() != null) {
					for (ResumeRequestDTO.CertificationDTO cert : dto.getCertificationList()) {
						if (dbCert.getCertificationSq().equals(cert.getCertificationSq())) {
							existsInDto = true;
							break;
						}
					}
				}
				if (!existsInDto) {
					int del = resumeRepository.deleteCertification(dbCert.getCertificationSq());
					if (del == 0) {
						throw new IllegalArgumentException("존재하지 않는 자격증 삭제 시도.");
					}
				}
			}
		}

		if (dto.getCertificationList() != null) {
			for (ResumeRequestDTO.CertificationDTO cert : dto.getCertificationList()) {
				cert.setResumeSq(resumeSq);
				if (cert.getCertificationSq() != null) {
					resumeRepository.deleteCertification(cert.getCertificationSq());
				}
				int inserted = resumeRepository.insertCertification(cert);
				if (inserted == 0) {
					throw new IllegalArgumentException("자격증 등록 실패.");
				}
			}
		}

		// ===================
		// 7. 교육 이력 처리
		// ===================
		List<ResumeRequestDTO.TrainingHistoryDTO> dbTrainingList = resumeRepository
				.selectTrainingHistoryListForUpdateByResumeSq(resumeSq);

		if (dbTrainingList != null) {
			for (ResumeRequestDTO.TrainingHistoryDTO dbTraining : dbTrainingList) {
				boolean existsInDto = false;
				if (dto.getTrainingHistoryList() != null) {
					for (ResumeRequestDTO.TrainingHistoryDTO training : dto.getTrainingHistoryList()) {
						if (dbTraining.getTrainingSq().equals(training.getTrainingSq())) {
							existsInDto = true;
							break;
						}
					}
				}
				if (!existsInDto) {
					resumeRepository.deleteTrainingHistory(dbTraining.getTrainingSq());
				}
			}
		}

		if (dto.getTrainingHistoryList() != null) {
			for (ResumeRequestDTO.TrainingHistoryDTO training : dto.getTrainingHistoryList()) {
				training.setResumeSq(resumeSq);
				resumeRepository.deleteTrainingHistory(training.getTrainingSq());
				int inserted = resumeRepository.insertTrainingHistory(training);
				if (inserted == 0) {
					throw new IllegalArgumentException("교육 이력 등록 실패.");
				}
			}
		}

		// ===================
		// 8. 보유 기술 태그 처리
		// ===================
		List<ResumeRequestDTO.SkillTagDTO> dbSkillTagList = resumeRepository
				.selectResumeSkillTagListForUpdateByResumeSq(resumeSq);
		System.out.println("스킬태그리스트:" + dbSkillTagList);
		System.out.println("dto에서 보내온 스킬태그리스트" + dto.getSkillTagList());

		if (dbSkillTagList != null) {
			for (ResumeRequestDTO.SkillTagDTO dbTag : dbSkillTagList) {
				boolean existsInDto = false;
				if (dto.getSkillTagList() != null) {
					for (ResumeRequestDTO.SkillTagDTO tag : dto.getSkillTagList()) {
						if (dbTag.getSkillTagSq() != null && dbTag.getSkillTagSq().equals(tag.getSkillTagSq())) {
							existsInDto = true;
							break;
						}
					}
				}
				if (!existsInDto) {
					resumeRepository.deleteResumeSkillTag(dbTag.getResumeSkillSq());
				}
			}
		}

		if (dto.getSkillTagList() != null) {
			for (ResumeRequestDTO.SkillTagDTO tag : dto.getSkillTagList()) {
				boolean existsInDb = false;

				if (dbSkillTagList != null) {
					for (ResumeRequestDTO.SkillTagDTO dbTag : dbSkillTagList) {
						if (dbTag.getSkillTagSq() != null && dbTag.getSkillTagSq().equals(tag.getSkillTagSq())) {
							existsInDb = true;
							break;
						}
					}
				}

				if (!existsInDb) {
					tag.setResumeSq(resumeSq);
					int inserted = resumeRepository.insertResumeSkillTag(tag);
					if (inserted == 0) {
						throw new IllegalArgumentException("기술 태그 등록 실패.");
					}
				}
			}
		}

		// 프로필 이미지 업로드
		UploadedFileDTO profileImageDTO = null;
		if (profileImages != null && !profileImages.isEmpty()) {
			profileImageDTO = amazonS3Service.uploadFile(profileImages.get(0));
			if (profileImageDTO == null) {
				throw new IllegalArgumentException("프로필 이미지 업로드 실패");
			}
			dto.setProfileImage(convertToResumeFileDTO(profileImageDTO));
			ResumeRequestDTO.ResumeFileDTO dbProfileImage = resumeRepository
					.selectProfileImageForUpdateByResumeSq(resumeSq);

			System.out.println("dbProfileImage" + dbProfileImage);
			// DB와 아마존S3 파일 삭제 전 사용중인지 확인
			if (dbProfileImage != null) {
				Long fileSq = dbProfileImage.getFileSq();

				// 다른 이력서에서 사용중인지 확인 (프로필 이미지)
				int profileCount = resumeRepository.countFileUsageInProfileImageExceptResume(fileSq, resumeSq);

				if (profileCount == 0) {
					// 매핑 삭제
					resumeRepository.deleteResumeProfileImageMapping(resumeSq, fileSq);
					// 실제 파일 논리 삭제
					resumeRepository.deleteProfileImage(fileSq);
					// S3 원본 삭제
					amazonS3Service.deleteFile(dbProfileImage.getFileSaveNm());
				} else {
					// 다른 곳에서 쓰고 있으므로 매핑만 삭제, 파일은 보존
					resumeRepository.deleteResumeProfileImageMapping(resumeSq, fileSq);
				}
			}
			// DTO에 있는 프로필 이미지가 있으면 삽입 및 매핑
			if (dto.getProfileImage() != null) {
				resumeRepository.insertProfileImage(dto.getProfileImage());
				resumeRepository.insertResumeProfileImageMapping(resumeSq, dto.getProfileImage().getFileSq());
			}
		}

		// 1. DB 기준 기존 첨부파일 목록 조회
		List<ResumeRequestDTO.ResumeFileDTO> dbAttachmentList = resumeRepository
				.selectAttachmentListForUpdateByResumeSq(resumeSq);

		// 2. 프론트에서 넘어온 유지할 파일 리스트 fileSq 추출
		Set<Long> retainedFileSqs = dto.getAttachmentList().stream()
				.map(ResumeRequestDTO.ResumeFileDTO::getFileSq)
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());

		// 3. 기존 첨부파일 중 유지되지 않는 파일 삭제
		for (ResumeRequestDTO.ResumeFileDTO dbFile : dbAttachmentList) {
			if (!retainedFileSqs.contains(dbFile.getFileSq())) {
				Long fileSq = dbFile.getFileSq();

				int attachmentCount = resumeRepository.countFileUsageInAttachmentExceptResume(fileSq, resumeSq);

				if (attachmentCount == 0) {
					// 매핑 삭제
					resumeRepository.deleteResumeAttachmentMapping(resumeSq, fileSq);
					// 실제 파일 논리 삭제
					resumeRepository.deleteAttachmentFile(fileSq);
					// S3 원본 삭제
					amazonS3Service.deleteFile(dbFile.getFileSaveNm());
				} else {
					// 다른 곳에서 쓰고 있으므로 매핑만 삭제, 파일은 보존
					resumeRepository.deleteResumeAttachmentMapping(resumeSq, fileSq);
				}
			}
		}

		// 4. 새 첨부파일 업로드 처리
		List<ResumeRequestDTO.ResumeFileDTO> attachmentFileDTOs = new ArrayList<>();
		if (attachments != null) {
			for (MultipartFile file : attachments) {
				UploadedFileDTO fileDTO = amazonS3Service.uploadFile(file);
				if (fileDTO == null) {
					throw new IllegalArgumentException("첨부파일 업로드 실패");
				}
				attachmentFileDTOs.add(convertToResumeFileDTO(fileDTO));
			}
			// 업로드한 파일들을 dto에 추가
			dto.getAttachmentList().addAll(attachmentFileDTOs);
		}

		// 5. 신규 업로드된 파일만 insert 및 매핑
		for (ResumeRequestDTO.ResumeFileDTO file : attachmentFileDTOs) {
			resumeRepository.insertAttachmentFile(file);
			resumeRepository.insertResumeAttachmentMapping(resumeSq, file.getFileSq());
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

	// 자격증
	public CertificateListResponseDTO getCertificates(String searchNm, int page, int size) {
		int offset = (page - 1) * size;
		List<CertificateResponseDTO> certificates = resumeRepository.findCertificatesByName(searchNm, size, offset);
		int totalCount = resumeRepository.countCertificatesByName(searchNm);

		int totalPages = (int) Math.ceil((double) totalCount / size);

		return new CertificateListResponseDTO(certificates, totalCount, totalPages, page);
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

	@Transactional
	public void softDeleteResume(Long resumeSq) {
		// 1. 이력서 삭제 처리 (논리삭제)
		resumeMapper.updateDeleteYn(resumeSq);

		// 2. 해당 이력서 프로필 이미지 조회
		ResumeRequestDTO.ResumeFileDTO profileImage = resumeRepository.selectProfileImageForUpdateByResumeSq(resumeSq);
		if (profileImage != null) {
			Long fileSq = profileImage.getFileSq();

			// 다른 이력서에서 사용중인지 확인 (프로필 이미지)
			int profileCount = resumeRepository.countFileUsageInProfileImageExceptResume(fileSq, resumeSq);

			if (profileCount == 0) {
				// 매핑 삭제
				resumeRepository.deleteResumeProfileImageMapping(resumeSq, fileSq);
				// 실제 파일 논리 삭제
				resumeRepository.deleteProfileImage(fileSq);
				// S3 원본 삭제
				amazonS3Service.deleteFile(profileImage.getFileSaveNm());
			} else {
				// 다른 곳에서 쓰고 있으므로 매핑만 삭제, 파일은 보존
				resumeRepository.deleteResumeProfileImageMapping(resumeSq, fileSq);
			}
		}

		// 3. 해당 이력서 첨부파일 목록 조회
		List<ResumeRequestDTO.ResumeFileDTO> attachmentList = resumeRepository
				.selectAttachmentListForUpdateByResumeSq(resumeSq);
		for (ResumeRequestDTO.ResumeFileDTO attachment : attachmentList) {
			Long fileSq = attachment.getFileSq();

			// 다른 이력서에서 사용중인지 확인 (첨부파일)
			int attachmentCount = resumeRepository.countFileUsageInAttachmentExceptResume(fileSq, resumeSq);

			if (attachmentCount == 0) {
				// 매핑 삭제
				resumeRepository.deleteResumeAttachmentMapping(resumeSq, fileSq);
				// 실제 파일 논리 삭제
				resumeRepository.deleteAttachmentFile(fileSq);
				// S3 원본 삭제
				amazonS3Service.deleteFile(attachment.getFileSaveNm());
			} else {
				// 다른 곳에서 쓰고 있으므로 매핑만 삭제, 파일은 보존
				resumeRepository.deleteResumeAttachmentMapping(resumeSq, fileSq);
			}
		}
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

	public ResumeRequestDTO getResumeDetail(Long resumeSq) {
		ResumeRequestDTO resume = resumeRepository.findByResumeSq(resumeSq);
		if (resume == null) {
			throw new IllegalArgumentException("이력서를 찾을 수 없습니다. resumeSq=" + resumeSq);
		}
		ObjectMapper mapper = new ObjectMapper();
		mapper.registerModule(new JavaTimeModule());

		try {
			String json = mapper.writeValueAsString(resume);
			System.out.println("이력서정보" + json);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		// 주소 조회
		if (resume.getAddress() != null && resume.getAddress().getAddressSq() != null) {
			ResumeRequestDTO.AddressDTO address = resumeRepository
					.findAddressByAddressSq(resume.getAddress().getAddressSq());
			resume.setAddress(address);
		}

		// 학력
		List<ResumeRequestDTO.EducationDTO> educationList = resumeRepository.findEducationList(resumeSq);
		resume.setEducationList(educationList);

		// 경력
		List<ResumeRequestDTO.CareerDTO> careerList = resumeRepository.findCareerList(resumeSq);
		resume.setCareerList(careerList);

		// 프로젝트 이력
		List<ResumeRequestDTO.ProjectHistoryDTO> projectHistoryList = resumeRepository.findProjectHistoryList(resumeSq);
		// 프로젝트별 기술 태그 조회
		for (ResumeRequestDTO.ProjectHistoryDTO ph : projectHistoryList) {
			List<ResumeRequestDTO.ProjectHistorySkillTagDTO> skillTags = resumeRepository
					.findProjectHistorySkillTagList(ph.getProjectHistorySq());
			ph.setSkillTagList(skillTags);
		}
		resume.setProjectHistoryList(projectHistoryList);

		// 자격증
		List<ResumeRequestDTO.CertificationDTO> certificationList = resumeRepository.findCertificationList(resumeSq);
		resume.setCertificationList(certificationList);

		// 교육 이력
		List<ResumeRequestDTO.TrainingHistoryDTO> trainingHistoryList = resumeRepository
				.findTrainingHistoryList(resumeSq);
		resume.setTrainingHistoryList(trainingHistoryList);

		// 보유 기술 태그
		List<ResumeRequestDTO.SkillTagDTO> skillTagList = resumeRepository.findSkillTagList(resumeSq);
		resume.setSkillTagList(skillTagList);

		// 프로필 이미지 조회 및 URL 세팅
		ResumeRequestDTO.ResumeFileDTO profileImage = resumeRepository.findProfileImage(resumeSq);
		if (profileImage != null) {
			String s3Url = amazonS3.getUrl(bucket, profileImage.getFileSaveNm()).toString();
			profileImage.setUrl(s3Url);
		}
		resume.setProfileImage(profileImage);

		// 첨부파일 리스트 조회 및 각각 URL 세팅
		List<ResumeRequestDTO.ResumeFileDTO> attachmentList = resumeRepository.findAttachmentList(resumeSq);
		if (attachmentList != null && !attachmentList.isEmpty()) {
			attachmentList.forEach(file -> {
				String s3Url = amazonS3.getUrl(bucket, file.getFileSaveNm()).toString();
				file.setUrl(s3Url);
			});
		}
		resume.setAttachmentList(attachmentList);

		return resume;
	}

	public List<ParentSkillTagDTO> getParentSkillTags() {
		return resumeRepository.getParentSkillTags();
	}

	// 복사하기
	@Transactional
	public Long copyResume(Long userSq, Long originResumeSq, boolean withFiles) {
		// 0. 원본 이력서 조회
		ResumeRequestDTO originDto = resumeRepository.findByResumeSq(originResumeSq);
		if (originDto == null)
			throw new IllegalArgumentException("복사할 이력서를 찾을 수 없습니다.");
		originDto.setResumeIsRepresentativeYn("N");

		// 1. 주소 복사
		ResumeRequestDTO.AddressDTO address = resumeRepository
				.findAddressByAddressSq(originDto.getAddress().getAddressSq());
		resumeRepository.insertAddress(address);

		// 2. 기본정보 복사 (제목 후처리)
		String suffix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
		originDto.setResumeTtl("[복사본_" + suffix + "] " + originDto.getResumeTtl());
		originDto.setResumeSq(null);
		originDto.setAddress(address);
		resumeRepository.insertResume(userSq, originDto);
		Long newResumeSq = originDto.getResumeSq();

		// 3. 학력
		for (ResumeRequestDTO.EducationDTO edu : resumeRepository.findEducationList(originResumeSq)) {
			edu.setEducationSq(null);
			edu.setResumeSq(newResumeSq);
			resumeRepository.insertEducation(edu);
		}

		// 4. 경력
		for (ResumeRequestDTO.CareerDTO career : resumeRepository.findCareerList(originResumeSq)) {
			career.setCareerSq(null);
			career.setResumeSq(newResumeSq);
			resumeRepository.insertCareer(career);
		}

		// 5. 프로젝트 + 기술태그
		for (ResumeRequestDTO.ProjectHistoryDTO project : resumeRepository.findProjectHistoryList(originResumeSq)) {
			Long oldProjectSq = project.getProjectHistorySq();
			project.setProjectHistorySq(null);
			project.setResumeSq(newResumeSq);
			resumeRepository.insertProjectHistory(project);

			Long newProjectSq = project.getProjectHistorySq();
			for (ResumeRequestDTO.ProjectHistorySkillTagDTO tag : resumeRepository
					.findProjectHistorySkillTagList(oldProjectSq)) {
				tag.setProjectHistorySkillSq(null);
				tag.setProjectHistorySq(newProjectSq);
				resumeRepository.insertProjectHistorySkillTag(tag);
			}
		}

		// 6. 자격증
		for (ResumeRequestDTO.CertificationDTO cert : resumeRepository.findCertificationList(originResumeSq)) {
			cert.setCertificationSq(null);
			cert.setResumeSq(newResumeSq);
			resumeRepository.insertCertification(cert);
		}

		// 7. 교육
		for (ResumeRequestDTO.TrainingHistoryDTO training : resumeRepository.findTrainingHistoryList(originResumeSq)) {
			training.setTrainingSq(null);
			training.setResumeSq(newResumeSq);
			resumeRepository.insertTrainingHistory(training);
		}

		// 8. 보유 기술 태그
		for (ResumeRequestDTO.SkillTagDTO tag : resumeRepository.findSkillTagList(originResumeSq)) {
			tag.setResumeSkillSq(null);
			tag.setResumeSq(newResumeSq);
			resumeRepository.insertResumeSkillTag(tag);
		}

		// 9. 파일 매핑만 (withFiles=true일 경우)
		if (withFiles) {
			// 9-1. 프로필 이미지 매핑만
			ResumeRequestDTO.ResumeFileDTO profileImage = resumeRepository.findProfileImage(originResumeSq);
			if (profileImage != null) {
				resumeRepository.insertResumeProfileImageMapping(newResumeSq, profileImage.getFileSq());
			}

			// 9-2. 첨부파일 매핑만
			for (ResumeRequestDTO.ResumeFileDTO file : resumeRepository.findAttachmentList(originResumeSq)) {
				resumeRepository.insertResumeAttachmentMapping(newResumeSq, file.getFileSq());
			}
		}

		return newResumeSq;
	}

}