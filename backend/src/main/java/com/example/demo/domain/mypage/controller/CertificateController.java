package com.example.demo.domain.mypage.controller;

import com.example.demo.domain.mypage.service.CertificateService;
import com.example.demo.domain.mypage.dto.request.ResumeCertificateRequest;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
public class CertificateController {

	private final CertificateService certificateService;

	public CertificateController(CertificateService certificateService) {
		this.certificateService = certificateService;
	}

	// @GetMapping("/certificates")
	// public Map<String, Object> getCertificates(
	// @RequestParam("keyword") String keyword,
	// @RequestParam("pageNo") int pageNo,
	// @RequestParam("numOfRows") int numOfRows
	// ) {
	// List<ResumeCertificateRequest> items =
	// certificateService.getCertificates(keyword, pageNo, numOfRows);
	// Map<String, Object> itemsMap = new HashMap<>();
	// itemsMap.put("item", items);

	// Map<String, Object> body = new HashMap<>();
	// body.put("items", itemsMap);
	// body.put("totalCount", items.size());

	// Map<String, Object> response = new HashMap<>();
	// response.put("body", body);

	// Map<String, Object> result = new HashMap<>();
	// result.put("response", response);

	// return result;
	// }
}