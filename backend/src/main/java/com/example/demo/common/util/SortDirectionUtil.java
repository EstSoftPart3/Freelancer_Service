package com.example.demo.common.util;

/**
 * MyBatis {@code ${sortOrder}} 문자열 삽입 지점(ORDER BY 방향)에 쓰이는 값을 ASC/DESC로만 강제한다.
 * 파라미터 바인딩(#{})이 불가능한 위치라 화이트리스트 정규화가 SQL Injection을 막는 유일한 방어선이다.
 */
public final class SortDirectionUtil {

    private SortDirectionUtil() {
    }

    public static String normalize(String sortOrder) {
        return "ASC".equalsIgnoreCase(sortOrder) ? "ASC" : "DESC";
    }
}
