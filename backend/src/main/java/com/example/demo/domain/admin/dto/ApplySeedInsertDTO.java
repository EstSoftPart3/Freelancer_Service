package com.example.demo.domain.admin.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

/**
 * 지원 INSERT 한 행.
 *
 * <p>
 * <b>{@code ProjectMapper.insertProjectApplication} 을 쓰지 않는 이유</b>
 * <ul>
 * <li>그쪽은 {@code project_application_created_at_dtm} 이 {@code NOW()} 로 하드코딩돼 있어
 * 지원일시를 흩뿌릴 수 없다. 전부 같은 초에 몰린 지원은 그 자체로 가짜 티가 난다.</li>
 * <li>{@code ProjectService.createProjectApplication} 은 지원 1건마다 기업 계정에 알림(2602)을
 * 보낸다. 공고 20개에 10건씩이면 알림 200건이 실제 기업 계정에 쌓인다.</li>
 * </ul>
 * 커뮤니티 시더가 {@code BoardMapper} 대신 {@code AdminSeedMapper} 를 따로 둔 것과 같은 판단이다.
 * </p>
 */
@Getter
@Builder
public class ApplySeedInsertDTO {

    private Long projectSq;
    private Long resumeSq;

    /** 지원 상태. 전부 801(지원중)이지만 값은 공통코드에서 조회해 넣는다 */
    private Long statusCd;

    /** 301(개인). 봇은 전부 개인회원이다 */
    private Long memberTypeCd;

    private LocalDateTime createdAtDtm;
}
