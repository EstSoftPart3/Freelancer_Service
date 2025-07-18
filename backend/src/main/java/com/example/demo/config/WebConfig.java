package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 스프링 서버 전역적으로 CORS 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8504", "http://localhost:3000") // 허용할 출처 , vue,react
                .allowedOrigins("https://31f05472343a.ngrok-free.app", "https://test-paulbaeks-projects.vercel.app/") // ngrok,vercel
                .allowedMethods("OPTIONS", "GET", "POST", "PUT", "DELETE", "PATCH") // 모든 HTTP method 허용
                .allowedHeaders("*") // 모든 헤더 허용 (생략하면 기본 헤더만 허용됨)
                .allowCredentials(true) // 쿠키 인증 요청 허용
                .maxAge(3000); // pre-flight 캐시 시간 (초 단위)
    }
}
