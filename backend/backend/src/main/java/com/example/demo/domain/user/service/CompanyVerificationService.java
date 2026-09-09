package com.example.demo.domain.user.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.demo.common.ApiResponse;
import com.example.demo.domain.user.dto.request.CompanyVerificationRequestDTO;
import com.example.demo.domain.user.repository.CompanyVerificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyVerificationService {

    private final CompanyVerificationRepository companyVerificationRepository;

    public ApiResponse<Boolean> verifyCompany(CompanyVerificationRequestDTO requestDto) {

        // 중복 검사
        boolean exists = companyVerificationRepository.existsByBizNum(requestDto.getBNo());
        if (exists) {
            return ApiResponse.of(HttpStatus.CONFLICT, "이미 등록된 사업자등록번호입니다.", false);
        }

        RestTemplate restTemplate = new RestTemplate();
        URI uri = UriComponentsBuilder.fromHttpUrl("http://api.odcloud.kr/api/nts-businessman/v1/validate")
                .queryParam("serviceKey",
                        "oo7Cptu%2Fmuq0VdvJOvEZ816dEyBChjhrqLIM0HqL2%2BeJeZXKg46MztkspSRsh3HBX%2FlyqoXbNCWB4OydznQ%2Bmg%3D%3D")
                .build(true)
                .toUri();

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, String> business = new HashMap<>();
        business.put("b_no", requestDto.getBNo());
        business.put("start_dt", requestDto.getStartDt());
        business.put("p_nm", requestDto.getPNm());
        business.put("b_nm", requestDto.getBNm());
        requestBody.put("businesses", Collections.singletonList(business));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> resultMap = restTemplate.exchange(uri, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = resultMap.getBody();
            System.out.println(body);

            if (body == null || !body.containsKey("data")) {
                return ApiResponse.of(HttpStatus.OK, "사업자 정보 확인 불가", false);
            }

            List<Map<String, Object>> dataList = (List<Map<String, Object>>) body.get("data");

            if (dataList.isEmpty()) {
                return ApiResponse.of(HttpStatus.OK, "사업자 정보 없음", false);
            }

            Map<String, Object> firstResult = dataList.get(0);
            String valid = (String) firstResult.get("valid");

            if ("01".equals(valid)) {
                return ApiResponse.of(HttpStatus.OK, "사업자 정보 일치", true);
            } else {
                String validMsg = (String) firstResult.getOrDefault("valid_msg", "사업자 정보 불일치");
                return ApiResponse.of(HttpStatus.OK, validMsg, false);
            }

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.out.println("상태 코드: " + e.getStatusCode());
            System.out.println("응답 바디: " + e.getResponseBodyAsString());
            return ApiResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "API 호출 실패", false);
        }

    }
}