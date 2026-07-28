package com.example.demo.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@Slf4j // 1. 로깅을 위한 Lombok 어노테이션 추가 (Lombok을 안 쓴다면 하단 참고)
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 첨부 용량 초과. 이 핸들러가 없으면 아래 handleGeneralException이 잡아 500 + 영문 스택 메시지가 나간다.
     * 한도는 application.yml의 spring.servlet.multipart 설정을 따른다(현재 개별 5MB / 요청 합계 20MB).
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<?>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        log.warn("업로드 용량 초과: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error(HttpStatus.PAYLOAD_TOO_LARGE,
                        "첨부파일 용량이 너무 큽니다. 파일당 5MB, 전체 20MB까지 업로드할 수 있습니다."));
    }

    /**
     * 서비스 계층이 의도적으로 던진 상태코드를 그대로 살린다.
     * 이 핸들러가 없으면 handleGeneralException(Exception)이 먼저 잡아
     * 400 의도(예: 허용되지 않는 확장자)가 전부 500으로 바뀐다.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<?>> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatusCode status = ex.getStatusCode();
        String message = ex.getReason() != null ? ex.getReason() : "요청을 처리할 수 없습니다.";
        if (status.is5xxServerError()) {
            log.error("ResponseStatusException({}): ", status, ex);
        } else {
            log.warn("ResponseStatusException({}): {}", status, message);
        }
        return ResponseEntity.status(status)
                .body(ApiResponse.error(HttpStatus.valueOf(status.value()), message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("IllegalArgumentException 발생: ", ex); // 2. 에러 객체(ex)를 로그로 출력
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ApiResponse<?>> handleNullPointerException(NullPointerException ex) {
        log.error("NullPointerException 발생: ", ex); // 2. 에러 객체(ex)를 로그로 출력
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneralException(Exception ex) {
        log.error("Exception 발생 (500): ", ex); // 2. 에러 객체(ex)를 로그로 출력
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()));
    }
}