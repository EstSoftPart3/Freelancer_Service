package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 1. CORS 설정 (로그인 관련 에러 방지)
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8504") // 로컬 개발 포트 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true); // 쿠키/토큰 전송 허용
    }

    // 2. 뷰 컨트롤러 설정 (메인 페이지 및 새로고침 에러 방지)
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // "/api/"로 접속하면 바로 index.html을 보여주도록 명시 (Welcome Page)
        registry.addViewController("/").setViewName("forward:/index.html");
        
        // 사용자가 상세 페이지 주소를 직접 치고 들어올 때(새로고침 포함) 404 방지
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
    }
}