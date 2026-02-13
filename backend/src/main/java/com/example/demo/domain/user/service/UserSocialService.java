package com.example.demo.domain.user.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.example.demo.domain.user.dto.TokenDTO;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.UserSocialDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.mapper.UserSocialMapper;
import com.example.demo.domain.user.repository.UserRepository;
import com.example.demo.domain.user.repository.UserSocialRepository;
import com.example.demo.domain.user.util.JwtProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSocialService {
	
	private final UserSocialRepository userSocialRepository;
	private final JwtProvider jwtProvider;
	private final RestTemplate restTemplate = new RestTemplate();
	
    @Value("${kakao.client-id}")
    private String kakaoClientId;

    @Value("${kakao.client-secret}")
    private String kakaoClientSecret;
    
    @Value("${kakao.redirect-uri}")
    private String kakaoRedirectUri;
	
	
	public Map<String, String> getKakaoLoginUrl() {
		String kakaoAuthUrl = "https://kauth.kakao.com/oauth/authorize?" + 
		"client_id=" + kakaoClientId + 
		"&redirect_uri=" + kakaoRedirectUri + 
		"&response_type=code";
		
		return Map.of("url", kakaoAuthUrl);
	}
	
	
	public LoginResponseDTO kakaoLogin(String code) {
		
//		1. 카카오에서 액세스 코드 받기
		String kakaoAccessToken = getKakaoAccessToken(code);
		log.info("액세스 코드 받기 성공");
		
//		2. 카카오에서 사용자 정보 찾기
		Long kakaoId = getKakaoUserInfo(kakaoAccessToken);
		log.info("사용자 정보 찾기 성공");
		
//		3. 카카오 아이디로 우리 서비스 로그인 처리
		return socialLogin(
				String.valueOf(kakaoId),
				"KAKAO"
		);
	}
	
	private String getKakaoAccessToken(String code) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
			
			MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
			params.add("grant_type", "authorization_code");
			params.add("client_id", kakaoClientId);
			params.add("client_secret", kakaoClientSecret);
			params.add("redirect_uri", kakaoRedirectUri);
			params.add("code", code);
			
			HttpEntity<MultiValueMap<String, String>> request = 
					new HttpEntity<>(params, headers);
			
			ResponseEntity<Map> response = restTemplate.postForEntity(
					"https://kauth.kakao.com/oauth/token",
					request,
					Map.class
			);
			
			if(response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				return (String) response.getBody().get("access_token");
			} else {
				log.error("카카오 토큰 요청 실패, 상태: {}, 응답: {}", response.getStatusCode(), response.getBody());
				throw new RuntimeException("카카오 토큰 요청 중 오류 발생");
			}
		} catch(Exception e) {
			log.error("카카오 액세스 토큰 요청 중 예외 발생", e);
			throw new RuntimeException("카카오 토큰 요청 중 오류 발생");
		}
	}
	
	private Long getKakaoUserInfo(String accessToken) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(accessToken);
			
			HttpEntity<String> request = new HttpEntity<>(headers);
			
			ResponseEntity<Map> response = restTemplate.exchange(
					"https://kapi.kakao.com/v2/user/me",
					HttpMethod.GET,
					request,
					Map.class
			);
			
			 if(response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				 Number id = (Number) response.getBody().get("id");
	             log.info("카카오 사용자 정보 획득 ID: {}", id);
	             return id.longValue();
	         } else {
	             log.error("카카오 사용자 정보 요청 실패, 상태: {}, 응답: {}", response.getStatusCode(), response.getBody());
	             throw new RuntimeException("카카오 사용자 정보 요청 실패");
	         }
		} catch(Exception e) {
			log.error("카카오 사용자 정보 요청 중 예외 발생", e);
			throw new RuntimeException("카카오 사용자 정보 요청 중 오류 발생");
		}
	}
	
	public LoginResponseDTO socialLogin(String socialId, String providerCd) {
		
//		기존 소셜 계정 여부 확인
		UserDTO userDTO = userSocialRepository
				.findUserBySocialIdAndProvider(socialId, providerCd);
		
//		신규 유저면 INSERT
		if (userDTO == null) {
			userDTO = new UserDTO();
			
			//기본값으로 채워주는 값
			userDTO.setUserEmail("user@example.com");
			userDTO.setUserNm("홍길동");
			userDTO.setUserId("SOCIAL_" + socialId);
			userDTO.setUserPhoneNum("000-0000-0000");
			userDTO.setUserTypeCd(1L);					//일반 유저
			userDTO.setUserSignupTypeCd(2L);			//소셜 유저
			userSocialRepository.insertUser(userDTO);
			// insertUser 후 userSq가 자동으로 세팅됨 (useGeneratedKeys)

			// user_social_account 테이블 INSERT
			UserSocialDTO socialDTO = new UserSocialDTO();
			socialDTO.setUserSq(userDTO.getUserSq());
			socialDTO.setSocialProviderCd(providerCd);
			socialDTO.setSocialId(socialId);
			socialDTO.setSocialEmail("user@example.com");
			userSocialRepository.insertUserSocialAccount(socialDTO);
		}
		
//		토큰 발급 (기존 로직 그대로)
		String accessToken = jwtProvider.createAccessToken(userDTO);
		String refreshToken = jwtProvider.createRefreshToken(userDTO, false);
		
		return LoginResponseDTO.builder()
				.userNm(userDTO.getUserNm())
				.userTypeCd(userDTO.getUserTypeCd())
				.token(new TokenDTO(accessToken, refreshToken))
				.build();
	}
}
