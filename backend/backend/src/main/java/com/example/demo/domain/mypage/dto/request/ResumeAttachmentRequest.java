package com.example.demo.domain.mypage.dto.request;

import lombok.Data;

@Data
public class ResumeAttachmentRequest {
	private Long attachmentSq;
	private Long resumeSq;
	private String attachmentUrl;
}
