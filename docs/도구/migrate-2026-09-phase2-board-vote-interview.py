# -*- coding: utf-8 -*-
"""
2026-09 Phase2 운영 이관(Track B-2) — 게시판 재설계 · 투표 · 면접후기 · 연봉.

  드라이런(기본)   : !python "docs/도구/migrate-2026-09-phase2-board-vote-interview.py"
  개발 DB 재확인   : !python "docs/도구/migrate-2026-09-phase2-board-vote-interview.py" --apply   (이미 적용돼 있어 전부 건너뛰어야 정상)
  운영 드라이런    : !python "docs/도구/migrate-2026-09-phase2-board-vote-interview.py" --prod
  운영 적용        : !python "docs/도구/migrate-2026-09-phase2-board-vote-interview.py" --prod --apply

🔴 운영 적용 전 반드시 백업: !python "docs/도구/db-backup.py"
   롤백은 스크립트가 아니라 백업 복원(db-restore.py)으로 한다.
🔴 새 코드(Phase2)를 배포하는 시점에 같이 돌릴 것. 옛 코드는 1401/1402·3201~3205 로 글을 찾으므로
   이관만 먼저 하면 운영 게시판이 비어 보이고, 배포만 먼저 하면 새 게시판이 비어 보인다.

무엇을 하는가 (개발 DB 에 수작업으로 들어간 것을 그대로 재현)
  [1] 신규 테이블 6개 생성 — 투표 3, 면접후기 1, 연봉 2 (DDL 은 개발 DB 에서 떠 온 것)
  [2] 공통코드 — 게시판 5종(1405~1409)+중분류 8개, 투표 카테고리(1410/3250/3251) 추가,
      옛 게시판(1401/1402)과 옛 카테고리(3201~3205) 비활성화
  [3] 게시글 재매핑 — 2026-09-28 운영↔개발 board_sq 대조로 확인한 규칙(500건 전부 일치)
        1401/3201 자유     → 1409 라운지 / 3241 일상
        1401/3203 현장정보 → 1405 커리어 / 3211 이직
        1401/3205 정보     → 1406 기술   / 3220 개발
        1401/3204 기능요청 → 1404 고객의소리(카테고리 없음)
        1402 Q&A           → 1406 기술   / 3220 개발
      이 규칙 밖의 1401/1402 글이 남으면 커밋하지 않고 중단한다.
  [4] 연봉 시드 4,000행 + 스킬 — 개발 DB(freelancer_develop)에서 그대로 복사.
      시드는 표본 보정용이라 운영에도 있어야 한다. 이후 보정 스크립트들(직전연봉, 프리랜서 월단가)이
      이미 반영된 상태를 옮기므로 재시딩 스크립트를 다시 돌리지 않는다. 소프트삭제된 시드는 제외.
      → 같은 DB 서버에 개발 스키마가 살아 있어야 한다.

투표·면접후기 데이터는 옮기지 않는다(개발 DB 의 화면 검증용 더미 — 요구사항정의서 확정).

멱등하다. 이미 적용된 단계는 건너뛴다.
"""
import importlib.util
import os
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

try:
    import pymysql  # noqa: F401
except ImportError:
    raise SystemExit("pymysql 미설치. 먼저 실행: pip install pymysql")

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

APPLY = '--apply' in sys.argv
SEED_SOURCE = dbconfig.DEVELOP

