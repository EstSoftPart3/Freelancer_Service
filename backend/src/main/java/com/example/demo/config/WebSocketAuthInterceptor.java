package com.example.demo.config;


import java.security.Principal;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import com.example.demo.domain.user.util.JwtProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor{
	private final JwtProvider jwtProvider;
	
	@Override
	public Message<?> preSend(
			Message<?> message,
			MessageChannel channel
			){
		
		StompHeaderAccessor accessor =
	            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

	    if (accessor == null) {
	        return message;
	    }

	    if (StompCommand.CONNECT.equals(accessor.getCommand())) {

	        log.info("WebSocket CONNECT 요청");

	        String authorization = accessor.getFirstNativeHeader("Authorization");

	        if (authorization == null || !authorization.startsWith("Bearer ")) {
	            throw new IllegalArgumentException("토큰이 없음");
	        }

	        String token = authorization.substring(7);

	        if (!jwtProvider.validateToken(token)) {
	            throw new IllegalArgumentException("유효하지 않은 토큰");
	        }

	        Long userSq = jwtProvider.getUserSqFromToken(token);

	        Principal principal = () -> String.valueOf(userSq);

	        accessor.setUser(principal);

	  
	    }

	    return message;
	}
	

}
