package com.example.demo.domain.mypage.repository;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.mypage.dto.UserInfoDTO;
import com.example.demo.domain.mypage.mapper.WithdrawMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class WithdrawRepository {
    private final WithdrawMapper withdrawMapper;

    public UserInfoDTO getUser(Long userSq) {
        return withdrawMapper.selectUserForWithdraw(userSq);
    }

    public int withdraw(Long userSq) {
        return withdrawMapper.updateWithdrawUser(userSq);
    }
}
