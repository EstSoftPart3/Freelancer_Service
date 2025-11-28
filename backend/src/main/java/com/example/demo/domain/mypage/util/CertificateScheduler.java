package com.example.demo.domain.mypage.util;

import com.example.demo.domain.mypage.dto.CertificateDTO;
import com.example.demo.domain.mypage.service.CertificateService;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
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
    
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        try {
            int count = certificateService.getCertificateCount();
            System.out.println("========================================");
            System.out.println("현재 DB 자격증 데이터 수: " + count + "건");
            System.out.println("========================================");
            
            if (count == 0) {
                System.out.println("⚠️ DB가 비어있습니다. 초기 데이터를 로딩합니다...");
                fetchAndSaveCertificates();
            } else {
                System.out.println("✅ DB에 자격증 데이터가 이미 존재합니다. 스킵합니다.");
            }
        } catch (Exception e) {
            System.err.println("❌ 초기화 중 오류 발생:");
            e.printStackTrace();
        }
    }
    
    @Scheduled(cron = "0 0 1 * * MON")
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