# 생성 순서 = FK 순서
TABLES = [
    ('tbl_vote_m', """
CREATE TABLE `tbl_vote_m` (
  `vote_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL,
  `vote_ttl` varchar(200) NOT NULL,
  `vote_description_edt` text DEFAULT NULL,
  `vote_category_cd` bigint(20) NOT NULL DEFAULT 3251,
  `vote_end_dt` datetime NOT NULL,
  `vote_view_cnt` int(11) NOT NULL DEFAULT 0,
  `vote_is_deleted_yn` char(1) NOT NULL DEFAULT 'N',
  `vote_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`vote_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci"""),
    ('tbl_vote_option_s', """
CREATE TABLE `tbl_vote_option_s` (
  `vote_option_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `vote_sq` bigint(20) NOT NULL,
  `vote_option_nm` varchar(200) NOT NULL,
  `vote_option_order` int(11) NOT NULL,
  PRIMARY KEY (`vote_option_sq`),
  KEY `fk_vote_option_vote` (`vote_sq`),
  CONSTRAINT `fk_vote_option_vote` FOREIGN KEY (`vote_sq`) REFERENCES `tbl_vote_m` (`vote_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci"""),
    ('tbl_vote_record_s', """
CREATE TABLE `tbl_vote_record_s` (
  `vote_record_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `vote_sq` bigint(20) NOT NULL,
  `vote_option_sq` bigint(20) NOT NULL,
  `user_sq` bigint(20) NOT NULL,
  `vote_record_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`vote_record_sq`),
  UNIQUE KEY `uq_vote_user` (`vote_sq`,`user_sq`),
  KEY `fk_vote_record_option` (`vote_option_sq`),
  CONSTRAINT `fk_vote_record_option` FOREIGN KEY (`vote_option_sq`) REFERENCES `tbl_vote_option_s` (`vote_option_sq`),
  CONSTRAINT `fk_vote_record_vote` FOREIGN KEY (`vote_sq`) REFERENCES `tbl_vote_m` (`vote_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci"""),
    ('tbl_interview_review_m', """
CREATE TABLE `tbl_interview_review_m` (
  `interview_review_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL,
  `company_nm` varchar(200) NOT NULL,
  `job_nm` varchar(100) NOT NULL,
  `career_level` varchar(20) NOT NULL,
  `interview_dt` date DEFAULT NULL,
  `interview_stages` varchar(200) DEFAULT NULL,
  `question_edt` text DEFAULT NULL,
  `difficulty_star` tinyint(4) DEFAULT NULL,
  `atmosphere_edt` varchar(500) DEFAULT NULL,
  `result_cd` varchar(20) DEFAULT NULL,
  `proposed_salary` int(11) DEFAULT NULL,
  `interview_view_cnt` int(11) NOT NULL DEFAULT 0,
  `interview_is_deleted_yn` char(1) NOT NULL DEFAULT 'N',
  `interview_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`interview_review_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci"""),
    ('tbl_salary_submission_m', """
CREATE TABLE `tbl_salary_submission_m` (
  `salary_submission_sq` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '연봉 제출 순번',
  `user_sq` bigint(20) DEFAULT NULL COMMENT '사용자 순번. 시드 행은 NULL',
  `is_seed_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '시드(가상) 데이터 여부 / Y 또는 N',
  `seed_nickname` varchar(20) DEFAULT NULL COMMENT '시드 전용 마스킹 닉네임(예: 김**). 실제 제출은 NULL, 조회 시 회원 닉네임 사용',
  `employment_type` varchar(20) NOT NULL COMMENT 'EMPLOYED 또는 FREELANCE',
  `job_nm` varchar(100) NOT NULL COMMENT '직무명 (JOB_POSITION 공통코드 명칭)',
  `career_bucket` varchar(20) NOT NULL COMMENT '연차 구간 (1~2년/3~5년/6~9년/10년+)',
  `region_nm` varchar(30) NOT NULL COMMENT '지역명 (시/도 또는 원격)',
  `annual_salary` int(11) NOT NULL COMMENT '연봉(만원 단위)',
  `age_band` varchar(20) DEFAULT NULL COMMENT '선택 입력 — 나이대',
  `education_nm` varchar(50) DEFAULT NULL COMMENT '선택 입력 — 최종학력',
  `company_size` varchar(30) DEFAULT NULL COMMENT '선택 입력 — 회사 규모',
  `company_type` varchar(30) DEFAULT NULL COMMENT '선택 입력 — 회사 유형',
  `position_nm` varchar(50) DEFAULT NULL COMMENT '선택 입력 — 직급',
  `team_size` varchar(30) DEFAULT NULL COMMENT '선택 입력 — 팀 규모',
  `employment_subtype` varchar(30) DEFAULT NULL COMMENT '선택 입력 — 정규직/계약직 (재직자만)',
  `remote_type` varchar(30) DEFAULT NULL COMMENT '선택 입력 — 근무 형태',
  `bonus_amount` int(11) DEFAULT NULL COMMENT '선택 입력 — 성과급(만원). NULL=미응답, 0=없음',
  `stock_opt` varchar(10) DEFAULT NULL COMMENT '선택 입력 — 스톡옵션 보유 여부(있음/없음)',
  `job_change_count` varchar(20) DEFAULT NULL COMMENT '선택 입력 — 이직 횟수 구간',
  `company_nm` varchar(100) DEFAULT NULL COMMENT '현재 재직 회사명 — "같은 조건 개발자가 다니는 회사" 실데이터 집계용',
  `prev_annual_salary` int(11) DEFAULT NULL COMMENT '직전 연봉(만원) — 이직 동향 인상폭 계산용',
  `job_changed_ym` char(7) DEFAULT NULL COMMENT '최근 이직 연월(YYYY-MM) — "최근 이직 동향" 피드용',
  `created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일시',
  `updated_at_dtm` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시(재제출 시 갱신)',
  `salary_submission_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '관리자 소프트삭제 여부 — Y면 통계 집계에서 제외',
  PRIMARY KEY (`salary_submission_sq`),
  UNIQUE KEY `uq_salary_submission_user` (`user_sq`),
  KEY `idx_salary_group` (`job_nm`,`career_bucket`,`region_nm`,`employment_type`),
  KEY `idx_salary_amount` (`annual_salary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='연봉계산기 제출 — 1인 1건, 재제출 시 UPSERT. 시드(is_seed_yn=Y)는 표본 보정용 가상 데이터'"""),
    ('tbl_salary_submission_skill_s', """
CREATE TABLE `tbl_salary_submission_skill_s` (
  `salary_submission_skill_sq` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '연봉 제출 기술스택 순번',
  `salary_submission_sq` bigint(20) NOT NULL COMMENT '연봉 제출 순번',
  `skill_tag_nm` varchar(50) NOT NULL COMMENT '기술 태그 이름',
  PRIMARY KEY (`salary_submission_skill_sq`),
  KEY `idx_skill_submission` (`salary_submission_sq`),
  KEY `idx_skill_nm` (`skill_tag_nm`),
  CONSTRAINT `FK_salary_submission_skill` FOREIGN KEY (`salary_submission_sq`) REFERENCES `tbl_salary_submission_m` (`salary_submission_sq`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='연봉 제출별 보유 기술스택 — 스킬 취득 시 예상 상승률 집계용'"""),
]

