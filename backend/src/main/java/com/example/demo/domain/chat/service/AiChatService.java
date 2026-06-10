package com.example.demo.domain.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiChatService {
	
	private final WebClient webClient;
	
	@Value("${webhook.ai-url}")
	private String url;
	
	public String aiAsk(String query) {
		try {
			String answer =
					webClient
					.get()
					.uri(url + "/chat/ask?query={query}", query)
					.retrieve()
					.bodyToMono(JsonNode.class)
					.map(json -> json.get("answer").asText())
					.block();
			
			if (answer == null || answer.isBlank()) {
				return "AI 응답을 가져오지 못했습니다.";
			}
			
			
			return answer;
			
		}catch(Exception e) {
			return "현재 AI 상담 서버 연결이 원활하지 않습니다. 잠시 후 다시 시도하거나 상담사 연결을 이용해주세요";
			
		}
		
	}
	
}
