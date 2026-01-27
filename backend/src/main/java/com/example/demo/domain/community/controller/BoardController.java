package com.example.demo.domain.community.controller;

import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import javax.lang.model.type.NullType;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.community.dto.SkillTagDTO;
import com.example.demo.domain.community.dto.request.BoardRequest;
import com.example.demo.domain.community.dto.response.BoardListResponse;
import com.example.demo.domain.community.dto.response.BoardResponse;
import com.example.demo.domain.community.entity.BoardAttachment;
import com.example.demo.domain.community.entity.CommonSkillTag;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.service.BoardService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {
	private final BoardService boardService;
	private final BoardMapper boardMapper;
	// private final AmazonS3 amazonS3;

	// @Value("${cloud.aws.s3.bucket}")
	// private String bucket;

	// 로컬용
	@Value("${file.upload-dir}")
	private String uploadDir;

	// 전체 게시글 조회
	@GetMapping
	public ResponseEntity<ApiResponse<BoardListResponse>> getAllBoards(
			@RequestParam(value = "searchType", required = false) String searchType,
			@RequestParam(value = "keyword", required = false) String keyword,
			@RequestParam(value = "sortType", defaultValue = "latest") String sortType,
			@RequestParam(value = "page", defaultValue = "1") Long page,
			@RequestParam(value = "size", defaultValue = "10") Long size) {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 조회 성공",
				boardService.getAllBoards(1401L, null, searchType, keyword, null, sortType, page, size)));
	}

	// 게시글 하나 조회
	@GetMapping("/{boardSq}")
	public ResponseEntity<ApiResponse<BoardResponse>> getBoard(@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq) {
		return ResponseEntity
				.ok(ApiResponse.of(HttpStatus.OK, "게시글 조회 성공", boardService.getBoard(userSq, boardSq, 1401L)));
	}

	// 게시글 등록
	@PostMapping
	public ResponseEntity<ApiResponse<NullType>> createBoard(@AuthenticationPrincipal Long userSq,
			@ModelAttribute BoardRequest boardRequest,
			@RequestParam("skillTagsJson") String skillTagsJson) {
		ObjectMapper objectMapper = new ObjectMapper();
		List<SkillTagDTO> skillTags;
		if (skillTagsJson != null && !skillTagsJson.isBlank()) {
			try {
				skillTags = objectMapper.readValue(skillTagsJson, new TypeReference<List<SkillTagDTO>>() {
				});
			} catch (JsonProcessingException e) {
				return ResponseEntity.badRequest()
						.body(ApiResponse.of(HttpStatus.BAD_REQUEST, "skillTags 변환 실패", null));
			}
			boardRequest.setSkillTags(skillTags);
		}
		boardRequest.setUserSq(userSq);
		boardService.createBoard(boardRequest, 1401L);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "게시글 등록이 완료되었습니다.", null));
	}

	// 게시글 수정
	@PutMapping("/{boardSq}")
	public ResponseEntity<ApiResponse<NullType>> updateBoard(@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq,
			@ModelAttribute BoardRequest boardRequest,
			@RequestParam("skillTagsJson") String skillTagsJson) {
		ObjectMapper objectMapper = new ObjectMapper();
		List<SkillTagDTO> skillTags;
		if (skillTagsJson != null && !skillTagsJson.isBlank()) {
			try {
				skillTags = objectMapper.readValue(skillTagsJson, new TypeReference<List<SkillTagDTO>>() {
				});
			} catch (JsonProcessingException e) {
				return ResponseEntity.badRequest()
						.body(ApiResponse.of(HttpStatus.BAD_REQUEST, "skillTags 변환 실패", null));
			}
			boardRequest.setSkillTags(skillTags);
		}
		boardRequest.setUserSq(userSq);
		boardService.updateBoard(boardRequest, boardSq, 1401L);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 수정이 완료되었습니다.", null));
	}

	// 게시글 삭제
	@PatchMapping("/{boardSq}")
	public ResponseEntity<ApiResponse<NullType>> deleteBoard(@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq) {
		boardService.deleteBoard(userSq, boardSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 삭제가 완료되었습니다.", null));
	}

	// 게시글 조회수 증가
	@PatchMapping("/{boardSq}/increment-view")
	public ResponseEntity<ApiResponse<NullType>> addViewCntBoard(@PathVariable("boardSq") Long boardSq) {
		boardService.addViewCntBoard(boardSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가가 완료되었습니다.", null));
	}

	// 게시글 추천 클릭
	@PostMapping("/{boardSq}/recommend")
	public ResponseEntity<ApiResponse<NullType>> updateRecommendBoard(@AuthenticationPrincipal Long userSq,
			@PathVariable("boardSq") Long boardSq) {
		boardService.updateBoardRecommend(userSq, boardSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "추천 반영이 완료되었습니다.", null));
	}

	// 전체 스킬 태그 리스트 조회
	@GetMapping("/skill-tags")
	public ResponseEntity<ApiResponse<List<CommonSkillTag>>> getAllSkills() {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "기술 태그 리스트 조회 완료", boardService.getAllSkillTags()));
	}

	// // S3용 첨부파일 다운로드
	// @GetMapping("/download/{fileSq}")
	// public ResponseEntity<byte[]> downloadFile(@PathVariable("fileSq") Long
	// fileSq) {

	// BoardAttachment attachment = boardMapper.findFile(fileSq);

	// if(attachment == null) {
	// throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다.");
	// }

	// // S3에서 파일 불러오기
	// S3Object s3Object = amazonS3.getObject(bucket, attachment.getFileSaveNm());
	// S3ObjectInputStream inputStream = s3Object.getObjectContent();
	// byte[] content;

	// try {
	// content = IOUtils.toByteArray(inputStream);
	// } catch (IOException e) {
	// throw new RuntimeException("파일 다운로드 실패", e);
	// }

	// String encodedFileName = UriUtils.encode(attachment.getFileOriginalNm(),
	// StandardCharsets.UTF_8);

	// HttpHeaders headers = new HttpHeaders();
	// headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
	// headers.setContentDisposition(ContentDisposition.attachment().filename(encodedFileName).build());

	// return new ResponseEntity<>(content, headers, HttpStatus.OK);
	// }

	@GetMapping("/download/{fileSq}")
	public ResponseEntity<Resource> downloadFile(@PathVariable("fileSq") Long fileSq) {

		// 1. DB에서 파일 정보 조회 (BoardAttachment 엔티티 활용)
		BoardAttachment attachment = boardMapper.findFile(fileSq);

		if (attachment == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일 정보가 존재하지 않습니다.");
		}

		try {
			// 2. 물리적 파일 경로 확보
			Path filePath = Paths.get(uploadDir).resolve(attachment.getFileSaveNm()).normalize();
			Resource resource = new UrlResource(filePath.toUri());

			if (!resource.exists() || !resource.isReadable()) {
				throw new ResponseStatusException(HttpStatus.NOT_FOUND, "실제 파일을 찾을 수 없습니다.");
			}

			// 3. 한글 파일명 깨짐 방지 인코딩
			String encodedFileName = UriUtils.encode(attachment.getFileOriginalNm(), StandardCharsets.UTF_8);

			// 4. 다운로드 응답 헤더 설정 (attachment 설정이 있어야 브라우저에서 저장창이 뜸)
			return ResponseEntity.ok()
					.contentType(MediaType.APPLICATION_OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
					.body(resource);

		} catch (MalformedURLException e) {
			throw new RuntimeException("파일 경로가 잘못되었습니다.", e);
		}
	}

}