#            (sq,   parent, lvl, 이름,           영문명,             활성)
NEW_CODES = [
    (1405, 1400, 2, '커리어소통',     'CAREER',          'Y'),
    (1406, 1400, 2, '기술소통',       'TECH',            'Y'),
    (1407, 1400, 2, '요즘회사',       'COMPANY',         'Y'),
    (1408, 1400, 2, '프로젝트',       'TEAMUP',          'Y'),
    (1409, 1400, 2, '라운지',         'LOUNGE',          'Y'),
    (1410, None, 1, '투표_카테고리',  'VOTE_CATEGORY',   'Y'),
    (3206, 3200, 2, '요즘회사',       'COMPANY_TALK',    'N'),
    (3210, 1405, 3, '연봉',           'SALARY',          'Y'),
    (3211, 1405, 3, '이직',           'JOB_CHANGE',      'Y'),
    (3220, 1406, 3, '개발',           'DEV',             'Y'),
    (3221, 1406, 3, 'AI',             'AI',              'Y'),
    (3230, 1408, 3, '프로젝트 의뢰',  'PROJECT_REQUEST', 'Y'),
    (3231, 1408, 3, '팀원모집',       'TEAM_RECRUIT',    'Y'),
    (3240, 1409, 3, '유머',           'PREFIX',          'Y'),
    (3241, 1409, 3, '일상',           'CHAT',            'Y'),
    (3250, 1410, 2, 'IT',             'IT',              'Y'),
    (3251, 1410, 2, '일반',           'GENERAL',         'Y'),
]

