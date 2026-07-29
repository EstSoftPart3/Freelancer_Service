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

    /**
     * 닉네임 사용 가능 여부. output=true 면 사용 가능.
     * 기존 /check-id는 원시 boolean(=중복 여부)을 반환해 의미가 반대이지만, 신규 API는 ApiResponse 래핑 + 사용가능 기준으로 통일한다.
     */
    @GetMapping("/check-nickname")
    public ApiResponse<Boolean> checkUserNickname(@RequestParam(name = "userNickname") String userNickname) {
        try {
            boolean exists = userService.isUserNicknameExists(userNickname);
            return exists
                    ? ApiResponse.of(HttpStatus.OK, "이미 사용 중인 닉네임입니다.", false)
                    : ApiResponse.of(HttpStatus.OK, "사용 가능한 닉네임입니다.", true);
        } catch (IllegalArgumentException e) {
            return ApiResponse.of(HttpStatus.BAD_REQUEST, e.getMessage(), false);
        }
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
