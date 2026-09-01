package com.example.demo.domain.project.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SkillInsertRequest {
    private Long skillTagSq;
    private Long parentSkillTagSq;
    private Integer skillTagLvl;
    private String skillTagNm;

    public SkillInsertRequest(String skillTagNm) {
        this.skillTagNm = skillTagNm;
    }

    /**
     * 기술 마스터(TBL_SKILL_TAG_C)에 없는, 등록자가 직접 입력한 기술.
     *
     * <p>
     * 마스터에 새 행을 만들지 않고 이 공고에만 붙인다 — 오타나 표기 흔들림(react / React / 리액트)이
     * 마스터에 쌓이지 않게 하기 위해서다. 공고 기술 테이블에는 FK 가 없고 조회도 skill_tag_nm 만
     * 읽으므로 sq 는 0 이어도 표시에 문제가 없다.
     * </p>
     */
    public static SkillInsertRequest custom(String skillTagNm) {
        SkillInsertRequest req = new SkillInsertRequest(skillTagNm);
        req.setSkillTagSq(0L);          // 컬럼이 NOT NULL 이라 null 을 넣을 수 없다
        req.setParentSkillTagSq(null);
        req.setSkillTagLvl(0);
        return req;
    }
}