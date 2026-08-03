package com.example.demo.domain.admin.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 커뮤니티 시드 요청 (미리보기·등록 공용). */
@Getter
@Setter
@NoArgsConstructor
public class SeedCommunityRequestDTO {

	/**
	 * 난수 시드.
	 *
	 * <p>
	 * <b>미리보기와 실제 등록이 같은 결과를 내게 하는 유일한 장치다.</b> 배분이 랜덤이므로
	 * 두 요청이 각자 난수를 돌리면 화면에서 본 것과 DB 에 들어가는 것이 달라진다.
	 * 미리보기 응답이 사용한 시드를 돌려주고, 등록은 그 값을 그대로 실어 보낸다.
	 * </p>
	 */
	@NotNull(message = "randomSeed 를 입력해주세요.")
	private Long randomSeed;

	/**
	 * 배분 기준 시각. 미리보기 응답이 준 값을 등록이 그대로 되돌려준다.
	 *
	 * <p>
	 * <b>{@code randomSeed} 만으로는 재현되지 않는다.</b> 배분기가 "지금으로부터 N일 전"으로
	 * 날짜를 잡기 때문에, 미리보기와 등록 사이에 시간이 흐르면 같은 시드라도 결과가 달라진다.
	 * 기준 시각까지 고정해야 화면에서 본 것과 저장되는 것이 같아진다.
	 * </p>
	 *
	 * <p>
	 * null 이면 서버가 현재 시각으로 채운다. <b>미래 시각은 현재 시각으로 잘라낸다</b> —
	 * 미래 날짜로 등록된 글은 목록 정렬을 영구히 망가뜨린다.
	 * </p>
	 */
	private LocalDateTime plannedAt;

	@NotNull(message = "배분 옵션을 입력해주세요.")
	@Valid
	private SeedOptionsDTO options;

	/**
	 * 시드할 글 목록.
	 *
	 * <p>
	 * 상한 50건은 임의값이 아니다 — DB 가 원격({@code db.estsw.co.kr})이라 50건이면
	 * 게시글·답변 건당 INSERT 와 카운트 재집계를 합쳐 <b>수백 회 왕복</b>이 된다.
	 * 200건을 한 트랜잭션으로 묶으면 공용 DB 에 긴 트랜잭션이 유지되어 락 경합이 생긴다.
	 * 프론트가 청크로 나눠 여러 번 호출한다.
	 * </p>
	 */
	@NotEmpty(message = "시드할 글이 없습니다.")
	@Size(max = 50, message = "한 번에 최대 50건까지 등록할 수 있습니다. 나눠서 등록해주세요.")
	@Valid
	private List<SeedPostDTO> posts;
}
