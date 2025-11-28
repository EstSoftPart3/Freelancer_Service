package com.example.demo.domain.mypage.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.domain.mypage.dto.CertificateDTO;

@Mapper
public interface CertificateMapper {
    CertificateDTO selectCertificateById(Long certificateCd);

    void insertCertificate(CertificateDTO certificateDTO);

    void updateCertificate(CertificateDTO certificateDTO);

	int count();
}
