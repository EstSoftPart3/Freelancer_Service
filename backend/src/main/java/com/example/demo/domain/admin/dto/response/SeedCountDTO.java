package com.example.demo.domain.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 분포 확인용 집계 한 줄 (카테고리별·채택상태별).
 *
 * <p>
 * {@code Map<Long,Integer>} 대신 리스트로 내려보내는 이유는 <b>이름과 순서를 서버가 정하기
 * 위해서</b>다. 화면이 코드값을 다시 라벨로 바꾸지 않아도 되고, 0건인 항목도 빠지지 않는다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeedCountDTO {

	private Long code;
	private String name;
	private int count;
}
