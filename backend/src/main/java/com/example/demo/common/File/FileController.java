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
            @RequestParam(name = "download", defaultValue = "false") boolean download) { // default -> defaultValue로 수정

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

            // 3. MIME 타입 감지
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

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

            // 5. 업로드 파일은 사용자 입력이므로 우리 오리진 권한으로 실행되면 안 된다.
            //
            //    이 엔드포인트는 download=false 일 때 Content-Disposition: inline 으로 응답한다.
            //    즉 .svg / .html 류를 주소창으로 직접 열면 브라우저가 '문서'로 렌더링하고,
            //    안에 든 <script>가 우리 오리진에서 실행된다. accessToken 쿠키가 httpOnly가 아니라
            //    (lib/api.ts가 document.cookie로 읽는다) 토큰 탈취까지 이어질 수 있다.
            //
            //    CSP sandbox 는 응답을 고유한 opaque 오리진으로 격리해 스크립트 실행과
            //    쿠키/스토리지 접근을 모두 차단한다. <img>로 삽입한 이미지 표시는 영향받지 않는다.
            //    nosniff 는 확장자와 다른 타입으로 추측 렌더링되는 것을 막는다.
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                    .header("Content-Security-Policy", "sandbox")
                    .header("X-Content-Type-Options", "nosniff")
                    .body(resource);

        } catch (Exception e) {
            log.error("파일 처리 중 오류 발생: {}", savedName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}