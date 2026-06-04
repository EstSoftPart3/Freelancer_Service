package com.example.demo.domain.user.dto.request;

import com.example.demo.domain.company.dto.request.BaseRequest;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class NotificationSearchDTO extends BaseRequest {
	private String searchType;
	private String searchKeyword;
	private Long notificationTypeCd;
}
