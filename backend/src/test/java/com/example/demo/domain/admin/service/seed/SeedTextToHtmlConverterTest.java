package com.example.demo.domain.admin.service.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** 시드 본문 변환기 — 붙여넣기 입력의 현실(개행·마크다운·특수문자)을 견디는지 본다. */
class SeedTextToHtmlConverterTest {

	private final SeedTextToHtmlConverter converter = new SeedTextToHtmlConverter();

	@Test
	@DisplayName("CRLF 를 정규화한다 — 정규화하지 않으면 다음 줄의 '- ' 매칭이 조용히 깨진다")
	void normalizesCrlf() {
		String html = converter.toHtml("첫 줄\r\n- 항목1\r\n- 항목2");

		assertThat(html).isEqualTo("<p>첫 줄</p><ul><li>항목1</li><li>항목2</li></ul>");
		assertThat(html).doesNotContain("\r");
	}

	@Test
	@DisplayName("연속된 목록 줄은 하나의 ul 로 묶고, 끊기면 새 ul 을 연다")
	void groupsConsecutiveListItems() {
		String html = converter.toHtml("- a\n- b\n문단\n- c");

		assertThat(html).isEqualTo("<ul><li>a</li><li>b</li></ul><p>문단</p><ul><li>c</li></ul>");
	}

	@Test
	@DisplayName("escape 는 & 를 먼저 바꾼다 — 순서가 틀리면 &lt; 가 &amp;lt; 로 이중 이스케이프된다")
	void escapesAmpersandFirst() {
		String html = converter.toHtml("A & B <script>alert(1)</script>");

		assertThat(html).isEqualTo("<p>A &amp; B &lt;script&gt;alert(1)&lt;/script&gt;</p>");
		assertThat(html).doesNotContain("&amp;lt;");
	}

	@Test
	@DisplayName("머리기호는 모두 ■ 로 정규화한다 — 글마다 글머리가 다르면 그 자체로 티가 난다")
	void normalizesHeadingMarkers() {
		assertThat(converter.toHtml("■ 현장명")).isEqualTo("<p><strong>■ 현장명</strong></p>");
		assertThat(converter.toHtml("▪ 위치")).isEqualTo("<p><strong>■ 위치</strong></p>");
		assertThat(converter.toHtml("● 공정")).isEqualTo("<p><strong>■ 공정</strong></p>");
	}

	@Test
	@DisplayName("마크다운 제목과 굵게도 제목으로 받는다 — 형식을 지정해도 AI 가 습관적으로 섞는다")
	void acceptsMarkdownHeadings() {
		assertThat(converter.toHtml("## 근무 조건")).isEqualTo("<p><strong>■ 근무 조건</strong></p>");
		assertThat(converter.toHtml("**참고 사항**")).isEqualTo("<p><strong>■ 참고 사항</strong></p>");
	}

	@Test
	@DisplayName("문장 중간의 강조는 제목이 아니다")
	void doesNotTreatInlineEmphasisAsHeading() {
		String html = converter.toHtml("**중요**한 것은 **속도**입니다");

		assertThat(html).isEqualTo("<p>**중요**한 것은 **속도**입니다</p>");
	}

	@Test
	@DisplayName("하이픈 뒤에 공백이 없으면 목록이 아니다 — '-30% 절감'이 목록이 되면 안 된다")
	void requiresSpaceAfterListMarker() {
		String html = converter.toHtml("-30% 절감");

		assertThat(html).isEqualTo("<p>-30% 절감</p>");
	}

	@Test
	@DisplayName("빈 줄은 <p><br></p> 가 되고, 앞뒤의 빈 줄은 걷어낸다")
	void keepsInnerBlankLinesAndTrimsEdges() {
		String html = converter.toHtml("\n\n제목\n\n본문\n\n\n");

		assertThat(html).isEqualTo("<p>제목</p><p><br></p><p>본문</p>");
	}

	@Test
	@DisplayName("현장정보 양식을 넣으면 board-templates.ts 와 같은 태그 집합이 나온다")
	void matchesFieldInfoTemplateShape() {
		String raw = String.join("\n",
				"■ 현장명",
				"판교 A블록 오피스 신축",
				"",
				"■ 근무 조건",
				"- 기간 : 2026-08 ~ 2026-12",
				"- 근무 시간 : 08:00 ~ 17:00");

		String html = converter.toHtml(raw);

		assertThat(html).isEqualTo("<p><strong>■ 현장명</strong></p><p>판교 A블록 오피스 신축</p>"
				+ "<p><br></p><p><strong>■ 근무 조건</strong></p>"
				+ "<ul><li>기간 : 2026-08 ~ 2026-12</li><li>근무 시간 : 08:00 ~ 17:00</li></ul>");
		// FO/BO 가 렌더·재편집하는 태그는 이 넷뿐이어야 한다
		assertThat(html.replaceAll("</?(p|strong|ul|li|br)>", "")).doesNotContain("<");
	}

	@Test
	@DisplayName("어떤 입력에도 예외를 던지지 않는다 — 200건 중 한 줄 때문에 전체가 실패하면 못 쓴다")
	void neverThrows() {
		assertThatCode(() -> {
			converter.toHtml(null);
			converter.toHtml("");
			converter.toHtml("   ");
			converter.toHtml("- ");
			converter.toHtml("#");
			converter.toHtml("**");
			converter.toHtml("■");
			converter.toHtml("\n\n\n");
			converter.toHtml("😀 이모지와 <>&\"' 특수문자");
		}).doesNotThrowAnyException();

		assertThat(converter.toHtml(null)).isEmpty();
		// 내용 없는 목록 줄은 목록이 아니라 문단으로 떨어진다 (줄을 먼저 strip 하므로 "-" 만 남는다)
		assertThat(converter.toHtml("- ")).isEqualTo("<p>-</p>");
	}

	@Test
	@DisplayName("isHtmlEmpty 는 태그만 있는 본문을 빈 것으로 본다")
	void detectsEmptyHtml() {
		assertThat(converter.isHtmlEmpty(null)).isTrue();
		assertThat(converter.isHtmlEmpty("")).isTrue();
		assertThat(converter.isHtmlEmpty("<p><br></p>")).isTrue();
		assertThat(converter.isHtmlEmpty("<p>&nbsp;</p>")).isTrue();
		assertThat(converter.isHtmlEmpty("<p>내용</p>")).isFalse();
	}
}
