package com.example.demo.domain.user.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class EmailSender {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void send(String to, String subject, String text) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);
        mailSender.send(message);
    }

    /**
     * 비동기 발송. 호출 스레드는 SMTP 응답을 기다리지 않는다.
     *
     * <p>
     * 예외를 그대로 던지면 {@code @Async} 기본 핸들러가 스택만 찍고 끝나서, 나중에
     * "메일이 안 왔다"는 신고가 들어왔을 때 <b>어느 수신자에게 실패했는지</b>를 알 수 없다.
     * 수신 주소와 제목을 함께 남기고 삼킨다 — 호출부로 전파돼도 받을 사람이 없다(별도 스레드다).
     * </p>
     */
    @Async
    public void sendAsync(String to, String subject, String text) {
        try {
            send(to, subject, text);
            log.info("메일 발송 성공. to={} subject={}", to, subject);
        } catch (Exception e) {
            log.error("메일 발송 실패. to={} subject={}", to, subject, e);
        }
    }
}