# 기존 코드: (sq, 이름, 영문명, 활성) — 개발 DB 최종 상태와 같게 맞춘다
UPDATE_CODES = [
    (1401, '일반게시판', 'BOARD',           'N'),
    (1402, '답변게시판', 'ANSWER',          'N'),
    (3201, '자유',       'FREE',            'N'),
    (3203, '커리어',     'CAREER',          'N'),
    (3204, '기능요청',   'FEATURE_REQUEST', 'N'),
    (3205, '기술',       'TECH',            'N'),
]

# (옛 type, 옛 category|None=전체) → (새 type, 새 category, board_typ)
REMAP = [
    (1401, 3201, 1409, 3241, 'lounge'),
    (1401, 3203, 1405, 3211, 'career'),
    (1401, 3205, 1406, 3220, 'tech'),
    (1401, 3204, 1404, None, 'voc'),
    (1402, None, 1406, 3220, 'tech'),
]


def say(msg):
    print(msg)


def table_exists(cur, schema, name):
    cur.execute('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=%s AND table_name=%s',
                (schema, name))
    return cur.fetchone()[0] > 0


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    say(f'\n=== Phase2 운영 이관 — {schema} — {"실제 반영" if APPLY else "드라이런"} ===')

    # ── [1] 테이블 (DDL 은 암묵 커밋이라 트랜잭션 밖에서 먼저 한다)
    say('\n[1/4] 신규 테이블')
    missing = []
    for name, ddl in TABLES:
        if table_exists(cur, schema, name):
            say(f'  {name}: 이미 존재 — 건너뜀')
        else:
            missing.append(name)
            say(f'  {name}: CREATE')
            if APPLY:
                cur.execute(ddl)

    # ── [2] 공통코드
    say('\n[2/4] 공통코드')
    for sq, parent, lvl, nm, eng, active in NEW_CODES:
        cur.execute('SELECT common_code_nm FROM tbl_common_code_c WHERE common_code_sq=%s', (sq,))
        row = cur.fetchone()
        if row:
            say(f'  [{sq}] 이미 존재("{row[0]}") — 건너뜀')
            continue
        say(f'  [{sq}] INSERT "{nm}" parent={parent} lvl={lvl} active={active}')
        if APPLY:
            cur.execute(
            'INSERT INTO tbl_common_code_c (common_code_sq, parent_common_code_sq, common_code_lvl, common_code_nm, '
            'common_code_english_nm, common_code_is_active_yn, common_code_created_at_dtm, common_code_updated_at_dtm) '
                'VALUES (%s,%s,%s,%s,%s,%s,NOW(),NOW())', (sq, parent, lvl, nm, eng, active))
    for sq, nm, eng, active in UPDATE_CODES:
        cur.execute('SELECT common_code_nm, common_code_english_nm, common_code_is_active_yn '
                    'FROM tbl_common_code_c WHERE common_code_sq=%s', (sq,))
        row = cur.fetchone()
        if row is None:
            raise SystemExit(f'  [{sq}] 코드가 없다 — 예상과 다른 DB. 중단.')
        if row == (nm, eng, active):
            say(f'  [{sq}] 이미 "{nm}"/{active} — 건너뜀')
            continue
        say(f'  [{sq}] UPDATE {row} → ({nm}, {eng}, {active})')
        if APPLY:
            cur.execute('UPDATE tbl_common_code_c SET common_code_nm=%s, common_code_english_nm=%s, '
                        'common_code_is_active_yn=%s, common_code_updated_at_dtm=NOW() WHERE common_code_sq=%s',
                        (nm, eng, active, sq))

    # ── [3] 게시글 재매핑 — 규칙 밖 글이 하나라도 있으면 아무것도 바꾸기 전에 중단
    say('\n[3/4] 게시글 재매핑')
    cur.execute('SELECT COUNT(*) FROM tbl_board_m WHERE board_type_cd IN (1401,1402)')
    total_old = cur.fetchone()[0]
    matched = 0
    for old_t, old_c, new_t, new_c, typ in REMAP:
        where = 'board_type_cd=%s' + ('' if old_c is None else ' AND board_category_cd=%s')
        args = (old_t,) if old_c is None else (old_t, old_c)
        cur.execute(f'SELECT COUNT(*) FROM tbl_board_m WHERE {where}', args)
        n = cur.fetchone()[0]
        matched += n
        say(f'  {old_t}/{old_c or "*"} → {new_t}/{new_c}({typ}): {n}건')
        if APPLY and n:
            cur.execute(f'UPDATE tbl_board_m SET board_type_cd=%s, board_category_cd=%s, board_typ=%s WHERE {where}',
                        (new_t, new_c, typ) + args)
    if matched != total_old:
        conn.rollback()
        cur.execute('SELECT board_type_cd, board_category_cd, COUNT(*) FROM tbl_board_m '
                    'WHERE board_type_cd IN (1401,1402) GROUP BY 1,2')
        raise SystemExit(f'  🔴 규칙 밖의 옛 게시글: {cur.fetchall()} — 롤백하고 중단. 규칙을 추가할 것.')
    say(f'  옛 게시글 {total_old}건 전부 규칙에 걸림')

    # ── [4] 연봉 시드 복사
    say(f'\n[4/4] 연봉 시드 ({SEED_SOURCE} → {schema})')
    cur.execute(f"SELECT COUNT(*) FROM `{SEED_SOURCE}`.tbl_salary_submission_m "
                f"WHERE is_seed_yn='Y' AND salary_submission_is_deleted_yn='N'")
    src_n = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM `{SEED_SOURCE}`.tbl_salary_submission_skill_s s "
                f"JOIN `{SEED_SOURCE}`.tbl_salary_submission_m m USING (salary_submission_sq) "
                f"WHERE m.is_seed_yn='Y' AND m.salary_submission_is_deleted_yn='N'")
    src_skill_n = cur.fetchone()[0]
    if schema == SEED_SOURCE:
        say('  원본과 대상이 같다 — 건너뜀')
    elif 'tbl_salary_submission_m' in missing and not APPLY:
        say(f'  테이블 생성 후 시드 {src_n}행 · 스킬 {src_skill_n}행 복사 예정')
    else:
        cur.execute("SELECT COUNT(*) FROM tbl_salary_submission_m WHERE is_seed_yn='Y'")
        have = cur.fetchone()[0]
        if have:
            say(f'  이미 시드 {have}행 존재 — 건너뜀')
        elif not APPLY:
            say(f'  시드 {src_n}행 · 스킬 {src_skill_n}행 복사 예정')
        else:
            cur.execute("SELECT column_name FROM information_schema.columns WHERE table_schema=%s "
                        "AND table_name='tbl_salary_submission_m' ORDER BY ordinal_position", (schema,))
            cols = ', '.join(f'`{r[0]}`' for r in cur.fetchall())
            n = cur.execute(f"INSERT INTO tbl_salary_submission_m ({cols}) SELECT {cols} "
                            f"FROM `{SEED_SOURCE}`.tbl_salary_submission_m "
                            f"WHERE is_seed_yn='Y' AND salary_submission_is_deleted_yn='N'")
            k = cur.execute(f"INSERT INTO tbl_salary_submission_skill_s "
                            f"(salary_submission_skill_sq, salary_submission_sq, skill_tag_nm) "
                            f"SELECT s.salary_submission_skill_sq, s.salary_submission_sq, s.skill_tag_nm "
                            f"FROM `{SEED_SOURCE}`.tbl_salary_submission_skill_s s "
                            f"JOIN tbl_salary_submission_m m ON m.salary_submission_sq = s.salary_submission_sq")
            say(f'  시드 {n}행 · 스킬 {k}행 복사 (원본 {src_n} · {src_skill_n})')
            if (n, k) != (src_n, src_skill_n):
                conn.rollback()
                raise SystemExit('  🔴 복사 건수가 원본과 다르다 — 롤백하고 중단.')

    if APPLY:
        conn.commit()
        say(f'\n커밋 완료 ({schema}).')
    else:
        conn.rollback()
        say('\n드라이런이라 아무것도 바꾸지 않았다(SELECT 만 했다). 반영하려면 --apply.')

    say('\n--- 현재 게시판 분포')
    cur.execute('SELECT board_type_cd, board_category_cd, board_typ, COUNT(*) FROM tbl_board_m GROUP BY 1,2,3 ORDER BY 1,2')
    for r in cur.fetchall():
        say('   ' + ' | '.join(str(v) for v in r))
    conn.close()
    print()


if __name__ == '__main__':
    main()
