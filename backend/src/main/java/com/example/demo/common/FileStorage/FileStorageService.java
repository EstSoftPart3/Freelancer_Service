package com.example.demo.common.FileStorage;

import java.io.File;
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

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * 기존 AmazonS3Service.uploadFile(MultipartFile) 과 동일한 규격
     */
    public UploadedFileDTO uploadFile(MultipartFile multipartFile) {
        if (multipartFile == null || multipartFile.isEmpty())
            return null;

        String originalName = multipartFile.getOriginalFilename();
        String savedName = createFileName(originalName);

        try {
            // 1. CasaOS 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. 물리 파일 저장
            File targetFile = new File(uploadDir, savedName);
            multipartFile.transferTo(targetFile);

            // 3. 기존과 동일하게 UploadedFileDTO 반환
            UploadedFileDTO uploadedFileDTO = new UploadedFileDTO();
            uploadedFileDTO.setOriginalName(originalName);
            uploadedFileDTO.setSavedName(savedName);
            uploadedFileDTO.setContentType(multipartFile.getContentType());
            uploadedFileDTO.setSize(multipartFile.getSize());

            log.info("CasaOS 업로드 성공: {}", savedName);
            return uploadedFileDTO;

        } catch (IOException e) {
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