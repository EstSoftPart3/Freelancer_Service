package com.example.demo.domain.mypage.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.mypage.dto.AddressDTO;
import com.example.demo.domain.mypage.dto.InformationEditAddressDTO;
import com.example.demo.domain.mypage.dto.UserInfoDTO;
import com.example.demo.domain.mypage.dto.request.AffiliationInfoUpdateRequestDTO;
import com.example.demo.domain.mypage.dto.request.CompanyVerifyRequestDTO;
import com.example.demo.domain.mypage.dto.request.PasswordCheckRequestDTO;
import com.example.demo.domain.mypage.dto.request.UserInfoUpdateRequestDTO;
import com.example.demo.domain.mypage.dto.response.AffiliationInfoResponseDTO;
import com.example.demo.domain.mypage.dto.response.CompanyUserInfoResponseDTO;
import com.example.demo.domain.mypage.dto.response.PersonalUserInfoResponseDTO;
import com.example.demo.domain.mypage.service.InformationEditService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/mypage/edit")
@RequiredArgsConstructor
public class InformationEditController {

    private final InformationEditService informationEditService;

    @PostMapping("/check-password")
    public ApiResponse<Boolean> checkPassword(
            @AuthenticationPrincipal Long userSq,
            @RequestBody PasswordCheckRequestDTO dto) {

        boolean matches = informationEditService.checkPassword(userSq, dto.getCurrentPassword());

        if (matches) {
            return ApiResponse.of(HttpStatus.OK, "비밀번호 일치", true);
        } else {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다.");
        }
    }

