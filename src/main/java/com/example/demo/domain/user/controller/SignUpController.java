package com.example.demo.domain.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.request.SignUpRequestDTO;
import com.example.demo.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SignUpController {

    private final UserService userService;

    @GetMapping("/check-id")
    public boolean checkUserId(@RequestParam(name = "userId") String userId) {
        return userService.isUserIdExists(userId);
    }

    @PostMapping("/signup")
    public ApiResponse<?> signUp(@RequestBody SignUpRequestDTO dto) {
        try {
            userService.signUp(dto);
            return ApiResponse.of(HttpStatus.OK, "회원가입 성공", null);
        } catch (IllegalArgumentException e) {
            return ApiResponse.of(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            // 서버 내부 오류
            return ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.", null);
        }
    }

}
