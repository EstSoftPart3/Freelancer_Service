package com.example.demo.domain.mypage.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.mypage.dto.request.UserWithdrawRequestDTO;
import com.example.demo.domain.mypage.service.WithdrawService;

@RestController
@RequestMapping("/mypage")
public class WithdrawController {
    private final WithdrawService withdrawService;

    public WithdrawController(WithdrawService withdrawService) {
        this.withdrawService = withdrawService;
    }

    @PostMapping("/withdraw")
    public ApiResponse<Void> withdraw(
            @AuthenticationPrincipal Long userSq,
            @RequestBody UserWithdrawRequestDTO dto) {
        try {
            withdrawService.withdraw(userSq, dto);
            return ApiResponse.of(HttpStatus.OK, "회원 탈퇴가 완료되었습니다.", null);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "서버 에러가 발생했습니다.");
        }
    }
}
