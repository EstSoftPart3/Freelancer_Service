package com.example.demo.domain.mypage.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.common.AmazonS3.UploadedFileDTO;
import com.example.demo.domain.mypage.dto.CompanyInfoDTO;
import com.example.demo.domain.mypage.dto.InformationEditAddressDTO;
import com.example.demo.domain.mypage.dto.ProfileImageInfoDTO;
import com.example.demo.domain.mypage.dto.UserInfoDTO;

@Mapper
public interface InformationEditMapper {
        String selectPasswordByUserSq(Long userSq);

        UserInfoDTO findUserInfoByUserSq(@Param("userSq") Long userSq);

        InformationEditAddressDTO findAddressByAddressSq(@Param("addressSq") Long addressSq);

        String findCommonCodeNameByGenderCd(@Param("codeSq") Long codeSq);

        String selectCompanyNameByUserSq(@Param("userSq") Long userSq);

        int updateUserInfo(@Param("userSq") Long userSq,
                        @Param("userPw") String userPw,
                        @Param("userEmail") String userEmail,
                        @Param("userPhoneNum") String userPhoneNum);

        int updateUserInfoWithoutPw(@Param("userSq") Long userSq,
                        @Param("userEmail") String userEmail,
                        @Param("userPhoneNum") String userPhoneNum);

        int updateCompanyInfo(@Param("userSq") Long userSq,
                        @Param("userPw") String userPw,
                        @Param("userEmail") String userEmail,
                        @Param("userPhoneNum") String userPhoneNum,
                        @Param("userNm") String userNm);

        int updateCompanyInfoWithoutPw(@Param("userSq") Long userSq,
                        @Param("userEmail") String userEmail,
                        @Param("userPhoneNum") String userPhoneNum,
                        @Param("userNm") String userNm);

        String findSigunguByAreaCodeSq(@Param("areaCodeSq") Long areaCodeSq);

        int updateAddress(@Param("userSq") Long userSq,
                        @Param("zonecode") String zonecode,
                        @Param("address") String address,
                        @Param("detailAddress") String detailAddress,
                        @Param("sigungu") String sigungu,
                        @Param("latitude") Double latitude,
                        @Param("longitude") Double longitude,
                        @Param("areaCodeSq") Long areaCodeSq);

        boolean existsByEmail(@Param("userEmail") String userEmail);

        boolean existsByPhone(@Param("userPhoneNum") String userPhoneNum);

        Long findUserSqByEmail(@Param("userEmail") String userEmail);

        Long findUserSqByPhone(@Param("userPhoneNum") String userPhoneNum);

        CompanyInfoDTO selectCompanyInfo(@Param("userSq") Long userSq);

        UserInfoDTO selectUserInfo(@Param("userSq") Long userSq);

        InformationEditAddressDTO selectAddressInfo(@Param("addressSq") Long addressSq);

        List<String> selectAffiliationTags(@Param("companySq") Long companySq);

        int updateRecruitingYnToN(@Param("userSq") Long userSq);

        Long findCompanySqByUserSq(@Param("userSq") Long userSq);

        Long findAffiliationAddressSqByCompanySq(@Param("companySq") Long companySq);

        void updateAffiliationPhoneNumByUserSq(@Param("userSq") Long userSq,
                        @Param("phoneNum") String phoneNum);

        void updateAffiliationUrlGreetingRecruitingByCompanySq(@Param("companySq") Long companySq,
                        @Param("companyUrl") String companyUrl,
                        @Param("greetingTxt") String greetingTxt,
                        @Param("isRecruitingYn") String isRecruitingYn);

        void updateAffiliationAddressByAddressSq(@Param("addressSq") Long addressSq,
                        @Param("zonecode") String zonecode,
                        @Param("address") String address,
                        @Param("detailAddress") String detailAddress,
                        @Param("sigungu") String sigungu,
                        @Param("latitude") Double latitude,
                        @Param("longitude") Double longitude,
                        @Param("areaCodeSq") Long areaCodeSq);

        void deleteAffiliationTagsByCompanySq(@Param("companySq") Long companySq);

        void insertAffiliationTagByCompanySq(@Param("companySq") Long companySq,
                        @Param("tagNm") String tagNm);

        Long selectFileSqByUserSq(@Param("userSq") Long userSq);

        UploadedFileDTO selectFileBySq(@Param("fileSq") Long fileSq);

        int insertFile(ProfileImageInfoDTO fileInfo);

        int insertUserProfileImage(@Param("userSq") Long userSq, @Param("fileSq") Long fileSq);

        int deleteUserProfileImageByUserSq(@Param("userSq") Long userSq);

        ProfileImageInfoDTO findFileByUserSq(@Param("userSq") Long userSq);

        void markFileAsDeleted(@Param("fileSq") Long fileSq);

        Long selectFileSqByCompanySq(@Param("companySq") Long companySq);

        int insertAffiliationProfileImage(@Param("companySq") Long companySq, @Param("fileSq") Long fileSq);

        int deleteAffiliationProfileImageByUserSq(@Param("companySq") Long companySq);

        ProfileImageInfoDTO findAffiliationFileByUserSq(@Param("companySq") Long companySq);

        void updateCompanyVerification(Map<String, Object> params);
}