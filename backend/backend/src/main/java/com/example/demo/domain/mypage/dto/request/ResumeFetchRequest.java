package com.example.demo.domain.mypage.dto.request;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ResumeFetchRequest {
	private int page;
	private int size;
}
