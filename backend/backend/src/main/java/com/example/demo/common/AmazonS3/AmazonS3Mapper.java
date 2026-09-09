package com.example.demo.common.AmazonS3;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AmazonS3Mapper {

    // 파일 정보 저장
    void insertFileInfo(UploadedFileDTO fileDto);

    // 저장 파일명으로 파일 순번 조회
    Long selectFileSqBySavedName(@Param("savedName") String savedName);
}