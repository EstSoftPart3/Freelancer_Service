package com.example.demo.domain.user.service;

import java.net.URLEncoder;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.example.demo.domain.user.dto.AddressDTO;
import com.example.demo.domain.user.dto.TokenDTO;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.UserSocialDTO;
import com.example.demo.domain.user.dto.request.SocialSignupRequestDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.repository.RedisRepository;
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
	private final RedisRepository redisRepository;
	private final RestTemplate restTemplate = new RestTemplate();

//	Kakao
    @Value("${kakao.client-id}")
    private String kakaoClientId;

    @Value("${kakao.client-secret}")
    private String kakaoClientSecret;

    @Value("${kakao.redirect-uri}")
    private String kakaoRedirectUri;
    
    @Value("${kakao.token-uri}")
    private String kakaoTokenUri;
    
    @Value("${kakao.user-info-uri}")
    private String kakaoUserInfoUri;
    
//    Naver
    @Value("${naver.client-id}")
    private String naverClientId;
    
    @Value("${naver.client-secret}")
    private String naverClientSecret;
    
    @Value("${naver.redirect-uri}")
    private String naverRedirectUri;
    
    @Value("${naver.token-uri}")
    private String naverTokenUri;
    
    @Value("${naver.user-info-uri}")
    private String naverUserInfoUri;
    
