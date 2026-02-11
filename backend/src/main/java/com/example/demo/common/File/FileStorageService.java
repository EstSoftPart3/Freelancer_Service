package com.example.demo.common.File;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final FileCryptoUtil fileCryptoUtil;

    public UploadedFileDTO uploadFile(MultipartFile multipartFile) {
        if (multipartFile == null || multipartFile.isEmpty())
            return null;

        String originalName = multipartFile.getOriginalFilename();
        String savedName = createFileName(originalName);

        try {
            // CasaOS 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // [수정 포인트] 1. 파일의 원본 바이트를 가져옴
            byte[] fileBytes = multipartFile.getBytes();
            String contentType = multipartFile.getContentType();
            // [최적화 추가] 이미지 파일인 경우 압축 진행
            if (contentType != null && contentType.startsWith("image")) {
                if (!contentType.equals("image/svg+xml")) {
                    log.info("비트맵 이미지 최적화 시작: {}", contentType);

                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    // 가로 해상도 최대 1920px로 제한, 화질 80%로 압축
                    try {
                        Thumbnails.of(multipartFile.getInputStream())
                                .size(1920, 1920)
                                .outputQuality(0.8)
                                .outputFormat("jpg")
                                .toOutputStream(outputStream);
                        fileBytes = outputStream.toByteArray();
                        log.info("이미지 최적화 완료: {} -> {} bytes", multipartFile.getSize(), fileBytes.length);
                    } catch (Exception e) {
                        // 압축 도중 에러가 나면 원본 바이트를 그대로 사용 (안전장치)
                        log.warn("이미지 최적화 실패, 원본으로 저장합니다: {}", e.getMessage());
                        fileBytes = multipartFile.getBytes();
                    }

                }
            } else {
                log.info("SVG 파일 감지: 최적화 없이 암호화 단계로 진행합니다.");
            }
            // [수정 포인트] 2. AES 암호화 진행
            byte[] encryptedBytes = fileCryptoUtil.encrypt(fileBytes);

            // [수정 포인트] 3. 암호화된 바이트를 파일로 저장
            Path filePath = uploadPath.resolve(savedName);
            Files.write(filePath, encryptedBytes);

            UploadedFileDTO uploadedFileDTO = new UploadedFileDTO();
            uploadedFileDTO.setOriginalName(originalName);
            uploadedFileDTO.setSavedName(savedName);
            uploadedFileDTO.setContentType(multipartFile.getContentType());
            uploadedFileDTO.setSize((long) encryptedBytes.length); // 암호화 후 사이즈로 저장

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