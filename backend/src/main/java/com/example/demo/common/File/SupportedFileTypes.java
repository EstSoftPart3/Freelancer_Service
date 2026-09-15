package com.example.demo.common.File;

import java.util.Map;
import java.util.Set;

/**
 * 업로드 허용 확장자와 그 MIME 타입의 단일 출처.
 *
 * <p>
 * 이전엔 {@code FileStorageService.ALLOWED_EXTENSIONS}(업로드 시 검증)와
 * {@code FileController.MIME_BY_EXT}(서빙 시 Content-Type 결정)가 서로 다른 클래스에
 * 독립적으로 유지되고 있었다. 두 목록이 같은 확장자 집합을 가리켜야 함에도 강제할 방법이
 * 없어서, 한쪽에만 확장자를 추가하면 "업로드는 되는데 이미지가 안 뜨는" 식의 불일치가
 * 생길 수 있었다. 이제 허용 확장자는 이 맵의 키 집합 하나로만 정의한다.
 * </p>
 */
public final class SupportedFileTypes {

    private SupportedFileTypes() {
    }

    /** 확장자 → MIME 타입. 여기 없는 확장자는 업로드 자체가 거부된다. */
    public static final Map<String, String> MIME_BY_EXTENSION = Map.ofEntries(
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("png", "image/png"),
            Map.entry("gif", "image/gif"),
            Map.entry("webp", "image/webp"),
            Map.entry("bmp", "image/bmp"),
            Map.entry("svg", "image/svg+xml"),
            Map.entry("pdf", "application/pdf"),
            Map.entry("txt", "text/plain"),
            Map.entry("csv", "text/csv"),
            Map.entry("hwp", "application/x-hwp"),
            Map.entry("hwpx", "application/hwp+zip"),
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("xls", "application/vnd.ms-excel"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            Map.entry("ppt", "application/vnd.ms-powerpoint"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            Map.entry("zip", "application/zip"));

    /** 업로드 허용 확장자 화이트리스트. {@link #MIME_BY_EXTENSION}의 키 집합과 항상 같다. */
    public static final Set<String> ALLOWED_EXTENSIONS = MIME_BY_EXTENSION.keySet();
}