//    Google
    @Value("${google.client-id}")
    private String googleClientId;
    
    @Value("${google.client-secret}")
    private String googleClientSecret;
    
    @Value("${google.redirect-uri}")
    private String googleRedirectUri;
    
    @Value("${google.token-uri}")
    private String googleTokenUri;
    
    @Value("${google.user-info-uri}")
    private String googleUserInfoUri;


	public Map<String, String> getKakaoLoginUrl() {
		String kakaoAuthUrl = "https://kauth.kakao.com/oauth/authorize?" +
		"client_id=" + kakaoClientId +
		"&redirect_uri=" + kakaoRedirectUri +
		"&response_type=code";

		return Map.of("url", kakaoAuthUrl);
	}

	public LoginResponseDTO kakaoLogin(String code) {

		// 1. 카카오에서 액세스 토큰 받기
		String kakaoAccessToken = getKakaoAccessToken(code);
		log.info("카카오 액세스 토큰 획득 성공");

		// 2. 카카오에서 사용자 정보 찾기
		Long kakaoId = getKakaoUserInfo(kakaoAccessToken);
		log.info("카카오 사용자 정보 획득 성공, ID: {}", kakaoId);

		// 3. 소셜 로그인 처리
		return socialLogin(String.valueOf(kakaoId), "KAKAO");
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
	
	
	
	
	public Map<String, String> getNaverLoginUrl() {
		String state = "NAVER_" + UUID.randomUUID();
		redisRepository.saveSocialState(state);

		String naverAuthUrl = "https://nid.naver.com/oauth2.0/authorize?" +
		"client_id=" + naverClientId +
		"&redirect_uri=" + naverRedirectUri +
		"&response_type=code" +
		"&state=" + state;

		return Map.of("url", naverAuthUrl);
	}
	
	public LoginResponseDTO naverLogin(String code, String state) {

		// 1. state 검증 (CSRF 방어)
		if (state == null || !redisRepository.validateAndDeleteSocialState(state)) {
			log.warn("네이버 로그인 state 검증 실패. state: {}", state);
			throw new RuntimeException("유효하지 않은 요청입니다. 다시 로그인해주세요.");
		}

		// 2. 네이버에서 액세스 토큰 받기
		String naverAccessToken = getNaverAccessToken(code, state);
		log.info("네이버 액세스 토큰 획득 성공");

		// 2. 카카오에서 사용자 정보 찾기
		String naverId = getNaverUserInfo(naverAccessToken);
		log.info("네이버 사용자 정보 획득 성공, ID: {}", naverId);

		// 3. 소셜 로그인 처리
		return socialLogin(naverId, "NAVER");
	}
	
	private String getNaverAccessToken(String code, String state) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

			MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
			params.add("grant_type", "authorization_code");
			params.add("client_id", naverClientId);
			params.add("client_secret", naverClientSecret);
			params.add("redirect_uri", naverRedirectUri);
			params.add("code", code);
			params.add("state", state);

			HttpEntity<MultiValueMap<String, String>> request =
					new HttpEntity<>(params, headers);

			ResponseEntity<Map> response = restTemplate.postForEntity(
					naverTokenUri,
					request,
					Map.class
			);

			if(response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				return (String) response.getBody().get("access_token");
			} else {
				log.error("네이버 토큰 요청 실패, 상태: {}, 응답: {}", response.getStatusCode(), response.getBody());
				throw new RuntimeException("네이버 토큰 요청 중 오류 발생");
			}
		} catch(Exception e) {
			log.error("네이버 액세스 토큰 요청 중 예외 발생", e);
			throw new RuntimeException("네이버 토큰 요청 중 오류 발생");
		}
	}
	
	private String getNaverUserInfo(String accessToken) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(accessToken);

			HttpEntity<String> request = new HttpEntity<>(headers);

			ResponseEntity<Map> response = restTemplate.exchange(
					naverUserInfoUri,
					HttpMethod.GET,
					request,
					Map.class
			);

			 if(response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				 
				 Map<String, Object> naverResponse = (Map<String, Object>) response.getBody().get("response");
				 String id = (String) naverResponse.get("id");
	             log.info("네이버 사용자 정보 획득 ID: {}", id);
	             return id;
	         } else {
	             log.error("네이버 사용자 정보 요청 실패, 상태: {}, 응답: {}", response.getStatusCode(), response.getBody());
	             throw new RuntimeException("네이버 사용자 정보 요청 실패");
	         }
		} catch(Exception e) {
			log.error("네이버 사용자 정보 요청 중 예외 발생", e);
			throw new RuntimeException("네이버 사용자 정보 요청 중 오류 발생");
		}
	}
	
	
	/**
	 * 구글 로직 
	  */
	public Map<String, String> getGoogleLoginUrl() {
		String state = "GOOGLE_" + UUID.randomUUID();
		redisRepository.saveSocialState(state);
		
		String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
				"client_id=" + googleClientId +
				"&redirect_uri=" + googleRedirectUri +
				"&response_type=code" + 
				"&scope=openid" +
				"&state=" + state;
		return Map.of("url", googleAuthUrl);
	}
	
	public LoginResponseDTO googleLogin(String code, String state) {
		// 1. state 검증 (CSRF 방어)
		if(state == null || !redisRepository.validateAndDeleteSocialState(state)) {
			log.warn("구글 로그인 state 검증 실패. state: {}", state);
			throw new RuntimeException("유효하지 않은 요청입니다. 다시 로그인해주세요.");
		}
		
		// 2. 구글에서 액세스 토큰 받기
		String googleAccessToken = getGoogleAccessToken(code, state);
		log.info("구글 액세스 토큰 획득 성공");
		
		// 3. 구글에서 사용자 정보 찾기
		String googleId = getGoogleUserInfo(googleAccessToken);
		log.info("구글 사용자 정보 획득 성공, ID: {}", googleId);
		
		// 4. 소셜 로그인 처리
		return socialLogin(googleId, "GOOGLE");
	}
	
	private String getGoogleAccessToken(String code, String state) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
			
			MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
			params.add("grant_type", "authorization_code");
			params.add("client_id", googleClientId);
			params.add("client_secret", googleClientSecret);
			params.add("redirect_uri", googleRedirectUri);
			params.add("code", code);
			params.add("state", state);
			
			HttpEntity<MultiValueMap<String, String>> request =
					new HttpEntity<>(params, headers);
			
			ResponseEntity<Map> response = restTemplate.postForEntity(
					googleTokenUri,
					request,
					Map.class
			);
			
			if(response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				return (String) response.getBody().get("access_token");
			} else {
				log.error("구글 토큰 요청 실패, 상태: {}, 응답: {}", response.getStatusCode(), response.getBody());
				throw new RuntimeException("구글 토큰 요청 중 오류 발생");
			}
		} catch (Exception e) {
			log.error("구글 액세스 토큰 요청 중 예외 발생", e);
			throw new RuntimeException("네이버 토큰 요청 중 오류 발생");
		}
	}
	
	private String getGoogleUserInfo(String accessToken) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(accessToken);
			
			HttpEntity<String> request = new HttpEntity<>(headers);
			
			ResponseEntity<Map> response = restTemplate.exchange(
					googleUserInfoUri,
					HttpMethod.GET,
					request,
					Map.class
			);
			
			if(response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				String id = (String) response.getBody().get("sub");
				log.info("구글 사용자 정보 획득 ID: {}", id);
				return id;
			} else {
				log.error("구글 사용자 정보 요청 실패, 상태:{}, 응답:{}", response.getStatusCode(), response.getBody());
				throw new RuntimeException("구글 사용자 정보 요청 실패");
			}
		} catch(Exception e) {
			log.error("구글 사용자 정보 요청 중 예외 발생", e);
			throw new RuntimeException("구글 사용자 정보 요청 중 오류 발생");
		}
	}

	/**
	 * 소셜 로그인 처리
	 * - 기존 사용자: JWT 토큰 발급 (isNewUser=false)
	 * - 신규 사용자: tempToken 발급 (isNewUser=true, DB INSERT 하지 않음)
	 */
	public LoginResponseDTO socialLogin(String socialId, String providerCd) {

		// 기존 소셜 계정 여부 확인
		UserDTO userDTO = userSocialRepository
				.findUserBySocialIdAndProvider(socialId, providerCd);

		// 신규 유저: tempToken 발급 (DB INSERT 하지 않음)
		if (userDTO == null) {
			String tempToken = jwtProvider.createSocialSignupToken(socialId, providerCd);
			log.info("신규 소셜 사용자, tempToken 발급 완료. socialId: {}, provider: {}", socialId, providerCd);

			return LoginResponseDTO.builder()
					.isNewUser(true)
					.tempToken(tempToken)
					.build();
		}

		// 기존 유저: JWT 토큰 발급
		String accessToken = jwtProvider.createAccessToken(userDTO);
		String refreshToken = jwtProvider.createRefreshToken(userDTO, false);

		return LoginResponseDTO.builder()
				.isNewUser(false)
				.userNm(userDTO.getUserNm())
				.userTypeCd(userDTO.getUserTypeCd())
				.token(new TokenDTO(accessToken, refreshToken))
				.build();
	}

	/**
	 * 소셜 회원가입 완료 (추가정보 입력 후)
	 */
	@Transactional
	public LoginResponseDTO completeSocialSignup(SocialSignupRequestDTO dto) {

		// 1. tempToken 검증 → socialId, providerCd 추출
		Map<String, String> tokenInfo = jwtProvider.validateSocialSignupToken(dto.getTempToken());
		String socialId = tokenInfo.get("socialId");
		String providerCd = tokenInfo.get("providerCd");
		log.info("소셜 회원가입 처리 시작. socialId: {}, provider: {}", socialId, providerCd);

		// 2. 주소 INSERT
		AddressDTO addressDTO = new AddressDTO();
		addressDTO.setZonecode(dto.getZonecode());
		addressDTO.setAddress(dto.getAddress());
		addressDTO.setDetailAddress(dto.getDetailAddress());
		addressDTO.setLatitude(dto.getLatitude());
		addressDTO.setLongitude(dto.getLongitude());

		if (dto.getSigunguCode() != null) {
			String sigungu = userSocialRepository.findSigunguByAreaCode(dto.getSigunguCode());
			addressDTO.setSigungu(sigungu);
			addressDTO.setAreaCodeSq(dto.getSigunguCode());
		}

		userSocialRepository.insertAddress(addressDTO);

		// 3. 사용자 INSERT (실제 정보)
		UserDTO userDTO = new UserDTO();
		userDTO.setAddressSq(addressDTO.getAddressSq());
		userDTO.setUserId("SOCIAL_" + socialId);
		userDTO.setUserEmail(dto.getUserEmail());
		userDTO.setUserNm(dto.getUserNm());
		userDTO.setUserGenderCd(dto.getUserGenderCd());
		userDTO.setUserPhoneNum(dto.getUserPhoneNum());
		userDTO.setUserBirthDt(dto.getUserBirthDt());
		userDTO.setUserTypeCd(dto.getUserTypeCd());
		userDTO.setUserSignupTypeCd(2L); // 소셜 유저
		userSocialRepository.insertUser(userDTO);

		// 4. 소셜 계정 INSERT
		UserSocialDTO socialDTO = UserSocialDTO.builder()
				.userSq(userDTO.getUserSq())
				.socialProviderCd(providerCd)
				.socialId(socialId)
				.socialEmail(dto.getUserEmail())
				.build();
		userSocialRepository.insertUserSocialAccount(socialDTO);

		// 5. JWT 토큰 발급
		String accessToken = jwtProvider.createAccessToken(userDTO);
		String refreshToken = jwtProvider.createRefreshToken(userDTO, false);

		log.info("소셜 회원가입 완료. userSq: {}", userDTO.getUserSq());

		return LoginResponseDTO.builder()
				.isNewUser(false)
				.userNm(userDTO.getUserNm())
				.userTypeCd(userDTO.getUserTypeCd())
				.token(new TokenDTO(accessToken, refreshToken))
				.build();
	}
}
