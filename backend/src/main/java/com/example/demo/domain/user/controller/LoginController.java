package com.example.demo.domain.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.TokenDTO;
import com.example.demo.domain.user.dto.request.LoginRequestDTO;
import com.example.demo.domain.user.dto.response.LoginResponseDTO;
import com.example.demo.domain.user.service.LoginService;
import com.example.demo.domain.user.service.LoginService.LoginResultDTO;
import com.example.demo.domain.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class LoginController {

    private final UserService userService;

        private final LoginService loginService;
        private static final int ACCRESS_TOKEN_EXPIRE = 60 * 60;
        private static final int REFRESH_TOKEN_EXPIRE = 7*24*60*60;

//    LoginController(UserService userService) {
//        this.userService = userService;
//    }
        
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<LoginResponseDTO>> login(
                        @RequestBody LoginRequestDTO request, HttpServletResponse response) {

                LoginResultDTO result = loginService.login(request.getUserId(), request.getUserPw(),
                                request.getUserTypeCd());
                TokenDTO tokens = result.getToken();
                LoginResponseDTO userInfo = result.getUserInfo();
                
                Cookie accressTokenCookie = createCookie("accessToken",tokens.getAccessToken(),ACCRESS_TOKEN_EXPIRE);
                response.addCookie(accressTokenCookie);
                Cookie refreshTokenCookie = createCookie("refreshToken",tokens.getRefreshToken(),REFRESH_TOKEN_EXPIRE);
                response.addCookie(refreshTokenCookie);
                userInfo.setToken(tokens);

                return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "로그인 성공", userInfo));
        }

        @PostMapping("/refresh-token")
        public ResponseEntity<ApiResponse<TokenDTO>> refreshToken(
//        		 @RequestHeader(value = "Authorization", required = false) String authorizationHeader) { 
        		@CookieValue(value = "refreshToken",required = false)String refreshToken, HttpServletResponse response) {
        	
//                if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
//                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                                        .body(ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다."));
        			if(refreshToken == null || refreshToken.isEmpty()) {
        				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        						.body(ApiResponse.error(HttpStatus.UNAUTHORIZED,"유효하지 않은 리프레시 토큰입니다." ));
                }
        			TokenDTO newTokens = loginService.refreshToken(refreshToken);
        			
        			Cookie acccessTokenCookie = createCookie("accessToken",newTokens.getAccessToken(),ACCRESS_TOKEN_EXPIRE);
        			response.addCookie(acccessTokenCookie);
        			if(newTokens.getRefreshToken() !=null) {
        				Cookie refreshTokenCookie = createCookie("refreshToken",newTokens.getRefreshToken(),REFRESH_TOKEN_EXPIRE);
        				response.addCookie(refreshTokenCookie);
        			}
//                String refreshToken = authorizationHeader.substring(7);
//
//                TokenDTO newTokens = loginService.refreshToken(refreshToken);

                return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "토큰 갱신 성공", newTokens));
        }

        @PostMapping("/me")
        public ResponseEntity<ApiResponse<LoginResponseDTO>> getMyInfo(
                        @AuthenticationPrincipal Long userSq) {

                LoginResponseDTO userInfo = loginService.getUserInfoByUserSq(userSq);

                return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "내 정보 조회 성공", userInfo));
        }

        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<Void>> logout(
                        @AuthenticationPrincipal Long userSq) {

                // DB에서 userSq에 해당하는 리프레시 토큰 삭제
                loginService.deleteRefreshTokenByUserSq(userSq);

                return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "로그아웃 성공", null));
        }
        private Cookie createCookie(String name, String value, int maxAge) {
        	Cookie cookie = new Cookie(name, value);
        	cookie.setHttpOnly(true);
        	cookie.setSecure(false);
        	cookie.setPath("/");
        	cookie.setMaxAge(maxAge);
        	cookie.setAttribute("SameStie", "Lax");
        	return cookie;
        }
}
