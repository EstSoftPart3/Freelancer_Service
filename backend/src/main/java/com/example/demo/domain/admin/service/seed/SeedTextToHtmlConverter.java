package com.example.demo.domain.admin.service.seed;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

/**
 * 시드 본문(구조화 평문) → 게시글 HTML 변환기.
 *
 * <p>
 * <b>왜 HTML 을 직접 받지 않는가</b> — 외부 AI 마다 태그가 제각각이라 그대로 저장하면 FO 목록에서
 * 서식이 들쭉날쭉해지고, 붙여넣기 검수 부담도 커진다. 평문만 받아 여기서 한 가지 형태로 만든다.
 * 부수 효과로 <b>원문을 전부 escape 하므로 태그 주입이 원천적으로 불가능</b>하다.
 * </p>
 *
 * <p>
 * 산출 태그는 {@code frontend/react_js/src/features/board/data/board-templates.ts} 의
 * 현장정보 양식과 같은 집합이다({@code <p>}, {@code <strong>}, {@code <ul><li>}).
 * 그래야 시드 글과 사람이 쓴 글의 서식이 갈라지지 않고, Quill 에디터로 다시 열어도 깨지지 않는다.
 * </p>
 *
 * <p>
 * <b>변환 규칙</b>
 *
 * <pre>
 *   ■ 제목줄    → &lt;p&gt;&lt;strong&gt;■ 제목줄&lt;/strong&gt;&lt;/p&gt;
 *   - 항목      → &lt;ul&gt;&lt;li&gt;항목&lt;/li&gt;&lt;/ul&gt;  (연속된 줄은 하나의 ul 로 묶는다)
 *   빈 줄       → &lt;p&gt;&lt;br&gt;&lt;/p&gt;
 *   그 외       → &lt;p&gt;escaped&lt;/p&gt;
 * </pre>
 * </p>
 */
@Component
public class SeedTextToHtmlConverter {

	/**
	 * 제목줄로 인정하는 머리기호.
	 *
	 * <p>
	 * AI 는 {@code ■} 를 지정해도 {@code ▪ ● ◆ ▶} 를 섞어 뱉는다. 전부 받아주되 출력은
	 * {@code ■} 하나로 정규화한다 — 한 목록 안에서 글머리 모양이 글마다 다르면 그 자체로 티가 난다.
	 * </p>
	 */
	private static final Set<Character> HEADING_MARKERS = Set.of('■', '▪', '●', '◆', '▶', '◼', '□', '※');

	/** 목록 항목으로 인정하는 접두. <b>반드시 뒤에 공백이 와야 한다</b> — 없으면 "-30% 절감"이 목록이 된다. */
	private static final List<String> LIST_PREFIXES = List.of("- ", "* ", "• ", "· ", "‣ ");

	/** 정규화된 제목 머리기호. */
	private static final String HEADING_MARK = "■ ";

	/**
	 * 구조화 평문을 게시글 HTML 로 바꾼다.
	 *
	 * <p>
	 * 어떤 입력에도 예외를 던지지 않는다. 인식하지 못한 줄은 그냥 문단으로 떨어뜨린다 —
	 * 200건을 붙여넣는 기능에서 한 줄 때문에 전체가 실패하면 쓸 수 없다.
	 * </p>
	 */
	public String toHtml(String raw) {
		if (raw == null || raw.isBlank()) {
			return "";
		}

		// 브라우저 textarea 에 붙여넣은 AI 출력은 \r\n 을 달고 온다. 정규화하지 않으면 \r 이
		// <p> 안에 남고 다음 줄의 "- " 접두 매칭이 깨진다 — 가장 흔하고 가장 조용한 버그다.
		String normalized = raw.replace("\r\n", "\n").replace('\r', '\n');

		List<String> lines = trimBlankEdges(List.of(normalized.split("\n", -1)));

		StringBuilder out = new StringBuilder();
		List<String> listBuffer = new ArrayList<>();

		for (String line : lines) {
			String text = line.strip();

			if (text.isEmpty()) {
				flushList(out, listBuffer);
				out.append("<p><br></p>");
				continue;
			}

			String listItem = stripListPrefix(text);
			if (listItem != null) {
				// 빈 항목("- " 만 있는 줄)은 목록을 깨뜨리지 않도록 버린다.
				if (!listItem.isEmpty()) {
					listBuffer.add(escape(listItem));
				}
				continue;
			}

			flushList(out, listBuffer);

			String heading = stripHeading(text);
			if (heading != null) {
				out.append("<p><strong>").append(escape(HEADING_MARK + heading)).append("</strong></p>");
			} else {
				out.append("<p>").append(escape(text)).append("</p>");
			}
		}

		flushList(out, listBuffer);
		return out.toString();
	}

