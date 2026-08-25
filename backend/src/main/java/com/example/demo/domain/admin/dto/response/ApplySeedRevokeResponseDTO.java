package com.example.demo.domain.admin.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
 * 회수 결과(미리보기 공용).
 *
 * <p>
 * 커뮤니티 시더는 회수 대상을 브라우저 localStorage 에 기록해 뒀지만, 지원은 그럴 필요가 없다.
 * 봇이 만든 지원은 {@code user_id LIKE 'bot!_%'} 로 DB 에서 곧장 가려낼 수 있다.
 * </p>
 */
@Getter
@Builder
public class ApplySeedRevokeResponseDTO {

    private int applications;
    /** 카운터를 되돌린 공고 수 */
    private int affectedProjects;
    private List<Sample> samples;

    @Getter
    @Builder
    public static class Sample {
        private Long projectSq;
        private String projectTtl;
        private int count;
    }
}
