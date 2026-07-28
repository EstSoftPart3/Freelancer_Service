package com.example.demo.common.File;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.common.AmazonS3.UploadedFileDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    // 업로드 허용 확장자 화이트리스트.
    // 기존엔 확장자 검사가 전혀 없어 .jsp/.php/.exe 같은 실행 가능 파일도 그대로 저장됐다(현존 취약점).
    // 블랙리스트가 아니라 화이트리스트여야 신규 위험 확장자에도 자동으로 안전하다.
    // svg는 스크립트를 품을 수 있어(저장형 XSS) 이미지지만 의도적으로 제외한다.
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "bmp",
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "txt", "csv", "hwp", "hwpx", "zip");

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final FileCryptoUtil fileCryptoUtil;

    public UploadedFileDTO uploadFile(MultipartFile multipartFile) {
        if (multipartFile == null || multipartFile.isEmpty())
            return null;

        String originalName = multipartFile.getOriginalFilename();
        validateExtension(originalName);
        String savedName = createFileName(originalName);

        try {
            // CasaOS 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 1. 파일의 원본 바이트를 가져옴
            byte[] fileBytes = multipartFile.getBytes();
            String contentType = multipartFile.getContentType();

            // [최적화] 이미지 파일인 경우 압축 진행
            if (contentType != null && contentType.startsWith("image")) {
                // SVG는 벡터 방식이므로 Thumbnailator 처리 제외
                if (!contentType.equals("image/svg+xml")) {
                    log.info("비트맵 이미지 최적화 시작: {}", contentType);

                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    try {
                        var builder = Thumbnails.of(multipartFile.getInputStream())
                                .size(1920, 1920)
                                .outputQuality(0.8);

                        // [핵심 수정] PNG나 WebP 등 투명도가 중요한 포맷은 jpg로 강제 변환하지 않음
                        if (contentType.equals("image/png") || contentType.equals("image/webp")) {
                            log.info("투명도 유지를 위해 원본 포맷으로 최적화합니다.");
                            builder.toOutputStream(outputStream);
                        } else {
                            // 그 외 일반 이미지는 jpg로 변환하여 용량 최소화
                            builder.outputFormat("jpg").toOutputStream(outputStream);
                        }

                        fileBytes = outputStream.toByteArray();
                        log.info("이미지 최적화 완료: {} -> {} bytes", multipartFile.getSize(), fileBytes.length);
                    } catch (Exception e) {
                        log.warn("이미지 최적화 실패, 원본으로 저장합니다: {}", e.getMessage());
                        fileBytes = multipartFile.getBytes();
                    }
                }
            } else {
                log.info("이미지가 아니거나 SVG 파일임: 최적화 없이 진행합니다.");
            }

            // 2. AES 암호화 진행
            byte[] encryptedBytes = fileCryptoUtil.encrypt(fileBytes);

            // 3. 암호화된 바이트를 파일로 저장
            Path filePath = uploadPath.resolve(savedName);
            Files.write(filePath, encryptedBytes);

            UploadedFileDTO uploadedFileDTO = new UploadedFileDTO();
            uploadedFileDTO.setOriginalName(originalName);
            uploadedFileDTO.setSavedName(savedName);
            uploadedFileDTO.setContentType(multipartFile.getContentType());
            uploadedFileDTO.setSize((long) encryptedBytes.length);

            log.info("CasaOS 업로드 성공: {}", savedName);
            return uploadedFileDTO;

        } catch (Exception e) {
            log.error("파일 저장 실패", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
        }
    }

    public String createFileName(String fileName) {
        return UUID.randomUUID().toString().concat(getFileExtension(fileName));
    }

    private String getFileExtension(String fileName) {
        try {
            return fileName.substring(fileName.lastIndexOf("."));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 형식의 파일입니다.");
        }
    }

    /**
     * 업로드 시점에만 검사한다. copyFile은 이미 검증을 통과해 저장된 UUID 파일명을 다루므로 대상이 아니다.
     */
    private void validateExtension(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일 이름이 없습니다.");
        }
        // 저장 파일명은 UUID + 확장자라 이중 확장자(a.php.png)로 우회되지 않는다 — 마지막 확장자만 보면 충분하다.
        String ext = getFileExtension(originalName).substring(1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            log.warn("허용되지 않는 확장자 업로드 시도: {}", originalName);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "허용되지 않는 파일 형식입니다. (." + ext + ") 이미지·문서·압축 파일만 업로드할 수 있습니다.");
        }
    }

    public String copyFile(String sourceFileName) {
        if (sourceFileName == null)
            return null;

        String newFileName = createFileName(sourceFileName);
        try {
            Path sourcePath = Paths.get(uploadDir).resolve(sourceFileName);
            Path destPath = Paths.get(uploadDir).resolve(newFileName);
            Files.copy(sourcePath, destPath);
            log.info("파일 복사 성공: {} -> {}", sourceFileName, newFileName);
            return newFileName;
        } catch (IOException e) {
            log.error("파일 복사 실패: {}", sourceFileName, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 복사에 실패했습니다.");
        }
    }

    public void deleteFile(String fileName) {
        if (fileName == null)
            return;
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("파일 삭제 실패: {}", fileName);
        }
    }
}