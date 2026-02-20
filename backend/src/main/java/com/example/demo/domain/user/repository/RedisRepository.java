package com.example.demo.domain.user.repository;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RedisRepository {
    
    @Autowired
    private StringRedisTemplate redisTemplate;

    public void saveVerificationCode(String email, String code) {
        redisTemplate.opsForValue().set("email:" + email, code, 3, TimeUnit.MINUTES);
    }

    public String getVerificationCode(String email) {
        return redisTemplate.opsForValue().get("email:" + email);
    }

    public void deleteCode(String email) {
        redisTemplate.delete("email:" + email);
    }

    public void saveSocialState(String state) {
        redisTemplate.opsForValue().set("social:state:" + state, "valid", 5, TimeUnit.MINUTES);
    }

    public boolean validateAndDeleteSocialState(String state) {
        String key = "social:state:" + state;
        String value = redisTemplate.opsForValue().get(key);
        if (!"valid".equals(value)) {
            return false;
        }
        redisTemplate.delete(key);
        return true;
    }
}
