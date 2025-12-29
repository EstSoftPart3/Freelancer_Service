package com.example.demo.domain.notification.sse;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class SseEmitterManager {

    private static final long TIMEOUT = 60L * 60L * 1000L; // 1시간
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    
    public SseEmitter createEmitter(Long userSq) {

        
        removeEmitter(userSq);

        SseEmitter emitter = new SseEmitter(TIMEOUT);
        emitters.put(userSq, emitter);

        emitter.onCompletion(() -> removeEmitter(userSq));
        emitter.onTimeout(() -> removeEmitter(userSq));
        emitter.onError(e -> removeEmitter(userSq));

        // 연결 성공 확인용 PING
        try {
            emitter.send(SseEmitter.event()
                .name("PING")
                .data("connected"));
        } catch (IOException e) {
            removeEmitter(userSq);
        }

        return emitter;
    }

  
    public void send(Long userSq, String eventName, Object data) {
        SseEmitter emitter = emitters.get(userSq);
        if (emitter == null) return;

        try {
            emitter.send(SseEmitter.event()
                .name(eventName)
                .data(data));
        } catch (IOException e) {
            removeEmitter(userSq);
        }
    }

    private void removeEmitter(Long userSq) {
        SseEmitter emitter = emitters.remove(userSq);
        if (emitter != null) {
            try { emitter.complete(); } catch (Exception ignored) {}
        }
    }
}
