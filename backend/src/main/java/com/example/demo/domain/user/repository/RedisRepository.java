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

    // 인증코드 확인(verifyCode)에 성공했다는 표식. 코드 자체는 1회용이라 확인 즉시 지워지므로,
    // 이후 별도 API 호출(회원가입 완료·비밀번호 재설정 확인)에서 "방금 인증했다"는 사실을
    // 다시 확인할 수 있도록 짧은 시간만 별도로 남겨 둔다.
    public void markVerified(String email) {
        redisTemplate.opsForValue().set("email:verified:" + email, "1", 5, TimeUnit.MINUTES);
    }

    public boolean isVerified(String email) {
        Boolean exists = redisTemplate.hasKey("email:verified:" + email);
        return Boolean.TRUE.equals(exists);
    }

    public void clearVerified(String email) {
        redisTemplate.delete("email:verified:" + email);
    }
}
