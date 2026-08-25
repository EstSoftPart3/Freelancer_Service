package com.example.demo.domain.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * (공고, 지원자) 한 쌍. 이미 존재하는 지원을 읽어 같은 봇을 두 번 배정하지 않는 데 쓴다.
 *
 * <p>
 * 서버는 중복 지원을 막지 않는다 — {@code ProjectService.createProjectApplication} 의 검증은
 * "탈퇴 회원 차단" 하나뿐이고, {@code /check} API 는 조회 전용이라 등록 경로에서 호출되지 않는다.
 * FO 가 버튼을 숨길 뿐이다. 그러니 배분하는 쪽이 스스로 절제해야 한다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class ApplySeedPairDTO {
    private Long projectSq;
    private Long userSq;
}
