package com.example.demo.domain.user.service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.domain.user.dto.UserDTO;
import com.example.demo.domain.user.repository.RedisRepository;
import com.example.demo.domain.user.repository.UserRepository;
import com.example.demo.domain.user.util.EmailSender;

import jakarta.mail.MessagingException;

@Service
public class EmailVerificationService {

    @Autowired
    private RedisRepository redisRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailSender emailSender;

    // 배포용
    // public void sendVerificationCode(String email) throws MessagingException {
    // String code = generateCode();
    // redisRepository.saveVerificationCode(email, code);

    // String subject = "이메일 인증 코드입니다.";
    // String body = "<h3>이메일 인증 코드</h3><p>아래 코드를 입력해 주세요.</p><h2>" + code +
    // "</h2>";
    // emailSender.send(email, subject, body);
    // }

    // 테스트용
    public String sendVerificationCode(String email) throws MessagingException {
        UserDTO existingUser = userRepository.findByEmail(email);
        if (existingUser != null) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        String code = generateCode();
        redisRepository.saveVerificationCode(email, code);

        String subject = "이메일 인증 코드입니다.";
        String body = "<h3>이메일 인증 코드</h3><p>아래 코드를 입력해 주세요.</p><h2>" + code + "</h2>";
        emailSender.send(email, subject, body);

        return code; // <- 테스트용
    }

    // 비밀번호찾기용
    public String findBysendVerificationCode(String email) throws MessagingException {
        UserDTO existingUser = userRepository.findByEmail(email);
        if (existingUser == null) {
            throw new IllegalArgumentException("존재하지 않은 사용자입니다.");
        }
        String code = generateCode();
        redisRepository.saveVerificationCode(email, code);

        String subject = "이메일 인증 코드입니다.";
        String body = "<h3>이메일 인증 코드</h3><p>아래 코드를 입력해 주세요.</p><h2>" + code + "</h2>";
        emailSender.send(email, subject, body);

        return code; // <- 테스트용
    }

    public boolean verifyCode(String email, String code) {
        System.out.println("code" + code);
        String storedCode = redisRepository.getVerificationCode(email);
        System.out.println("stordeCode:" + storedCode);
        boolean success = storedCode != null && storedCode.equals(code);
        System.out.println("success" + success);
        if (success)
            redisRepository.deleteCode(email); // 일회성 인증
        return success;
    }

    private String generateCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6자리 숫자
        return String.valueOf(code);
    }
}
