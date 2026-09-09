package com.example.demo.common.AmazonS3;

import lombok.Data;

@Data
public class UploadedFileDTO {
    private String originalName;
    private String savedName;
    private String contentType;
    private Long size;
}
