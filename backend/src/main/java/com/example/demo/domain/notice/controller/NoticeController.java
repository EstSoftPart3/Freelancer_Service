package com.example.demo.domain.notice.controller;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import javax.lang.model.type.NullType;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.File.FileCryptoUtil;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.entity.BoardAttachment;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.service.BoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final BoardService boardService;
    private final BoardMapper boardMapper;
    private final FileCryptoUtil fileCryptoUtil;

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * 전체 공지사항 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<BoardListResponse>> getAllNotices(
            @RequestParam(value = "searchType", required = false) String searchType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "normalTags", required = false) List<String> normalTags,
            @RequestParam(value = "skillTags", required = false) List<Long> skillTags,
            @RequestParam(value = "sortType", defaultValue = "latest") String sortType,
            @RequestParam(value = "page", defaultValue = "1") Long page,
            @RequestParam(value = "size", defaultValue = "10") Long size) {

        // 공지사항 타입 코드인 1403L을 고정하여 호출합니다.
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "공지사항 조회 성공",
                boardService.getAllBoards(1403L, null, searchType, keyword, tag, normalTags, skillTags, sortType, page, size)));
    }

    /**
     * 공지사항 상세 조회
     */
    @GetMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<BoardResponse>> getNotice(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq) {

        // 1403L 코드를 사용하여 상세 내용을 조회합니다.
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "공지사항 상세 조회 성공",
                boardService.getBoard(userSq, boardSq, 1403L)));
    }

    /**
     * 공지사항 조회수 증가
     */
    @PatchMapping("/{boardSq}/increment-view")
    public ResponseEntity<ApiResponse<NullType>> addViewCntNotice(@PathVariable("boardSq") Long boardSq) {
        boardService.addViewCntBoard(boardSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가 완료", null));
    }

    /**
     * 공지사항 추천 클릭
     */
    @PostMapping("/{boardSq}/recommend")
    public ResponseEntity<ApiResponse<NullType>> updateRecommendNotice(
            @AuthenticationPrincipal Long userSq,
            @PathVariable("boardSq") Long boardSq) {
        boardService.updateBoardRecommend(userSq, boardSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "추천 반영 완료", null));
    }

    /**
     * 공지사항 첨부파일 다운로드 (복호화 포함)
     */
    @GetMapping("/download/{fileSq}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("fileSq") Long fileSq) {

        BoardAttachment attachment = boardMapper.findFile(fileSq);

        if (attachment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일 정보가 존재하지 않습니다.");
        }

        try {
            Path filePath = Paths.get(uploadDir).resolve(attachment.getFileSaveNm()).normalize();
            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "실제 파일을 찾을 수 없습니다.");
            }

            byte[] encryptedBytes = Files.readAllBytes(filePath);
            byte[] decryptedBytes = fileCryptoUtil.decrypt(encryptedBytes);
            Resource resource = new ByteArrayResource(decryptedBytes);

            String encodedFileName = UriUtils.encode(attachment.getFileOriginalNm(), StandardCharsets.UTF_8);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(decryptedBytes.length))
                    .body(resource);

        } catch (Exception e) {
            log.error("공지사항 파일 다운로드 중 오류 발생: {}", fileSq, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 다운로드 중 오류가 발생했습니다.");
        }
    }
}
