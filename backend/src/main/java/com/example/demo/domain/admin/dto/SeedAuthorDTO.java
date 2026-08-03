package com.example.demo.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 시드 작성자 풀의 한 계정. 매퍼가 봇 계정을 뽑아 채운다.
 *
 * <p>
 * {@code UserDTO}(SELECT *) 를 쓰지 않는 이유는 두 가지다 — 비밀번호 해시까지 끌고 올 필요가
 * 없고, 작성자 풀은 배분 때마다 통째로 도는 리스트라 가벼워야 한다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedAuthorDTO {

	private Long userSq;
	/** BO 화면에서 봇을 식별하는 값. FO 에는 노출되지 않는다. */
	private String userId;
	/** FO 가 실제로 보여주는 이름. 배분이 고른지 판단하는 기준이기도 하다. */
	private String userNickname;
}
