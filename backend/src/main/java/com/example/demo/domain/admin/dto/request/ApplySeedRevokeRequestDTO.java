package com.example.demo.domain.admin.dto.request;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 봇 지원 회수 요청.
 *
 * <p>
 * {@code projectSqs} 를 비우면 <b>모든 공고</b>의 봇 지원이 대상이다. 커뮤니티 시더의 광역 회수와
 * 같은 규약이라 위험해 보이지만, 어느 쪽이든 봇이 만든 지원만 지운다 — 실사용자 지원은
 * {@code AdminApplySeedMapper} 의 봇 조건에 걸려 애초에 대상이 되지 않는다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class ApplySeedRevokeRequestDTO {

    /** 비우면 전체 공고 */
    private List<Long> projectSqs;
}
