package com.example.demo.domain.mypage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.mypage.dto.AddressDTO;

@Mapper
public interface MypageAddressMapper {
//	Long selectAreaCodeBySigunguAndParent(@Param("sigungu") String sigungu, @Param("parentCode") Long parentCode );
//	Long selectAreaCodeSqBySigungu (@Param("sigungu") String sigungu);
//	Long selectAreaParentCodeBySido(@Param("sido") String sido);
	Long selectAreaCodeBySigungu(@Param("sigungu") String sigungu);
	Long selectAreaCodeBySidoAndSigungu(@Param("sido") String sido, @Param("sigungu") String sigungu);

	// 주소 INSERT
    void insertAddress(AddressDTO addressDTO);
}