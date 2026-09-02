package com.example.demo.domain.project.dto.response;

import java.util.List;

/**
 * 등록 폼의 등급 선택에 쓰는 두 층 구조.
 *
 * <p>
 * 등급 마스터는 13개지만 한 번에 다 보여주면 목록이 너무 길다. 기본은 대분류
 * {@code major} 넷(초급·중급·상급·등급 무관)만 고르게 하고, 「세부 등급 지정」을 켰을 때만
 * {@code details}(초초·초중·초상 …)를 보여준다.
 * </p>
 *
 * @param major   대분류 이름. 「등급 무관」도 여기 들어온다
 * @param details 그 대분류에 속한 세부 등급. 「등급 무관」은 비어 있다
 */
public record DevGradeGroupResponse(String major, List<String> details) {
}
