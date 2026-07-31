package com.example.demo.domain.admin.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 회수 대상 미리보기 한 줄.
 *
 * <p>
 * 회수 화면에 <b>건수만 보여주면 안 된다</b> — "312건이 내려갑니다" 만으로는 그게 이번 회차인지
 * 지난달 것까지인지 알 수 없다. 실제 제목과 작성일을 함께 보여줘야 판단할 수 있다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedRevokeSampleDTO {

	private Long boardSq;
	private String title;
	private String userNickname;
	private LocalDateTime createdAt;
	private Long boardTypeCd;
}
