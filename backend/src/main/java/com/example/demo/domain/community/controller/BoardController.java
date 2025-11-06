package com.example.demo.domain.community.controller;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.util.*;
import com.example.demo.common.ApiResponse;
import com.example.demo.domain.community.dto.request.*;
import com.example.demo.domain.community.service.BoardService;
import com.example.demo.domain.community.dto.response.*;
import com.example.demo.domain.community.entity.*;
import com.example.demo.domain.community.mapper.BoardMapper;
import com.example.demo.domain.community.dto.*;

import lombok.RequiredArgsConstructor;

import javax.lang.model.type.NullType;

import java.util.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;



@RestController
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;
    private final BoardMapper boardMapper;
    private final AmazonS3 amazonS3;
    
    @Value("${cloud.aws.s3.bucket}")
    private String bucket;
    
//    전체 게시글 조회
    @GetMapping
    public ResponseEntity<ApiResponse<BoardListResponse>> getAllBoards(
    		@RequestParam(value = "searchType", required = false) String searchType, 
    		@RequestParam(value = "keyword", required = false) String keyword,
    		@RequestParam(value = "sortType", defaultValue = "latest") String sortType,
    		@RequestParam(value = "page", defaultValue = "1") Long page,
    		@RequestParam(value = "size", defaultValue = "10") Long size){
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 조회 성공", boardService.getAllBoards(1401L, null, searchType, keyword, null, sortType, page, size)));
    }
    
//    게시글 하나 조회
    @GetMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<BoardResponse>> getBoard(@AuthenticationPrincipal Long userSq, @PathVariable("boardSq") Long boardSq){
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 조회 성공", boardService.getBoard(userSq, boardSq, 1401L)));
    }
    
//    게시글 등록
    @PostMapping
    public ResponseEntity<ApiResponse<NullType>> createBoard(@AuthenticationPrincipal Long userSq, 
    		@ModelAttribute BoardRequest boardRequest,
    		@RequestParam("skillTagsJson") String skillTagsJson){
    	ObjectMapper objectMapper = new ObjectMapper();
    	List<SkillTagDTO> skillTags;
    	if(skillTagsJson != null && !skillTagsJson.isBlank()) {
        	try {
                skillTags = objectMapper.readValue(skillTagsJson, new TypeReference<List<SkillTagDTO>>() {});
            } catch (JsonProcessingException e) {
                return ResponseEntity.badRequest().body(ApiResponse.of(HttpStatus.BAD_REQUEST, "skillTags 변환 실패", null));
            }
        	boardRequest.setSkillTags(skillTags);	
    	}
    	boardRequest.setUserSq(userSq);
    	boardService.createBoard(boardRequest, 1401L);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "게시글 등록이 완료되었습니다.", null));
    }
    
//    게시글 수정
    // 인턴 수정:
    // 사유: Spring MVC의 PUT 요청에서 multipart/form-data 처리 제한 문제로 PATCH로 변경하고 경로에 /edit 추가
    @PatchMapping("/{boardSq}/edit")
    public ResponseEntity<ApiResponse<NullType>> updateBoard(@AuthenticationPrincipal Long userSq, @PathVariable("boardSq") Long boardSq, 
    		@ModelAttribute BoardRequest boardRequest,
    		@RequestParam("skillTagsJson") String skillTagsJson){
    	ObjectMapper objectMapper = new ObjectMapper();
    	List<SkillTagDTO> skillTags;
    	if(skillTagsJson != null && !skillTagsJson.isBlank()) {
        	try {
                skillTags = objectMapper.readValue(skillTagsJson, new TypeReference<List<SkillTagDTO>>() {});
            } catch (JsonProcessingException e) {
                return ResponseEntity.badRequest().body(ApiResponse.of(HttpStatus.BAD_REQUEST, "skillTags 변환 실패", null));
            }
        	boardRequest.setSkillTags(skillTags);	
    	}
    	boardRequest.setUserSq(userSq);
    	boardService.updateBoard(boardRequest, boardSq, 1401L);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 수정이 완료되었습니다.", null));
    }
    
//    게시글 삭제
    @PatchMapping("/{boardSq}")
    public ResponseEntity<ApiResponse<NullType>> deleteBoard(@AuthenticationPrincipal Long userSq, @PathVariable("boardSq") Long boardSq){
    	boardService.deleteBoard(userSq, boardSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "게시글 삭제가 완료되었습니다.", null));
    }
    
//    게시글 조회수 증가
    @PatchMapping("/{boardSq}/increment-view")
    public ResponseEntity<ApiResponse<NullType>> addViewCntBoard(@PathVariable("boardSq") Long boardSq){
    	boardService.addViewCntBoard(boardSq);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "조회수 증가가 완료되었습니다.", null));
    }
    
//  게시글 추천 클릭
	@PostMapping("/{boardSq}/recommend")
	public ResponseEntity<ApiResponse<NullType>> updateRecommendBoard(@AuthenticationPrincipal Long userSq, @PathVariable("boardSq") Long boardSq){
		boardService.updateBoardRecommend(userSq, boardSq);
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "추천 반영이 완료되었습니다.", null));
	}
	
//	전체 스킬 태그 리스트 조회
	@GetMapping("/skill-tags")
	public ResponseEntity<ApiResponse<List<CommonSkillTag>>> getAllSkills() {
		return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "기술 태그 리스트 조회 완료", boardService.getAllSkillTags()));
	}
	
	// 첨부파일 다운로드
	@GetMapping("/download/{fileSq}")
	public ResponseEntity<byte[]> downloadFile(@PathVariable("fileSq") Long fileSq) {
		
		BoardAttachment attachment = boardMapper.findFile(fileSq);
		
		if(attachment == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다.");
		}
		
	    // S3에서 파일 불러오기
	    S3Object s3Object = amazonS3.getObject(bucket, attachment.getFileSaveNm());
	    S3ObjectInputStream inputStream = s3Object.getObjectContent();
	    byte[] content;

	    try {
	        content = IOUtils.toByteArray(inputStream);
	    } catch (IOException e) {
	        throw new RuntimeException("파일 다운로드 실패", e);
	    }
	    
	    String encodedFileName = UriUtils.encode(attachment.getFileOriginalNm(), StandardCharsets.UTF_8);

	    HttpHeaders headers = new HttpHeaders();
	    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
	    headers.setContentDisposition(ContentDisposition.attachment().filename(encodedFileName).build());

	    return new ResponseEntity<>(content, headers, HttpStatus.OK);
	}

}