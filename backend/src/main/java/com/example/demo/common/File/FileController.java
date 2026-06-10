package com.example.demo.common.File;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final FileCryptoUtil fileCryptoUtil;

    /**
     * 파일 보기 및 다운로드 처리
     * 
     * @param savedName UUID로 저장된 파일명
     * @param download  true일 경우 강제 다운로드 헤더 추가
     */
    @GetMapping("/{savedName}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String savedName,
            @RequestParam(name = "download", defaultValue = "false") boolean download) {

        try {
            // 1. 암호화된 파일 읽기
            Path filePath = Paths.get(uploadDir).resolve(savedName);
            if (!Files.exists(filePath)) {
                log.warn("파일을 찾을 수 없습니다: {}", savedName);
                return ResponseEntity.notFound().build();
            }
            byte[] encryptedBytes = Files.readAllBytes(filePath);

            // 2. 복호화
            byte[] decryptedBytes = fileCryptoUtil.decrypt(encryptedBytes);
            ByteArrayResource resource = new ByteArrayResource(decryptedBytes);

            // 3. MIME 타입 (암호화 파일은 probeContentType 부정확 → 확장자 우선)
            String contentType = resolveContentType(savedName);

            // 4. Content-Disposition 설정
            ContentDisposition contentDisposition;
            if (download) {
                // 다운로드 시 원본 파일명을 DB에서 가져오지 못하므로 현재는 savedName을 사용합니다.
                contentDisposition = ContentDisposition.attachment()
                        .filename(savedName, StandardCharsets.UTF_8)
                        .build();
            } else {
                // 브라우저에서 바로 보기 (이미지 등)
                contentDisposition = ContentDisposition.inline().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                    .body(resource);

        } catch (Exception e) {
            log.error("파일 처리 중 오류 발생: {}", savedName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String resolveContentType(String savedName) {
        String lower = savedName.toLowerCase();
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".gif")) {
            return "image/gif";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        if (lower.endsWith(".svg")) {
            return "image/svg+xml";
        }
        return "application/octet-stream";
    }

}