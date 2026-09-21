package com.example.demo;

import java.util.TimeZone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.wavefront.WavefrontProperties.Application;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class DemoApplication {
	
	@PostConstruct
    public void started() {
        // JVM 기본 타임존을 한국 시간(KST)으로 설정
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }
	

	private static final Logger logger = LoggerFactory.getLogger(Application.class);

	public static void main(String[] args) {
		logger.debug(">>> 애플리케이션 시작됨");
		SpringApplication.run(DemoApplication.class, args);
	}

}
