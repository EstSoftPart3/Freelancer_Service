package com.example.demo.domain.mypage.service;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import com.example.demo.domain.mypage.dto.CertificateDTO;
import com.example.demo.domain.mypage.repository.CertificateRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CertificateService {

	private final CertificateRepository certificateRepository;

	public int saveOrUpdateCertificates(List<CertificateDTO> certificates) {
		int count = 0;
		for (CertificateDTO cert : certificates) {
			CertificateDTO existing = certificateRepository.selectCertificateById(cert.getCertificateCd());
			if (existing != null) {
				certificateRepository.updateCertificate(cert);
				System.out.println("업데이트 진행");
			} else {
				certificateRepository.insertCertificate(cert);
				System.out.println("인서트 진행");

			}
			count++;
		}
		return count;
	}

	public List<CertificateDTO> parseXmlAndMap(String xml) throws Exception {
		List<CertificateDTO> list = new ArrayList<>();
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();
		Document doc = builder.parse(new InputSource(new StringReader(xml)));
		NodeList itemList = doc.getElementsByTagName("item");
		
		for (int i = 0; i < itemList.getLength(); i++) {
			Element item = (Element) itemList.item(i);

			CertificateDTO dto = new CertificateDTO();
			dto.setCertificateCd(parseLongSafe(getTagValue("jmcd", item)));
			dto.setCertificateNm(getTagValue("jmfldnm", item));
			dto.setMiddleObligationFieldCd(parseLongSafe(getTagValue("mdobligfldcd", item)));
			dto.setMiddleObligationFieldNm(getTagValue("mdobligfldnm", item));
			dto.setObligationFieldCd(parseLongSafe(getTagValue("obligfldcd", item)));
			dto.setObligationFieldNm(getTagValue("obligfldnm", item));
			// 자격구분 코드 - VARCHAR로 변경됨
			String qualGroupCd = getTagValue("qualgbcd", item);
			dto.setQualificationGroupCd(convertQualificationGroupCode(qualGroupCd));
			dto.setQualificationGroupNm(getTagValue("qualgbnm", item));
			dto.setSeriesCd(parseLongSafe(getTagValue("seriescd", item)));
			dto.setSeriesNm(getTagValue("seriesnm", item));
			
			list.add(dto);
		}
		return list;
	}
	
	private Long convertQualificationGroupCode(String code) {
		if (code == null || code.trim().isEmpty()) {
			return null;
		}
		
		String trimmedCode = code.trim().toUpperCase();
		
		switch (trimmedCode) {
			case "T":
				return 1L; // 국가기술자격
			case "S":
				return 2L; // 국가전문자격
			default:
				// 이미 숫자인 경우 그대로 변환
				try {
					return Long.parseLong(trimmedCode);
				} catch (NumberFormatException e) {
					System.err.println("알 수 없는 자격구분 코드: " + code + " -> 0으로 설정");
					return 0L;
				}
		}
	}
	private String getTagValue(String tag, Element element) {
		NodeList nodeList = element.getElementsByTagName(tag);
		if (nodeList.getLength() == 0)
			return null;
		String value = nodeList.item(0).getTextContent();
		return (value != null) ? value.trim() : null;
	}

	private Long parseLongSafe(String value) {
		if (value == null || value.trim().isEmpty())
			return null;
		return Long.parseLong(value.trim());
	}

	public int getCertificateCount() {
		// TODO Auto-generated method stub
		return (int) certificateRepository.count();
	}

}
