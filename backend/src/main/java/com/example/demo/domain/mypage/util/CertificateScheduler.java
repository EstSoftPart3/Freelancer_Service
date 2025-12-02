package com.example.demo.domain.mypage.util;

import com.example.demo.domain.mypage.dto.CertificateDTO;
import com.example.demo.domain.mypage.service.CertificateService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;

@Component
public class CertificateScheduler {

    private final CertificateService certificateService;

    // 원본 API 키 (디코딩된 상태로 사용)
    private final String apiKey = "oo7Cptu/muq0VdvJOvEZ816dEyBChjhrqLIM0HqL2+eJeZXKg46MztkspSRsh3HBX/lyqoXbNCWB4OydznQ+mg==";

    public CertificateScheduler(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @Scheduled(cron = "0 0 0 1 * *")
    public void fetchAndSaveCertificates() {
        try {
            StringBuilder urlBuilder = new StringBuilder(
                    "http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList");
            urlBuilder.append("?").append(URLEncoder.encode("serviceKey", "UTF-8")).append("=")
                    .append(URLEncoder.encode(apiKey, "UTF-8"));

            URL url = new URL(urlBuilder.toString());
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");

            System.out.println("Response code: " + conn.getResponseCode());

            BufferedReader rd;
            if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
                rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            } else {
                rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
            }

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = rd.readLine()) != null) {
                sb.append(line);
            }
            rd.close();
            conn.disconnect();

            // System.out.println(sb.toString());
            // XML 파싱 후 DB 저장
            List<CertificateDTO> certificates = certificateService.parseXmlAndMap(sb.toString());
            int saved = certificateService.saveOrUpdateCertificates(certificates);
            System.out.println("자격증 총 " + saved + "건 저장 또는 갱신 완료");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
