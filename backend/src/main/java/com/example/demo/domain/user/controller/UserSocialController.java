package com.example.demo.domain.user.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.user.dto.KakaoUserInfoDTO;
import com.example.demo.domain.user.dto.response.KakaoTokenResponseDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.service.UserService;
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
	
	@GetMapping("/kakao/callback")
	public ResponseEntity<LoginResponseDTO> kakaoLogin(@RequestParam String code){
		
		log.info("발급된 코드 보기 : {}", code);
		LoginResponseDTO response = userSocialService.kakaoLogin(code);
		
		return ResponseEntity.ok(response);
	}
}
