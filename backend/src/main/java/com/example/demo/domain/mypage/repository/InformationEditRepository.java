package com.example.demo.domain.mypage.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.domain.mypage.dto.CompanyInfoDTO;
import com.example.demo.domain.mypage.dto.InformationEditAddressDTO;
import com.example.demo.domain.mypage.dto.ProfileImageInfoDTO;
import com.example.demo.domain.mypage.dto.UserInfoDTO;
import com.example.demo.domain.mypage.dto.request.AffiliationInfoUpdateRequestDTO;
import com.example.demo.domain.mypage.mapper.InformationEditMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class InformationEditRepository {

    private final InformationEditMapper informationEditMapper;

    public String getEncodedPasswordByUserSq(Long userSq) {
        return informationEditMapper.selectPasswordByUserSq(userSq);
    }

    public UserInfoDTO findUser(Long userSq) {
        return informationEditMapper.findUserInfoByUserSq(userSq);
    }

    public InformationEditAddressDTO findAddress(Long addressSq) {
        return informationEditMapper.findAddressByAddressSq(addressSq);
    }

    public String findCommonCodeName(Long codeSq) {
        return informationEditMapper.findCommonCodeNameByGenderCd(codeSq);
    }

    public String getCompanyNameByUserSq(Long userSq) {
        return informationEditMapper.selectCompanyNameByUserSq(userSq);
    }

    public void updateUser(Long userSq, String userPw, String userEmail, String userPhoneNum) {
        informationEditMapper.updateUserInfo(userSq, userPw, userEmail, userPhoneNum);
    }

    public void updateUserWithoutPw(Long userSq, String userEmail, String userPhoneNum) {
        informationEditMapper.updateUserInfoWithoutPw(userSq, userEmail, userPhoneNum);
    }

    public void updateCompany(Long userSq, String userPw, String userEmail, String userPhoneNum, String userNm) {
        informationEditMapper.updateCompanyInfo(userSq, userPw, userEmail, userPhoneNum, userNm);
    }

    public void updateCompanyWithoutPw(Long userSq, String userEmail, String userPhoneNum, String userNm) {
        informationEditMapper.updateCompanyInfoWithoutPw(userSq, userEmail, userPhoneNum, userNm);
    }

    public void updateAddress(Long userSq, String zonecode, String address, String detailAddress, String sigungu,
            Double lat, Double lon, Long areaCodeSq) {
        informationEditMapper.updateAddress(userSq, zonecode, address, detailAddress, sigungu, lat, lon, areaCodeSq);
    }

    public String findSigunguByAreaCodeSq(Long areaCodeSq) {
        return informationEditMapper.findSigunguByAreaCodeSq(areaCodeSq);
    }

    public boolean isEmailDuplicate(String email) {
        return informationEditMapper.existsByEmail(email);
    }

    public boolean isPhoneDuplicate(String phone) {
        return informationEditMapper.existsByPhone(phone);
    }

    public Long findUserSqByEmail(String userEmail) {
        return informationEditMapper.findUserSqByEmail(userEmail);
    }

    public Long findUserSqByPhone(String userPhoneNum) {
        return informationEditMapper.findUserSqByPhone(userPhoneNum);
    }

    public CompanyInfoDTO getCompanyInfo(Long userSq) {
        return informationEditMapper.selectCompanyInfo(userSq);
    }

    public UserInfoDTO getUserInfo(Long userSq) {
        return informationEditMapper.selectUserInfo(userSq);
    }

    public InformationEditAddressDTO getAddressInfo(Long addressSq) {
        return informationEditMapper.selectAddressInfo(addressSq);
    }

    public List<String> getCompanyTags(Long companySq) {
        return informationEditMapper.selectAffiliationTags(companySq);
    }

    public int updateRecruitingStatusToN(Long userSq) {
        return informationEditMapper.updateRecruitingYnToN(userSq);
    }

    public Long findCompanySqByUserSq(Long userSq) {
        return informationEditMapper.findCompanySqByUserSq(userSq);
    }

    public Long findAffiliationAddressSqByCompanySq(Long companySq) {
        return informationEditMapper.findAffiliationAddressSqByCompanySq(companySq);
    }

    public void updateAffiliationPhoneNumByUserSq(Long userSq, String phoneNum) {
        informationEditMapper.updateAffiliationPhoneNumByUserSq(userSq, phoneNum);
    }

    public void updateAffiliationUrlGreetingRecruitingByCompanySq(Long companySq, String companyUrl,
            String greetingTxt, String isRecruitingYn) {
        informationEditMapper.updateAffiliationUrlGreetingRecruitingByCompanySq(companySq, companyUrl, greetingTxt,
                isRecruitingYn);
    }

    public void updateAffiliationAddressByAddressSq(Long addressSq, AffiliationInfoUpdateRequestDTO dto,
            String sigungu) {
        informationEditMapper.updateAffiliationAddressByAddressSq(addressSq, dto.getZonecode(), dto.getAddress(),
                dto.getDetailAddress(), sigungu, dto.getLatitude(), dto.getLongitude(), dto.getSigunguCode());
    }

    public void deleteAffiliationTagsByCompanySq(Long companySq) {
        informationEditMapper.deleteAffiliationTagsByCompanySq(companySq);
    }

    public void insertAffiliationTagByCompanySq(Long companySq, String tagNm) {
        informationEditMapper.insertAffiliationTagByCompanySq(companySq, tagNm);
    }

    public Long findFileSqByUserSq(Long userSq) {
        return informationEditMapper.selectFileSqByUserSq(userSq);
    }

    public UploadedFileDTO findByFileSq(Long fileSq) {
        return informationEditMapper.selectFileBySq(fileSq);
    }

    public void saveFile(ProfileImageInfoDTO fileInfo) {
        informationEditMapper.insertFile(fileInfo);
    }

    public void saveUserProfileImage(Long userSq, Long fileSq) {
        informationEditMapper.insertUserProfileImage(userSq, fileSq);
    }

    public void deleteUserProfileImageByUserSq(Long userSq) {
        informationEditMapper.deleteUserProfileImageByUserSq(userSq);
    }

    public void markFileAsDeleted(Long fileSq) {
        informationEditMapper.markFileAsDeleted(fileSq);
    }

    public ProfileImageInfoDTO findFileByUserSq(Long userSq) {
        return informationEditMapper.findFileByUserSq(userSq);
    }

    public Long findFileSqByCompanySq(Long companySq) {
        return informationEditMapper.selectFileSqByCompanySq(companySq);
    }

    public void saveAffiliationProfileImage(Long companySq, Long fileSq) {
        informationEditMapper.insertAffiliationProfileImage(companySq, fileSq);
    }

    public void deleteAffiliationProfileImageByUserSq(Long companySq) {
        informationEditMapper.deleteAffiliationProfileImageByUserSq(companySq);
    }

    public ProfileImageInfoDTO findAffiliationFileByUserSq(Long companySq) {
        return informationEditMapper.findAffiliationFileByUserSq(companySq);
    }
}