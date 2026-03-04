package com.example.demo.domain.mypage.service;

import java.net.URI;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.common.File.FileStorageService;
import com.example.demo.domain.mypage.dto.CompanyInfoDTO;
import com.example.demo.domain.mypage.dto.InformationEditAddressDTO;
import com.example.demo.domain.mypage.dto.ProfileImageInfoDTO;
import com.example.demo.domain.mypage.dto.UserInfoDTO;
import com.example.demo.domain.mypage.dto.request.AffiliationInfoUpdateRequestDTO;
import com.example.demo.domain.mypage.dto.request.CompanyUserInfoUpdateRequestDTO;
import com.example.demo.domain.mypage.dto.request.CompanyVerifyRequestDTO;
import com.example.demo.domain.mypage.dto.request.PersonalUserInfoUpdateRequestDTO;
import com.example.demo.domain.mypage.dto.response.AffiliationInfoResponseDTO;
import com.example.demo.domain.mypage.mapper.InformationEditMapper;
import com.example.demo.domain.mypage.repository.InformationEditRepository;
import com.example.demo.domain.user.repository.CompanyVerificationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class InformationEditService {

    private final InformationEditRepository informationEditRepository;
    private final InformationEditMapper informationEditMapper;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate = new RestTemplate();
    private final CompanyVerificationRepository companyVerificationRepository;

    public boolean checkPassword(Long userSq, String rawPassword) {
        String encodedPw = informationEditRepository.getEncodedPasswordByUserSq(userSq);
        if (encodedPw == null) {
            throw new RuntimeException("User not found");
        }
        return passwordEncoder.matches(rawPassword, encodedPw);
    }

    public UserInfoDTO getUserInfo(Long userSq) {
        return informationEditRepository.findUser(userSq);
    }

    public InformationEditAddressDTO getAddress(Long addressSq) {
        return informationEditRepository.findAddress(addressSq);
    }

    public String getGenderName(Long genderCd) {
        return informationEditRepository.findCommonCodeName(genderCd);
    }

    public String getCompanyName(Long userSq) {
        return informationEditRepository.getCompanyNameByUserSq(userSq);
    }

    @Transactional
    public void updatePersonalInfo(Long userSq, PersonalUserInfoUpdateRequestDTO dto) {
        // 이메일 중복 검사
        Long emailOwner = informationEditRepository.findUserSqByEmail(dto.getUserEmail());
        if (emailOwner != null && !emailOwner.equals(userSq)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 휴대폰 중복 검사
        Long phoneOwner = informationEditRepository.findUserSqByPhone(dto.getUserPhoneNum());
        if (phoneOwner != null && !phoneOwner.equals(userSq)) {
            throw new IllegalArgumentException("이미 사용 중인 휴대폰 번호입니다.");
        }

        // null일 경우 기존 값과 동일하므로 업데이트에서 제외할 수도 있음
        String emailToUpdate = dto.getUserEmail();
        String phoneToUpdate = dto.getUserPhoneNum();

        if (dto.getUserPw() != null && !dto.getUserPw().isBlank()) {
            String encryptedPw = passwordEncoder.encode(dto.getUserPw());
            informationEditRepository.updateUser(userSq, encryptedPw, emailToUpdate, phoneToUpdate);
        } else {
            informationEditRepository.updateUserWithoutPw(userSq, emailToUpdate, phoneToUpdate);
        }

        String sigungu = informationEditRepository.findSigunguByAreaCodeSq(dto.getSigunguCode());

        informationEditRepository.updateAddress(
                userSq,
                dto.getZonecode(),
                dto.getAddress(),
                dto.getDetailAddress(),
                sigungu,
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getSigunguCode());
    }

    @Transactional
    public void updateCompanyInfo(Long userSq, CompanyUserInfoUpdateRequestDTO dto) {
        // 이메일 중복 검사
        Long emailOwner = informationEditRepository.findUserSqByEmail(dto.getUserEmail());
        if (emailOwner != null && !emailOwner.equals(userSq)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 휴대폰 중복 검사
        Long phoneOwner = informationEditRepository.findUserSqByPhone(dto.getUserPhoneNum());
        if (phoneOwner != null && !phoneOwner.equals(userSq)) {
            throw new IllegalArgumentException("이미 사용 중인 휴대폰 번호입니다.");
        }

        // null일 경우 기존 값과 동일하므로 업데이트에서 제외할 수도 있음
        String emailToUpdate = dto.getUserEmail();
        String phoneToUpdate = dto.getUserPhoneNum();
        String nameToUpdate = dto.getUserNm();

        if (dto.getUserPw() != null && !dto.getUserPw().isBlank()) {
            String encryptedPw = passwordEncoder.encode(dto.getUserPw());
            informationEditRepository.updateCompany(userSq, encryptedPw, emailToUpdate, phoneToUpdate, nameToUpdate);
        } else {
            informationEditRepository.updateCompanyWithoutPw(userSq, emailToUpdate, phoneToUpdate, nameToUpdate);
        }

        String sigungu = informationEditRepository.findSigunguByAreaCodeSq(dto.getSigunguCode());

        informationEditRepository.updateAddress(
                userSq,
                dto.getZonecode(),
                dto.getAddress(),
                dto.getDetailAddress(),
                sigungu,
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getSigunguCode());
    }

    /**
     * 기업 소속 정보 조회 (S3 URL -> 로컬 경로 수정)
     */
    public AffiliationInfoResponseDTO getAffiliationInfo(Long userSq) {
        // [수정] 변수명 오타 교정 (imageUrlcompanyInfo -> companyInfo)
        CompanyInfoDTO companyInfo = informationEditRepository.getCompanyInfo(userSq);
        if (companyInfo == null) {
            return null;
        }

        UserInfoDTO userInfo = informationEditRepository.getUserInfo(userSq);
        InformationEditAddressDTO addressInfo = informationEditRepository.getAddressInfo(companyInfo.getAddressSq());
        List<String> tagList = informationEditRepository.getCompanyTags(companyInfo.getCompanySq());

        // 파일 정보 조회
        Long fileSq = informationEditRepository.findFileSqByCompanySq(companyInfo.getCompanySq());
        UploadedFileDTO file = informationEditRepository.findByFileSq(fileSq);
        // CasaOS 용
        String imageUrl = (file != null) ? "/files/" + file.getSavedName() : null;
        // 로컬용
        // String imageUrl = (file != null) ? "/api/files/" + file.getSavedName() :
        // null;

        return AffiliationInfoResponseDTO.of(companyInfo, userInfo, addressInfo, tagList, imageUrl);
    }

    /**
     * 기업 모집 상태 취소 (이 로직은 파일과 관계없으므로 유지)
     */
    public boolean cancelCompanyRecruiting(Long userSq) {
        int updated = informationEditRepository.updateRecruitingStatusToN(userSq);
        return updated > 0;
    }

    // public AffiliationInfoResponseDTO getAffiliationInfo(Long userSq) {
    // CompanyInfoDTO imageUrlcompanyInfo =
    // informationEditRepository.getCompanyInfo(userSq);
    // if (companyInfo == null) {
    // return null;
    // }

    // UserInfoDTO userInfo = informationEditRepository.getUserInfo(userSq);
    // InformationEditAddressDTO addressInfo =
    // informationEditRepository.getAddressInfo(companyInfo.getAddressSq());
    // List<String> tagList =
    // informationEditRepository.getCompanyTags(companyInfo.getCompanySq());
    // Long fileSq =
    // informationEditRepository.findFileSqByCompanySq(companyInfo.getCompanySq());
    // UploadedFileDTO file = informationEditRepository.findByFileSq(fileSq);

    // String imageUrl = (file != null) ? amazonS3.getUrl(bucket,
    // file.getSavedName()).toString() : null;

    // return AffiliationInfoResponseDTO.of(companyInfo, userInfo, addressInfo,
    // tagList, imageUrl);
    // }

    // public boolean cancelCompanyRecruiting(Long userSq) {
    // int updated = informationEditRepository.updateRecruitingStatusToN(userSq);
    // return updated > 0;
    // }

    @Transactional
    public void updateAffiliationInfo(Long userSq, AffiliationInfoUpdateRequestDTO dto) {
        try {
            Long companySq = informationEditRepository.findCompanySqByUserSq(userSq);
            if (companySq == null) {
                throw new IllegalArgumentException("해당 사용자의 소속 회사 정보를 찾을 수 없습니다.");
            }

            Long affiliationAddressSq = informationEditRepository.findAffiliationAddressSqByCompanySq(companySq);
            if (affiliationAddressSq == null) {
                throw new IllegalArgumentException("해당 회사의 주소 정보가 존재하지 않습니다.");
            }

            if (dto.getUserPhoneNum() != null && !dto.getUserPhoneNum().isEmpty()) {
                Long phoneOwner = informationEditRepository.findUserSqByPhone(dto.getUserPhoneNum());
                if (phoneOwner != null && !phoneOwner.equals(userSq)) {
                    throw new IllegalArgumentException("이미 사용 중인 휴대폰 번호입니다.");
                }
                informationEditRepository.updateAffiliationPhoneNumByUserSq(userSq, dto.getUserPhoneNum());
            }

            informationEditRepository.updateAffiliationUrlGreetingRecruitingByCompanySq(companySq,
                    dto.getCompanyUrl(),
                    dto.getCompanyGreetingTxt(),
                    dto.getCompanyIsRecruitingYn());

            String sigungu = informationEditRepository.findSigunguByAreaCodeSq(dto.getSigunguCode());
            log.info("조회 시군구명: {}", sigungu);

            informationEditRepository.updateAffiliationAddressByAddressSq(affiliationAddressSq, dto, sigungu);

            informationEditRepository.deleteAffiliationTagsByCompanySq(companySq);
            if (dto.getTagNm() != null && !dto.getTagNm().isEmpty()) {
                dto.getTagNm()
                        .forEach(tag -> informationEditRepository.insertAffiliationTagByCompanySq(companySq, tag));
            }

        } catch (Exception e) {
            log.error("소속 정보 수정 중 예외 발생: {}", e.getMessage(), e);
            throw e; // 트랜잭션 롤백을 위해 다시 던짐
        }
    }

    private final FileStorageService fileStorageService; // 주입 변경

    /**
     * 프로필 이미지 URL 반환 (S3 URL 대신 로컬 API 경로 반환)
     */
    public String getProfileImageUrl(Long userSq) {
        Long fileSq = informationEditRepository.findFileSqByUserSq(userSq);
        if (fileSq == null)
            return null;

        UploadedFileDTO file = informationEditRepository.findByFileSq(fileSq);
        if (file == null)
            return null;

        // /api/files/파일명 형태로 반환 (WebConfig 매핑 기준)
        return "/files/" + file.getSavedName(); // CasaOS 용
        // return "/api/files/" + file.getSavedName(); // 로컬용
    }

    /**
     * 개인 프로필 이미지 수정
     */
    @Transactional
    public void updateProfileImage(Long userSq, MultipartFile multipartFile) {
        validateUpdate(userSq, multipartFile);

        // 1. 기존 파일 삭제 로직
        ProfileImageInfoDTO existing = informationEditRepository.findFileByUserSq(userSq);
        if (existing != null) {
            fileStorageService.deleteFile(existing.getSavedName()); // 로컬 파일 삭제
            informationEditRepository.markFileAsDeleted(existing.getFileSq());
            informationEditRepository.deleteUserProfileImageByUserSq(userSq);
        }

        // 2. 새 파일 로컬 저장
        UploadedFileDTO uploaded = fileStorageService.uploadFile(multipartFile);

        // 3. DB 기록
        saveFileInfoAndMapping(userSq, uploaded, "USER");
    }

    /**
     * 개인 프로필 이미지 삭제
     */
    @Transactional
    public void deleteProfileImage(Long userSq) {
        ProfileImageInfoDTO existing = informationEditRepository.findFileByUserSq(userSq);
        if (existing == null) {
            throw new IllegalArgumentException("삭제할 프로필 이미지가 존재하지 않습니다.");
        }

        fileStorageService.deleteFile(existing.getSavedName());
        informationEditRepository.markFileAsDeleted(existing.getFileSq());
        informationEditRepository.deleteUserProfileImageByUserSq(userSq);
    }

    /**
     * 기업 프로필 이미지 수정
     */
    @Transactional
    public void updateAffiliationProfileImage(Long userSq, MultipartFile multipartFile) {
        validateUpdate(userSq, multipartFile);

        Long companySq = informationEditRepository.findCompanySqByUserSq(userSq);
        if (companySq == null) {
            throw new IllegalArgumentException("해당 사용자의 기업 정보를 찾을 수 없습니다.");
        }

        // 1. 기존 기업 로고 삭제
        ProfileImageInfoDTO existing = informationEditRepository.findAffiliationFileByUserSq(companySq);
        if (existing != null) {
            fileStorageService.deleteFile(existing.getSavedName());
            informationEditRepository.markFileAsDeleted(existing.getFileSq());
            informationEditRepository.deleteAffiliationProfileImageByUserSq(companySq);
        }

        // 2. 새 로고 저장
        UploadedFileDTO uploaded = fileStorageService.uploadFile(multipartFile);

        // 3. DB 기록
        saveFileInfoAndMapping(companySq, uploaded, "COMPANY");
    }

    /**
     * 공통 저장 로직 (중복 제거)
     */
    private void saveFileInfoAndMapping(Long sq, UploadedFileDTO uploaded, String type) {
        ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
                .originalName(uploaded.getOriginalName())
                .savedName(uploaded.getSavedName())
                .contentType(uploaded.getContentType())
                .size(uploaded.getSize())
                .build();

        informationEditRepository.saveFile(fileInfo);

        if ("USER".equals(type)) {
            informationEditRepository.saveUserProfileImage(sq, fileInfo.getFileSq());
        } else {
            informationEditRepository.saveAffiliationProfileImage(sq, fileInfo.getFileSq());
        }
    }

    private void validateUpdate(Long userSq, MultipartFile file) {
        if (userSq == null)
            throw new IllegalArgumentException("사용자 순번이 없습니다.");
        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("파일이 비어있습니다.");
    }

    /**
     * 기업 프로필 이미지(로고) 삭제
     */
    @Transactional
    public void deleteAffiliationProfileImage(Long userSq) {
        if (userSq == null) {
            throw new IllegalArgumentException("사용자 순번이 없습니다.");
        }

        // 1. 사용자에 해당하는 기업 번호 조회
        Long companySq = informationEditRepository.findCompanySqByUserSq(userSq);
        if (companySq == null) {
            throw new IllegalArgumentException("사용자에 해당하는 기업 정보가 없습니다.");
        }

        // 2. 해당 기업의 기존 로고 파일 정보 조회
        ProfileImageInfoDTO existing = informationEditRepository.findAffiliationFileByUserSq(companySq);
        if (existing == null) {
            throw new IllegalArgumentException("삭제할 기업 프로필 이미지가 존재하지 않습니다.");
        }

        // 3. 로컬 저장소에서 물리 파일 삭제
        fileStorageService.deleteFile(existing.getSavedName());

        // 4. DB 상태 변경 (논리 삭제 및 매핑 삭제)
        informationEditRepository.markFileAsDeleted(existing.getFileSq());
        informationEditRepository.deleteAffiliationProfileImageByUserSq(companySq);

        log.info("기업 [{}] 프로필 이미지 삭제 완료", companySq);
    }

    // s3용 프로필 이미지

    // private final AmazonS3 amazonS3;

    // private final AmazonS3Service amazonS3Service;

    // @Value("${cloud.aws.s3.bucket}")
    // private String bucket;

    // public String getProfileImageUrl(Long userSq) {
    // Long fileSq = informationEditRepository.findFileSqByUserSq(userSq);
    // if (fileSq == null)
    // return null;

    // UploadedFileDTO file = informationEditRepository.findByFileSq(fileSq);
    // if (file == null)
    // return null;

    // return amazonS3.getUrl(bucket, file.getSavedName()).toString();
    // }

    // @Transactional
    // public void updateProfileImage(Long userSq, MultipartFile multipartFile) {
    // if (userSq == null) {
    // throw new IllegalArgumentException("사용자 순번(userSq)이 null입니다.");
    // }
    // if (multipartFile == null || multipartFile.isEmpty()) {
    // throw new IllegalArgumentException("업로드할 파일이 없습니다.");
    // }

    // ProfileImageInfoDTO existing =
    // informationEditRepository.findFileByUserSq(userSq);
    // if (existing != null) {
    // amazonS3Service.deleteFile(existing.getSavedName());
    // informationEditRepository.markFileAsDeleted(existing.getFileSq());
    // informationEditRepository.deleteUserProfileImageByUserSq(userSq);
    // }

    // UploadedFileDTO uploaded = amazonS3Service.uploadFile(multipartFile);

    // ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
    // .originalName(uploaded.getOriginalName())
    // .savedName(uploaded.getSavedName())
    // .contentType(uploaded.getContentType())
    // .size(uploaded.getSize())
    // .build();

    // informationEditRepository.saveFile(fileInfo);
    // informationEditRepository.saveUserProfileImage(userSq, fileInfo.getFileSq());
    // }

    // @Transactional
    // public void deleteProfileImage(Long userSq) {
    // if (userSq == null) {
    // throw new IllegalArgumentException("사용자 순번(userSq)이 null입니다.");
    // }

    // ProfileImageInfoDTO existing =
    // informationEditRepository.findFileByUserSq(userSq);
    // if (existing == null) {
    // throw new IllegalArgumentException("사용자에 대한 기존 프로필 이미지가 존재하지 않습니다.");
    // }

    // amazonS3Service.deleteFile(existing.getSavedName());
    // informationEditRepository.markFileAsDeleted(existing.getFileSq());
    // informationEditRepository.deleteUserProfileImageByUserSq(userSq);
    // }

    // @Transactional
    // public void updateAffiliationProfileImage(Long userSq, MultipartFile
    // multipartFile) {
    // if (userSq == null) {
    // throw new IllegalArgumentException("사용자 순번(userSq)이 null입니다.");
    // }
    // if (multipartFile == null || multipartFile.isEmpty()) {
    // throw new IllegalArgumentException("업로드할 파일이 없습니다.");
    // }

    // Long companySq = informationEditRepository.findCompanySqByUserSq(userSq);
    // if (companySq == null) {
    // throw new IllegalArgumentException("사용자에 해당하는 기업이 존재하지 않습니다.");
    // }

    // ProfileImageInfoDTO existing =
    // informationEditRepository.findAffiliationFileByUserSq(companySq);
    // if (existing != null) {
    // amazonS3Service.deleteFile(existing.getSavedName());
    // informationEditRepository.markFileAsDeleted(existing.getFileSq());
    // informationEditRepository.deleteAffiliationProfileImageByUserSq(companySq);
    // }

    // UploadedFileDTO uploaded = amazonS3Service.uploadFile(multipartFile);

    // ProfileImageInfoDTO fileInfo = ProfileImageInfoDTO.builder()
    // .originalName(uploaded.getOriginalName())
    // .savedName(uploaded.getSavedName())
    // .contentType(uploaded.getContentType())
    // .size(uploaded.getSize())
    // .build();

    // informationEditRepository.saveFile(fileInfo);
    // informationEditRepository.saveAffiliationProfileImage(companySq,
    // fileInfo.getFileSq());
    // }

    // @Transactional
    // public void deleteAffiliationProfileImage(Long userSq) {
    // if (userSq == null) {
    // throw new IllegalArgumentException("사용자 순번(userSq)이 null입니다.");
    // }

    // Long companySq = informationEditRepository.findCompanySqByUserSq(userSq);
    // if (companySq == null) {
    // throw new IllegalArgumentException("사용자에 해당하는 기업이 존재하지 않습니다.");
    // }

    // ProfileImageInfoDTO existing =
    // informationEditRepository.findAffiliationFileByUserSq(companySq);
    // if (existing == null) {
    // throw new IllegalArgumentException("해당 기업에 대한 기존 프로필 이미지가 존재하지 않습니다.");
    // }

    // amazonS3Service.deleteFile(existing.getSavedName());
    // informationEditRepository.markFileAsDeleted(existing.getFileSq());
    // informationEditRepository.deleteAffiliationProfileImageByUserSq(companySq);
    // }

    @Transactional
    public ApiResponse<Boolean> updateCompanyVerification(Long userSq, CompanyVerifyRequestDTO requestDto) {

        // 1. 사업자 번호 중복 검사 (본인 제외 혹은 전체)
        // 기존에 등록된 번호인지 확인하는 로직 (필요시 추가)
        boolean exists = companyVerificationRepository.existsByBizNum(requestDto.getCompanyBizNum());
        if (exists) {
            return ApiResponse.of(HttpStatus.CONFLICT, "이미 등록된 사업자등록번호입니다.", false);
        }

        // 2. 외부 API(공공데이터포털) 호출 설정
        URI uri;
        try {
            uri = UriComponentsBuilder.fromHttpUrl("http://api.odcloud.kr/api/nts-businessman/v1/validate")
                    .queryParam("serviceKey",
                            "oo7Cptu%2Fmuq0VdvJOvEZ816dEyBChjhrqLIM0HqL2%2BeJeZXKg46MztkspSRsh3HBX%2FlyqoXbNCWB4OydznQ%2Bmg%3D%3D")
                    .build(true).toUri();
        } catch (Exception e) {
            return ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "URI 생성 실패", false);
        }

        // 3. API 요청 바디 구성 (외부 API 규격: b_no, start_dt, p_nm, b_nm)
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, String> business = new HashMap<>();
        business.put("b_no", requestDto.getCompanyBizNum());
        business.put("start_dt", requestDto.getCompanyOpenDt().replace("-", "")); // 하이픈 제거
        business.put("p_nm", requestDto.getCompanyCeoNm());
        business.put("b_nm", requestDto.getCompanyNm());
        requestBody.put("businesses", Collections.singletonList(business));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // 4. API 호출 및 검증
        try {
            ResponseEntity<Map> resultMap = restTemplate.exchange(uri, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = resultMap.getBody();
            List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");

            if (dataList != null && !dataList.isEmpty()) {
                Map<String, Object> result = dataList.get(0);
                String valid = (String) result.get("valid");

                // "01" 이면 유효한 사업자
                if ("01".equals(valid)) {
                    // 5. [핵심] 검증 성공 시 DB 업데이트 실행
                    Map<String, Object> params = new HashMap<>();
                    params.put("userSq", userSq);
                    params.put("companyNm", requestDto.getCompanyNm());
                    params.put("companyCeoNm", requestDto.getCompanyCeoNm());
                    params.put("companyBizNum", requestDto.getCompanyBizNum());
                    // DB 저장을 위해 LocalDate로 변환 (형식: yyyy-MM-dd)
                    params.put("companyOpenDt", LocalDate.parse(requestDto.getCompanyOpenDt()));
                    params.put("statusCd", 2502L); // 인증완료 코드

                    informationEditMapper.updateCompanyVerification(params);

                    return ApiResponse.of(HttpStatus.OK, "인증 및 정보 업데이트 성공", true);
                } else {
                    String validMsg = (String) result.getOrDefault("valid_msg", "사업자 정보 불일치");
                    return ApiResponse.of(HttpStatus.BAD_REQUEST, validMsg, false);
                }
            }
        } catch (Exception e) {
            return ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "인증 API 호출 중 오류 발생", false);
        }

        return ApiResponse.of(HttpStatus.BAD_REQUEST, "인증 실패", false);
    }
}
