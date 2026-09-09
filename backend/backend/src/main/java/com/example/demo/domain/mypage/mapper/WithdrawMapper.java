package com.example.demo.domain.mypage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.mypage.dto.UserInfoDTO;

@Mapper
public interface WithdrawMapper {
    UserInfoDTO selectUserForWithdraw(@Param("userSq") Long userSq);

    int updateWithdrawUser(@Param("userSq") Long userSq);
}
