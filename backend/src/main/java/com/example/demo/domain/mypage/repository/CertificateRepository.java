package com.example.demo.domain.mypage.repository;

import org.springframework.stereotype.Repository;

import com.example.demo.domain.mypage.dto.CertificateDTO;
import com.example.demo.domain.mypage.mapper.CertificateMapper;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CertificateRepository {
    private final CertificateMapper certificateMapper;

    public CertificateDTO selectCertificateById(Long certificateCd) {
        return certificateMapper.selectCertificateById(certificateCd);
    }

    public void insertCertificate(CertificateDTO certificateDTO) {
        certificateMapper.insertCertificate(certificateDTO);
    }

    public void updateCertificate(CertificateDTO certificateDTO) {
        certificateMapper.updateCertificate(certificateDTO);
    }

	public int count() {
		return certificateMapper.count();
	}
}
