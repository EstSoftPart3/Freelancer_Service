package com.example.demo;

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
		logger.debug(">>> 애플리케이션 시작됨");
		SpringApplication.run(DemoApplication.class, args);
		System.out.println("JSON Swagger : http://localhost:8080/api/v3/api-docs");
		System.out.println("HTML Swagger : http://localhost:8080/api/swagger-ui/index.html");
	}

}
