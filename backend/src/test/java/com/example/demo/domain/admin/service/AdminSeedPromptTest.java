package com.example.demo.domain.admin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.example.demo.common.mapper.CommonCodeMapper;
import com.example.demo.domain.admin.mapper.AdminSeedMapper;
import com.example.demo.domain.admin.service.seed.SeedPlanner;
import com.example.demo.domain.admin.service.seed.SeedTextToHtmlConverter;
import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.community.mapper.AnswerMapper;
import com.example.demo.domain.community.mapper.BoardMapper;

/**
 * 프롬프트 조립.
 *
 * <p>
 * <b>이 테스트가 있는 이유</b> — 프롬프트 본문은 {@link String#formatted} 로 조립된다.
 * 안내 문구에 리터럴 {@code %} 를 넣으면(예: "3.3% 원천징수") 서식 지정자로 해석돼
 * 런타임에 터진다. 실제로 한 번 겪었고, 컴파일러가 잡아주지 않는다.
 * </p>
 */
class AdminSeedPromptTest {

	private AdminSeedService service;

	@BeforeEach
	void setUp() {
		CommonCodeMapper commonCodeMapper = mock(CommonCodeMapper.class);
		when(commonCodeMapper.findActiveChildrenByParent(anyLong()))
				.thenReturn(List.of(category(3201L, "자유"), category(3203L, "현장정보")));

		// buildPrompt 는 공통코드만 쓴다. 나머지 의존성은 이 테스트에서 호출되지 않는다.
		service = new AdminSeedService(
				new SeedPlanner(new SeedTextToHtmlConverter()),
				mock(AdminSeedMapper.class),
				commonCodeMapper,
				mock(BoardMapper.class),
				mock(AnswerMapper.class));
	}

	@Test
	@DisplayName("프롬프트 조립이 서식 오류로 터지지 않는다 — 리터럴 %% 이스케이프 회귀 방지")
	void buildsWithoutFormatError() {
		assertThatCode(() -> service.buildPrompt(20)).doesNotThrowAnyException();
	}

	@Test
	@DisplayName("요청 건수와 활성 카테고리가 프롬프트에 박힌다")
	void containsCountAndCategories() {
		String prompt = service.buildPrompt(37);

		assertThat(prompt).contains("37건");
		assertThat(prompt).contains("3201 : 자유");
		assertThat(prompt).contains("3203 : 현장정보");
	}

	@Test
	@DisplayName("서식 지정자가 결과에 남아 있지 않다")
	void leavesNoUnresolvedPlaceholder() {
		String prompt = service.buildPrompt(20);

		assertThat(prompt).doesNotContain("%d").doesNotContain("%s");
		// 이스케이프한 리터럴은 한 글자로 풀려 있어야 한다
		assertThat(prompt).contains("3.3% 원천징수").doesNotContain("3.3%%");
	}

	@Test
	@DisplayName("플랫폼 도메인이 IT 프리랜서다 — 건설업 문구가 남아 있으면 안 된다")
	void framesTheRightDomain() {
		String prompt = service.buildPrompt(20);

		assertThat(prompt).contains("IT 프리랜서");
		assertThat(prompt).doesNotContain("건설").doesNotContain("토목").doesNotContain("시공");
	}

	private CommonCodeDTO category(Long code, String name) {
		CommonCodeDTO dto = new CommonCodeDTO();
		dto.setCommonCodeSq(code);
		dto.setCommonCodeNm(name);
		dto.setParentCommonCodeSq(3200L);
		return dto;
	}
}
