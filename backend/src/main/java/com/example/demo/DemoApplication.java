package com.example.demo;

import java.util.TimeZone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.wavefront.WavefrontProperties.Application;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class DemoApplication {

	private static final Logger logger = LoggerFactory.getLogger(Application.class);

	public static void main(String[] args) {
		// JVM 기본 타임존이 배포 환경(예: UTC 컨테이너)에 따라 달라지면 LocalDateTime.now() 저장 시각이
		// 어긋나므로, 실행 환경과 무관하게 항상 KST로 고정한다.
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
		logger.debug(">>> 애플리케이션 시작됨");
		SpringApplication.run(DemoApplication.class, args);
	}

}
