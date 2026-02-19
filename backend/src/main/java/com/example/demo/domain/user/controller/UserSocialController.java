package com.example.demo.domain.user.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.user.dto.request.SocialSignupRequestDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.service.UserSocialService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Slf4j
public class UserSocialController {

	private final UserSocialService userSocialService;

	// 프론트엔드가 이 API 호출 -> 카카오 로그인 URL 받음
	@GetMapping("/kakao")
	public ResponseEntity<Map<String, String>> getKakaoLoginUrl() {
		Map<String, String> result = userSocialService.getKakaoLoginUrl();
		return ResponseEntity.ok(result);
	}

	// 프론트엔드 콜백 페이지에서 code를 전달받아 처리
	@PostMapping("/kakao/login")
	public ResponseEntity<LoginResponseDTO> kakaoLogin(@RequestBody Map<String, String> request) {
		String code = request.get("code");
		log.info("카카오 로그인 요청, 인증 코드 수신");

		LoginResponseDTO response = userSocialService.kakaoLogin(code);
		return ResponseEntity.ok(response);
	}

	// 소셜 회원가입 완료 (추가정보 입력)
	@PostMapping("/social/signup")
	public ResponseEntity<LoginResponseDTO> completeSocialSignup(@RequestBody SocialSignupRequestDTO request) {
		log.info("소셜 회원가입 추가정보 제출");

		LoginResponseDTO response = userSocialService.completeSocialSignup(request);
		return ResponseEntity.ok(response);
	}
}
