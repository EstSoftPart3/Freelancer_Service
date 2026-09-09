package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// 스프링 서버 전역적으로 CORS 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // CasaOS 로컬 폴더에 저장된 파일을 브라우저에서 URL로 호출할 수 있도록 연결해주는 설정
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                // file:/// 를 명시하고, 경로 끝에 반드시 /를 붙여주세요.
                .addResourceLocations("file:///" + uploadDir + "/")
                .setCachePeriod(0); // 개발 중엔 캐시를 꺼야 사진 바꾼 게 바로 보입니다.
    }
}
