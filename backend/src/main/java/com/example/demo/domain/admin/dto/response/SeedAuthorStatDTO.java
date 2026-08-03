package com.example.demo.domain.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 계정별 배분 결과.
 *
 * <p>
 * <b>이 표가 "봇 티가 나는지"를 판정하는 근거다.</b> 특정 닉네임 하나가 목록을 도배하면
 * 여기서 먼저 드러난다 — 계정 수가 부족하다는 신호이므로 봇을 증설해야 한다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedAuthorStatDTO {

	private Long userSq;
	private String userId;
	private String userNickname;

	private int boards;
	private int answers;
	private int comments;
	private int total;
}
