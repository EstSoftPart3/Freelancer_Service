package com.example.demo.domain.auth.service;

import com.example.demo.domain.auth.dto.request.GoogleLoginRequestDTO;
import com.example.demo.domain.auth.dto.response.GoogleLoginResponseDTO;
import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.mapper.UserMapper;
import com.example.demo.domain.user.repository.UserRepository;
import com.example.demo.domain.user.util.JwtProvider;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final JwtProvider jwtProvider;
    private final WebClient webClient = WebClient.create();
    
    // Access Token 만료 시간 설정 (예: 2시간 = 2 * 60 * 60 * 1000ms)
    private static final long ACCESS_TOKEN_EXPIRATION_TIME = 1000L * 60 * 60 * 2;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;
    
    @Transactional
    public UserDTO googleLogin(GoogleLoginRequestDTO request) {
        // 1. auth_code로 구글 사용자 정보 가져오기
        Map<String, Object> googleUserInfo = getGoogleUserInfo(request.getAuthCode(), request.getRedirectUri());

        String email = (String) googleUserInfo.get("email");
        String name = (String) googleUserInfo.get("name");

        // 2. 신규 가입 여부 확인 및 DTO 생성/조회
        boolean isNewUser = !userMapper.existsByUserEmail(email);
        UserDTO userDto;

        if (isNewUser) {
            userDto = new UserDTO();
            userDto.setUserEmail(email);
            userDto.setUserNm(name);
            userDto.setUserIsDeletedYn("N");
            
            // DB에 DTO 직접 저장
            userMapper.save(userDto); 
        } else {
            userDto = userMapper.findByUserEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        }

        // 3. JWT Access Token 발급 및 DTO에 세팅
        String accessToken = jwtProvider.createToken(
                userDto.getUserSq(), 
                userDto.getUserTypeCd(), 
                ACCESS_TOKEN_EXPIRATION_TIME
        );

        // 4. API 명세서 응답값 규격 적용
        userDto.setAccessToken(accessToken);
        userDto.setIsNewUserYn(isNewUser ? "Y" : "N");

        return userDto;
    }

    @SuppressWarnings("unchecked")
	private Map<String, Object> getGoogleUserInfo(String authCode, String redirectUri) {
        Map tokenResponse = webClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue("code=" + authCode +
                        "&client_id=" + clientId +
                        "&client_secret=" + clientSecret +
                        "&redirect_uri=" + redirectUri +
                        "&grant_type=authorization_code")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        String googleAccessToken = (String) tokenResponse.get("access_token");

        return webClient.get()
                .uri("https://www.googleapis.com/oauth2/v2/userinfo")
                .headers(headers -> headers.setBearerAuth(googleAccessToken))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
    
}
