package com.example.demo.domain.user.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.dto.TokenDTO;
import com.example.demo.domain.user.service.UserService;
import com.example.demo.domain.user.service.LoginService;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/login/oauth2/code")
public class GoogleLoginController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private LoginService loginService;

    // [수정] 배포 환경 대응: 환경 변수가 있으면 쓰고, 없으면 로컬(8504) 사용
    // yml을 수정하지 않아도 작동하며, 배포 시 코드 수정 없이 주소 변경 가능
    @Value("${FRONTEND_URL:http://localhost:8504}")
    private String frontendUrl;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @GetMapping("/google")
    public void googleCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request, 
            HttpServletResponse response) {


        // 2. 예외 처리: 사용자가 구글 인증창에서 '취소'를 눌렀을 경우
        if (code == null || error != null) {
            try {
                response.sendRedirect(frontendUrl + "/login");
            } catch (IOException e) {
                e.printStackTrace();
            }
            return;
        }

        // 3. 소셜 로그인 핵심 로직 시작
        try {
            // [3-1] 구글에 보낼 리다이렉트 URI 동적 생성
            // request.getRequestURL()은 프로토콜+도메인+경로를 모두 포함하므로 가장 정확함
            String dynamicRedirectUri = request.getRequestURL().toString();
            
            // [3-2] 인가 코드를 구글 Access Token으로 교환
            String accessToken = getAccessToken(code, dynamicRedirectUri);
            
            // [3-3] 획득한 토큰으로 구글 사용자 정보 가져오기
            Map<String, Object> userInfo = getUserInfo(accessToken);
            
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            
            // [안전 장치 추가] ID가 null일 경우 문자열 "null"이 되는 문제 방지
            String googleId = Optional.ofNullable(userInfo.get("id"))
                                      .map(String::valueOf)
                                      .orElse(null);

            if (googleId == null) {
                throw new RuntimeException("Google User ID not found");
            }
            
            // [3-4] DB 조회를 통한 회원 상태 판별 로직 (기존 유지)
            String status;
            String userNm = name;
            String userId = "";

            // 1순위: 신규 컬럼인 socialId(googleId)로 기가입 유저인지 확인
            UserDTO userBySocial = userService.findBySocialId(googleId);

            if (userBySocial != null) {
                // 케이스 A: 이미 이 구글 계정으로 가입 혹은 연동이 완료된 회원
                status = "SUCCESS";
                userNm = userBySocial.getUserNm();
                userId = userBySocial.getUserId();
                
                LoginService.LoginResultDTO result = loginService.loginSocial(userBySocial);
                TokenDTO tokens = result.getToken();
                
                response.addCookie(createCookie("accessToken", tokens.getAccessToken(), 60 * 60));
                response.addCookie(createCookie("refreshToken", tokens.getRefreshToken(), 7 * 24 * 60 * 60));
                
            } else {
                // 2순위: socialId는 없지만, 동일한 이메일을 사용하는 기존 계정이 있는지 확인
                UserDTO userByEmail = userService.findByEmail(email);
                
                if (userByEmail != null) {
                    // 케이스 B: 일반 계정은 있으나 아직 구글 연동이 안 된 상태 (통합 대상)
                    status = "INTEGRATION";
                    userNm = userByEmail.getUserNm();
                    userId = userByEmail.getUserId();
                } else {
                    // 케이스 C: 소셜 정보도 없고 이메일도 없는 완전한 신규 방문자
                    status = "NEW";
                }
            }

            // [3-5] 프론트엔드로 리다이렉트 (쿼리 스트링에 상태값 포함)
            String encodedName = URLEncoder.encode(userNm, StandardCharsets.UTF_8);
            String redirectUrl = String.format(
                "%s/login?status=%s&email=%s&userNm=%s&socialId=%s&userId=%s", 
                frontendUrl, status, email, encodedName, googleId, userId
            );
            
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            try {
                response.sendRedirect(frontendUrl + "/login?error=true");
            } catch (IOException ex) { ex.printStackTrace(); }
        }
    }
    
    // LoginController와 같음 (기존 유지)
    private Cookie createCookie(String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // 로컬 테스트 위해 false 유지 (배포 시 true 권장)
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }

    private String getAccessToken(String code, String redirectUri) {
        RestTemplate restTemplate = new RestTemplate();
        String tokenUrl = "https://oauth2.googleapis.com/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

        return (String) response.getBody().get("access_token");
    }

    private Map<String, Object> getUserInfo(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, Map.class);

        return response.getBody();
    }
}