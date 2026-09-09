package com.example.demo.domain.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.request.FindIdRequestDTO;
import com.example.demo.domain.user.dto.request.ResetPasswordRequestDTO;
import com.example.demo.domain.user.dto.request.ResetPasswordVerifyRequestDTO;
import com.example.demo.domain.user.dto.response.FindIdResponseDTO;
import com.example.demo.domain.user.service.UserService;
import com.example.demo.domain.user.util.JwtProvider;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class FindController {

    private final UserService userService;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/find-id")
    public ApiResponse<FindIdResponseDTO> findUserId(@RequestBody FindIdRequestDTO request) {
        FindIdResponseDTO result = userService.findUserIdByNameAndEmail(request.getName(), request.getEmail());

        if (result != null) {
            return ApiResponse.of(HttpStatus.OK, "아이디 찾기 성공", result);
        } else {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "일치하는 회원 정보를 찾을 수 없습니다.");
        }
    }

    @PostMapping("/reset-password/verify")
    public ApiResponse<?> verifyUserForReset(@RequestBody ResetPasswordVerifyRequestDTO dto,
            HttpServletResponse response) {
        UserDTO user = userService.findUserByInfo(dto.getUserId(), dto.getName(), dto.getEmail());

        if (user == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "일치하는 회원 정보를 찾을 수 없습니다.");
        }

        String resetToken = jwtProvider.createResetToken(user.getUserSq());

        Cookie cookie = new Cookie("RESET_TOKEN", resetToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(300);
        response.addCookie(cookie);

        return ApiResponse.of(HttpStatus.OK, "인증 성공", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<?> resetPassword(
            @CookieValue(value = "RESET_TOKEN", required = false) String resetToken,
            @RequestBody ResetPasswordRequestDTO dto) {

        if (resetToken == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "비밀번호 재설정 토큰이 없습니다.");
        }

        Long userSq;
        try {
            userSq = jwtProvider.validateAndGetUserSq(resetToken, "reset-password");
        } catch (JwtException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "유효하지 않은 토큰입니다.");
        }

        String currentPassword = userService.findCurrentPassword(userSq);

        if (currentPassword != null && passwordEncoder.matches(dto.getNewPassword(), currentPassword)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "기존 비밀번호와 일치합니다.");
        }

        boolean updated = userService.updatePassword(userSq, dto.getNewPassword());

        if (updated) {
            return ApiResponse.of(HttpStatus.OK, "비밀번호 재설정 완료", null);
        } else {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "비밀번호 재설정 실패");
        }
    }

}
