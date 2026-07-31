package com.example.demo.domain.community.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.demo.domain.user.util.EmailSender;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 고객의 소리가 등록되면 운영자에게 메일로 알린다.
 *
 * <p>
 * VOC 는 이용자가 운영자에게 보내는 1:1 창구라 <b>운영자가 BO 를 열어보기 전까지 아무도 모른다</b>.
 * 인앱 알림은 문의자에게 답변이 갈 때만 쓰이므로, 접수 사실은 메일로 밀어 준다.
 * </p>
 *
 * <p>
 * <b>메일에 문의 본문을 넣지 않는다.</b> 비공개 문의에는 급여·계약·분쟁 같은 내용이 담기는데,
 * 본문을 실어 보내면 그 사본이 외부 메일함에 영구히 쌓인다(전달·검색·유출 경로가 그만큼 늘어난다).
 * 제목·작성자·접수 시각과 BO 바로가기 링크까지만 보내고, 내용은 권한이 확인되는 BO 에서 보게 한다.
 * </p>
 *
 * <p>
 * 발송은 {@link EmailSender#sendAsync}(별도 스레드)라 SMTP 지연·실패가 등록 트랜잭션을 잡지 않는다.
 * 그래도 호출 자체를 try-catch 로 감싼다 — 메일 때문에 <b>사용자의 글 등록이 실패하는 일은 없어야 한다</b>.
 * </p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VocMailNotifier {

    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final EmailSender emailSender;

    /**
     * 수신 주소. 기본값은 SMTP 발신 계정 자신이다 — 별도 운영 메일함을 만들지 않아도 바로 받아 볼 수 있다.
     * 담당자 주소로 바꾸려면 {@code application.yml} 에 {@code app.voc.notify-email} 만 추가하면 된다.
     */
    @Value("${app.voc.notify-email:${spring.mail.username}}")
    private String notifyEmail;

    /** BO 주소. 메일의 바로가기 링크에 쓴다. 운영 배포 시 {@code app.bo.base-url} 로 덮어쓸 것. */
    @Value("${app.bo.base-url:http://localhost:5173}")
    private String boBaseUrl;

    public void notifyCreated(Long boardSq, String title, String writerNickname, boolean secret) {
        if (notifyEmail == null || notifyEmail.isBlank()) {
            log.warn("고객의 소리 알림 메일 수신 주소가 비어 있어 발송을 건너뜁니다. boardSq={}", boardSq);
            return;
        }

        String subject = "[고객의 소리] 새 문의가 접수되었습니다" + (secret ? " (비공개)" : "");
        // ?view={sq} — BO 목록이 이 파라미터를 보고 해당 문의의 상세 패널을 바로 연다.
        // 목록까지만 보내면 운영자가 방금 접수된 글을 다시 찾아야 한다.
        String link = boBaseUrl + "/contents/voc?view=" + boardSq;

        String body = "<h3>새 문의가 접수되었습니다</h3>"
                + "<table cellpadding=\"6\" style=\"border-collapse:collapse\">"
                + row("제목", escape(title))
                + row("작성자", escape(writerNickname))
                + row("공개 범위", secret ? "비공개 (작성자·운영자만 열람)" : "공개")
                + row("접수 시각", LocalDateTime.now().format(STAMP))
                + "</table>"
                + "<p style=\"margin-top:16px\">"
                + "<a href=\"" + link + "\">관리자 페이지에서 확인하기</a>"
                + "</p>"
                + "<p style=\"color:#888;font-size:12px\">"
                + "문의 내용은 메일에 담지 않습니다. 관리자 페이지에서 확인해주세요."
                + "</p>";

        try {
            emailSender.sendAsync(notifyEmail, subject, body);
            // 발송 자체는 다른 스레드에서 끝난다. "메일이 안 왔다"는 신고가 들어왔을 때
            // 발송을 시도조차 안 한 것인지 SMTP 에서 막힌 것인지 가르려면 이 줄이 필요하다.
            log.info("고객의 소리 알림 메일 발송 요청. boardSq={} to={} secret={}", boardSq, notifyEmail, secret);
        } catch (Exception e) {
            // 여기서 예외가 새면 사용자에게는 "등록 실패"로 보인다. 글은 이미 저장됐으므로 삼킨다.
            log.error("고객의 소리 알림 메일 발송 실패. boardSq={}", boardSq, e);
        }
    }

    private String row(String label, String value) {
        return "<tr><th align=\"left\" style=\"color:#666;font-weight:normal\">" + label
                + "</th><td>" + value + "</td></tr>";
    }

    /** 제목·닉네임이 그대로 HTML 본문에 들어가므로 태그를 무력화한다. */
    private String escape(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