    @GetMapping("/info")
    public ApiResponse<?> getUserInfo(@AuthenticationPrincipal Long userSq) {
        UserInfoDTO user = informationEditService.getUserInfo(userSq);
        if (user == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다.");
        }

        if (user.getUserTypeCd().equals(301L)) {
            // 개인 회원
            InformationEditAddressDTO address = user.getAddressSq() != null
                    ? informationEditService.getAddress(user.getAddressSq())
                    : null;

            String genderName = user.getUserGenderCd() != null
                    ? informationEditService.getGenderName(user.getUserGenderCd())
                    : null;

            String profileImageUrl = informationEditService.getProfileImageUrl(userSq);

            PersonalUserInfoResponseDTO response = PersonalUserInfoResponseDTO.builder()
                    .userId(user.getUserId())
                    .userEmail(user.getUserEmail())
                    .userNm(user.getUserNm())
                    .userNickname(user.getUserNickname())
                    .userBirthDt(user.getUserBirthDt())
                    .userGenderNm(genderName != null ? genderName : null)
                    .userPhoneNum(user.getUserPhoneNum())
                    .userProfileImageUrl(profileImageUrl != null ? profileImageUrl : null)
                    .zonecode(address != null ? address.getZonecode() : null)
                    .address(address != null ? address.getAddress() : null)
                    .detailAddress(address != null ? address.getDetailAddress() : null)
                    .sigunguCode(address != null ? address.getAreaCodeSq() : null)
                    .latitude(address != null ? address.getLatitude() : null)
                    .longitude(address != null ? address.getLongitude() : null)
                    .build();

            return ApiResponse.of(HttpStatus.OK, "개인정보 조회 완료", response);
        } else if (user.getUserTypeCd().equals(302L)) {
            InformationEditAddressDTO address = user.getAddressSq() != null
                    ? informationEditService.getAddress(user.getAddressSq())
                    : null;

            String companyName = informationEditService.getCompanyName(userSq);

            String profileImageUrl = informationEditService.getProfileImageUrl(userSq);

            CompanyUserInfoResponseDTO response = CompanyUserInfoResponseDTO.builder()
                    .userId(user.getUserId())
                    .userEmail(user.getUserEmail())
                    .userNm(user.getUserNm())
                    .userNickname(user.getUserNickname())
                    .userPhoneNum(user.getUserPhoneNum())
                    .zonecode(address != null ? address.getZonecode() : null)
                    .address(address != null ? address.getAddress() : null)
                    .detailAddress(address != null ? address.getDetailAddress() : null)
                    .userProfileImageUrl(profileImageUrl != null ? profileImageUrl : null)
                    .sigunguCode(address != null ? address.getAreaCodeSq() : null)
                    .latitude(address != null ? address.getLatitude() : null)
                    .longitude(address != null ? address.getLongitude() : null)
                    .companyNm(companyName)
                    .build();

            return ApiResponse.of(HttpStatus.OK, "기업회원 정보 조회 완료", response);
        } else {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "유효하지 않은 회원입니다.");
        }
    }

    @PostMapping("/update")
    public ApiResponse<?> updateInformation(@AuthenticationPrincipal Long userSq,
            @RequestBody UserInfoUpdateRequestDTO dto) {
        UserInfoDTO user = informationEditService.getUserInfo(userSq);
        if (user == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다.");
        }

        if (user.getUserTypeCd().equals(301L)) {
            // 개인 회원
            informationEditService.updatePersonalInfo(userSq, dto.getPersonal());

            return ApiResponse.of(HttpStatus.OK, "개인회원 정보 업데이트 완료", null);
        } else if (user.getUserTypeCd().equals(302L)) {
            // 기업 회원
            informationEditService.updateCompanyInfo(userSq, dto.getCompany());
            return ApiResponse.of(HttpStatus.OK, "기업회원 정보 업데이트 완료", null);
        } else {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "유효하지 않은 회원입니다.");
        }
    }

    @GetMapping("/affiliation/info")
    public ApiResponse<AffiliationInfoResponseDTO> getAffiliationInfo(@AuthenticationPrincipal Long userSq) {
        AffiliationInfoResponseDTO result = informationEditService.getAffiliationInfo(userSq);

        if (result == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다.");
        }

        return ApiResponse.of(HttpStatus.OK, "기업회원 정보 조회 완료", result);
    }

    @PostMapping("/affiliation/recruiting/cancel")
    public ApiResponse<Void> cancelRecruiting(@AuthenticationPrincipal Long userSq) {
        boolean success = informationEditService.cancelCompanyRecruiting(userSq);

        if (!success) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "모집 상태 해제에 실패했습니다.");
        }

        return ApiResponse.of(HttpStatus.OK, "소속 공고 모집이 취소되었습니다.", null);
    }

    @PostMapping("/affiliation/update")
    public ApiResponse<Void> updateAffiliationInfo(@AuthenticationPrincipal Long userSq,
            @RequestBody AffiliationInfoUpdateRequestDTO dto) {
        try {
            informationEditService.updateAffiliationInfo(userSq, dto);
            return ApiResponse.of(HttpStatus.OK, "소속 정보가 성공적으로 수정되었습니다.", null);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "서버 에러가 발생했습니다.");
        }
    }

    @PostMapping("/profile-image/update")
    public ApiResponse<Void> updateProfileImage(
            @AuthenticationPrincipal Long userSq,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "업로드할 파일이 없습니다.");
        }

        try {
            informationEditService.updateProfileImage(userSq, file);
            return ApiResponse.of(HttpStatus.OK, "프로필 이미지가 성공적으로 업데이트되었습니다.", null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "프로필 이미지 업데이트 중 오류가 발생했습니다.");
        }

    }

    @DeleteMapping("/profile-image")
    public ApiResponse<Void> deleteProfileImage(@AuthenticationPrincipal Long userSq) {
        try {
            informationEditService.deleteProfileImage(userSq);
            return ApiResponse.of(HttpStatus.OK, "프로필 이미지가 삭제되었습니다.", null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "프로필 이미지 삭제에 실패했습니다.");
        }
    }

    @PostMapping("/affiliation/profile-image/update")
    public ApiResponse<Void> updateAffiliationProfileImage(
            @AuthenticationPrincipal Long userSq,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "업로드할 파일이 없습니다.");
        }

        try {
            informationEditService.updateAffiliationProfileImage(userSq, file);
            return ApiResponse.of(HttpStatus.OK, "프로필 이미지가 성공적으로 업데이트되었습니다.", null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "프로필 이미지 업데이트 중 오류가 발생했습니다.");
        }

    }

    @DeleteMapping("/affiliation/profile-image")
    public ApiResponse<Void> deleteAffiliationProfileImage(@AuthenticationPrincipal Long userSq) {
        try {
            informationEditService.deleteAffiliationProfileImage(userSq);
            return ApiResponse.of(HttpStatus.OK, "프로필 이미지가 삭제되었습니다.", null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "프로필 이미지 삭제에 실패했습니다.");
        }
    }

    @PostMapping("/verify-enterprise")
    public ApiResponse<Boolean> verifyEnterprise(
            @RequestBody CompanyVerifyRequestDTO requestDto,
            @AuthenticationPrincipal Long userSq) {

        return informationEditService.updateCompanyVerification(userSq, requestDto);

    }
}
