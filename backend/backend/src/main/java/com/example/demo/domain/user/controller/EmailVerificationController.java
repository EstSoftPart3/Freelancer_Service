package com.example.demo.domain.user.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.user.service.EmailVerificationService;
import com.example.demo.common.ApiResponse; // ApiResponse 경로는 프로젝트에 맞게 조정

import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/email")
public class EmailVerificationController {

    @Autowired
    private EmailVerificationService verificationService;

    // 1. 이메일 인증 코드 전송
    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendCode(@RequestBody Map<String, String> request) {
        Map<String, String> data = new HashMap<>();
        try {
            String email = request.get("email");
            String code = verificationService.sendVerificationCode(email);
            data.put("code", code); // 테스트용 코드 포함

            return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인증 코드가 이메일로 발송되었습니다.", data));
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "이메일 발송에 실패했습니다: " + e.getMessage(), null));
        }
    }

    @PostMapping("/find/send-code")
    public ResponseEntity<ApiResponse<Map<String, String>>> findBysendCode(@RequestBody Map<String, String> request) {
        Map<String, String> data = new HashMap<>();
        try {
            String email = request.get("email");
            String code = verificationService.findBysendVerificationCode(email);
            data.put("code", code); // 테스트용 코드 포함

            return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인증 코드가 이메일로 발송되었습니다.", data));
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "이메일 발송에 실패했습니다: " + e.getMessage(), null));
        }
    }

    // 2. 인증 코드 검증
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<Boolean>> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        boolean result = verificationService.verifyCode(email, code);

        if (result) {
            return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "인증 성공", true));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.of(HttpStatus.BAD_REQUEST, "인증 실패", false));
        }
    }

}
