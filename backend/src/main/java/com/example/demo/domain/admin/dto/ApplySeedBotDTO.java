package com.example.demo.domain.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 지원에 쓸 봇 계정 하나.
 *
 * <p>
 * {@code resumeSq} 가 null 이면 이력서가 없는 봇이다. 지원 INSERT 는 {@code resume_sq} 가
 * NOT NULL 이고, 지원자 목록 조회도 {@code JOIN TBL_RESUME_M}(INNER)이라 이력서 없는 봇은
 * 지원 자체가 불가능하다. 그래서 배분 전에 이력서부터 채운다.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
public class ApplySeedBotDTO {

    private Long userSq;
    private String userId;
    private String userNickname;

    /** 대표 이력서 번호. 없으면 null */
    private Long resumeSq;
}