	/**
	 * 태그를 벗기면 남는 게 없는가.
	 *
	 * <p>
	 * {@code board-templates.ts} 의 {@code isHtmlEmpty} 와 같은 판정이다. 변환 결과가 비면
	 * 제목만 있고 본문이 없는 글이 되므로 경고로 올린다.
	 * </p>
	 */
	public boolean isHtmlEmpty(String html) {
		if (html == null) {
			return true;
		}
		return html.replaceAll("<[^>]*>", "").replaceAll("(?i)&nbsp;", "").trim().isEmpty();
	}

	/** 앞뒤의 빈 줄을 걷어낸다. 본문 끝에 {@code <p><br></p>} 가 줄줄이 붙는 것을 막는다. */
	private List<String> trimBlankEdges(List<String> lines) {
		int from = 0;
		int to = lines.size();
		while (from < to && lines.get(from).isBlank()) {
			from++;
		}
		while (to > from && lines.get(to - 1).isBlank()) {
			to--;
		}
		return lines.subList(from, to);
	}

	private void flushList(StringBuilder out, List<String> buffer) {
		if (buffer.isEmpty()) {
			return;
		}
		out.append("<ul>");
		for (String item : buffer) {
			out.append("<li>").append(item).append("</li>");
		}
		out.append("</ul>");
		buffer.clear();
	}

	/** 목록 항목이면 접두를 뗀 내용을, 아니면 null 을 돌려준다. */
	private String stripListPrefix(String text) {
		for (String prefix : LIST_PREFIXES) {
			if (text.startsWith(prefix)) {
				return text.substring(prefix.length()).strip();
			}
		}
		return null;
	}

	/**
	 * 제목줄이면 머리기호를 뗀 내용을, 아니면 null 을 돌려준다.
	 *
	 * <p>
	 * 머리기호 외에 마크다운 제목({@code ## 제목})과 굵게({@code **제목**})도 제목으로 받는다 —
	 * 프롬프트로 형식을 정해줘도 AI 가 마크다운 습관을 섞기 때문이다.
	 * </p>
	 */
	private String stripHeading(String text) {
		if (HEADING_MARKERS.contains(text.charAt(0))) {
			return text.substring(1).strip();
		}
		if (text.startsWith("#")) {
			String body = text.replaceFirst("^#{1,6}\\s*", "");
			return body.equals(text) ? null : body.strip();
		}
		// 줄 전체가 **...** 인 경우만 제목으로 본다. 문장 중간의 강조는 그대로 둔다.
		if (text.length() > 4 && text.startsWith("**") && text.endsWith("**")) {
			String body = text.substring(2, text.length() - 2).strip();
			return body.contains("**") ? null : body;
		}
		return null;
	}

	/**
	 * HTML 특수문자 escape.
	 *
	 * <p>
	 * <b>순서가 중요하다.</b> {@code &} 를 먼저 바꿔야 한다 — 나중에 바꾸면 앞서 만든
	 * {@code &lt;} 가 {@code &amp;lt;} 로 두 번 이스케이프된다.
	 * </p>
	 */
	private String escape(String text) {
		return text.replace("&", "&amp;")
				.replace("<", "&lt;")
				.replace(">", "&gt;");
	}
}
