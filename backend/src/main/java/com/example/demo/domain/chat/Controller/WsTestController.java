package com.example.demo.domain.chat.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WsTestController {

	@GetMapping("/ws-test")
	public String wsTest() {
		System.out.println("[WS TEST] reached");
		return "ok";
	}
}