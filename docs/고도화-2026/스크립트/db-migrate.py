# -*- coding: utf-8 -*-
"""
DB 이관 실행 스크립트 (Phase 0-C).

freelancer_education(현행) → freelancer_project(옮겨갈 곳)
앱 실사용 43개 테이블만 대상으로 하며, freelancer_project의 해당 테이블은
백업 후 완전 교체한다. 두 DB의 PK가 어긋나 있어 병합은 불가능하다.

사용법:
  1) 먼저 반드시 DRY RUN 으로 계획을 확인한다 (기본값)
       !python "C:/dev/Freelancer_Service/docs/db-migrate.py"
  2) 계획이 맞으면 실행
       !python "C:/dev/Freelancer_Service/docs/db-migrate.py" --execute

동작:
  1. 백업   freelancer_project 의 대상 테이블을 freelancer_project_bak_YYYYMMDD 스키마로 복제
  2. 정리   freelancer_project 의 대상 테이블 + Hibernate 고아 테이블 DROP
  3. 이관   freelancer_education 의 대상 테이블 스키마+데이터 복사 (AUTO_INCREMENT 승계)
  4. 검증   양쪽 COUNT(*) / MAX(pk) 대조

보존 대상(건드리지 않음): tbl_faq_m, tb_faq_m (우리 코드 미사용이나 남의 데이터)
freelancer_education 은 어떤 경우에도 읽기만 한다.
"""
import os
import sys
import argparse
from datetime import datetime

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

SRC = 'freelancer_education'
DST = 'freelancer_project'
BAK = f'freelancer_project_bak_{datetime.now():%Y%m%d}'

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, autocommit=False,
)

# 매퍼 XML에서 추출한 앱 실사용 테이블 (docs/고도화-실행계획.md Phase 0-A 참조)
APP_TABLES = """
tbl_address_s tbl_area_c tbl_board_answer_attachment_s tbl_board_answer_s
tbl_board_attachment_s tbl_board_comment_s tbl_board_m tbl_board_normal_tag_s
tbl_board_skill_tag_s tbl_certificate_s tbl_common_code_c tbl_common_file_s
tbl_company_application_h tbl_company_member_r tbl_company_profile_image_s tbl_company_s
tbl_company_tag_s tbl_notification_m tbl_project_application_h tbl_project_contract_type_s
tbl_project_interview_time_slot_s tbl_project_m tbl_project_preferred_skill_tag_s
tbl_project_recruit_job_role_s tbl_project_required_skill_tag_s tbl_recommendation_s
tbl_report_s tbl_resume_attachment_s tbl_resume_career_s tbl_resume_certification_s
tbl_resume_education_s tbl_resume_m tbl_resume_profile_image_s tbl_resume_project_history_s
tbl_resume_project_history_skill_tag_s tbl_resume_skill_tag_s tbl_resume_training_history_s
tbl_schedule_m tbl_scrap_s tbl_skill_tag_c tbl_user_m tbl_user_online_s
tbl_user_profile_image_s
""".split()

# @Entity 잔재로 Hibernate 가 만들었던 빈 테이블 (Phase 0-B 에서 원인 제거 완료). 전부 0행.
ORPHAN_TABLES = """
address answer areacd board boardattachment boardattachmentresponse career comment
commonskilltag companyapplication normaltag recommendation resumeskilltag scrap skilltag
""".split()

# 다른 기수 프로젝트 잔재 — freelancer_education 에만 있고 우리 백엔드가 참조하지 않는다.
# 사용자 지시로 삭제 대상에 포함(2026-07-28). 일부는 실데이터가 있으므로
# 반드시 docs/db-backup.py 로 파일 백업을 먼저 받은 뒤 실행할 것.
LEGACY_TABLES = """
p2_tbl_apply_h p2_tbl_area_code_s p2_tbl_job_code_s p2_tbl_job_posting_m
p2_tbl_resume_attachment_s p2_tbl_resume_career_s p2_tbl_resume_certificate_s
p2_tbl_resume_education_s p2_tbl_resume_m p2_tbl_resume_selfintroduction_s
p2_tbl_skill_code_resume_r p2_tbl_skill_code_s
p3_tbl_board p3_tbl_board_answer p3_tbl_board_comment
p3_tbl_enterprise_member_m p3_tbl_member_m
tb_board tbl_sample
tbl_attendance_m tbl_audit_log_m tbl_banner_s tbl_chatmessages_s tbl_chatroom_s
tbl_freelancer_member tbl_freelancer_profile_image_s tbl_interview_s
tbl_point_history_m tbl_point_m tbl_point_policy_m tbl_resume_link_s
""".split()

# 남의 데이터 — 절대 건드리지 않는다 (freelancer_project 쪽)
PROTECTED = ['tbl_faq_m', 'tb_faq_m']

# 양쪽에 있으나 앱 미사용(0행). 사용자 지시로 양쪽에서 삭제(2026-07-28).
UNUSED_BOTH = ['tbl_schedule_evnt']


def log(msg=''):
    print(msg, flush=True)


def table_exists(cur, schema, tn):
    cur.execute("SELECT COUNT(*) c FROM information_schema.tables "
                "WHERE table_schema=%s AND table_name=%s", (schema, tn))
    return cur.fetchone()['c'] > 0


def count(cur, schema, tn):
    try:
        cur.execute(f'SELECT COUNT(*) c FROM `{schema}`.`{tn}`')
        return cur.fetchone()['c']
    except Exception:
        return None


def auto_inc(cur, schema, tn):
    cur.execute("SELECT auto_increment ai FROM information_schema.tables "
                "WHERE table_schema=%s AND table_name=%s", (schema, tn))
    r = cur.fetchone()
    return r['ai'] if r else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--execute', action='store_true',
                    help='실제로 실행한다. 없으면 계획만 출력(DRY RUN).')
    ap.add_argument('--skip-backup-check', action='store_true',
                    help='파일 백업 존재 확인을 건너뛴다.')
    args = ap.parse_args()
    dry = not args.execute

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    log('=' * 70)
    log(f'DB 이관  {SRC}  →  {DST}')
    log(f'모드: {"DRY RUN (아무것도 변경하지 않음)" if dry else "*** 실제 실행 ***"}')
    log(f'백업 스키마: {BAK}')
    log('=' * 70)
    log()

    # ── 사전 점검 ─────────────────────────────────────────────
    missing_src = [t for t in APP_TABLES if not table_exists(cur, SRC, t)]
    if missing_src:
        log(f'[중단] {SRC} 에 없는 테이블: {missing_src}')
        return

    present_dst = [t for t in APP_TABLES if table_exists(cur, DST, t)]
    orphans_dst = [t for t in ORPHAN_TABLES if table_exists(cur, DST, t)]
    orphans_src = [t for t in ORPHAN_TABLES if table_exists(cur, SRC, t)]
    legacy_src = [t for t in LEGACY_TABLES if table_exists(cur, SRC, t)]
    unused_src = [t for t in UNUSED_BOTH if table_exists(cur, SRC, t)]
    unused_dst = [t for t in UNUSED_BOTH if table_exists(cur, DST, t)]

    log(f'이관 대상        : {len(APP_TABLES)}개')
    log(f'DST 기존 테이블  : {len(present_dst)}개 (백업 후 교체)')
    log(f'DST 고아 테이블  : {len(orphans_dst)}개 (DROP)')
    log(f'DST 미사용 테이블: {len(unused_dst)}개 (DROP) {unused_dst}')
    log(f'SRC 고아 테이블  : {len(orphans_src)}개 (DROP)')
    log(f'SRC 잔재 테이블  : {len(legacy_src)}개 (DROP — 다른 기수 프로젝트)')
    log(f'SRC 미사용 테이블: {len(unused_src)}개 (DROP) {unused_src}')
    log(f'보존            : {PROTECTED} (DST 쪽)')
    log()

    total_rows = sum(count(cur, SRC, t) or 0 for t in APP_TABLES)
    log(f'옮길 총 행수: {total_rows:,}')
    log()

    # 잔재 중 데이터가 있는 것은 경고
    with_data = [(t, count(cur, SRC, t)) for t in legacy_src]
    with_data = [(t, c) for t, c in with_data if c]
    if with_data:
        log(f'!! 삭제될 잔재 테이블 중 데이터가 있는 것 {len(with_data)}개:')
        for t, c in sorted(with_data, key=lambda x: -x[1]):
            log(f'     {t:40s} {c:>6,}행')
        log('   docs/db-backup.py 로 파일 백업을 먼저 받았는지 확인하세요.')
        log()

    if dry:
        log('--- 실행될 작업 순서 ---')
        log(f'1. CREATE DATABASE `{BAK}`')
        log(f'2. {len(present_dst)}개 테이블을 {DST} → {BAK} 로 복제(DB 내 백업)')
        log(f'3. {DST} 에서 대상 {len(present_dst)}개 + 고아 {len(orphans_dst)}개 '
            f'+ 미사용 {len(unused_dst)}개 DROP')
        log(f'4. {SRC} → {DST} 로 {len(APP_TABLES)}개 테이블 스키마+데이터 복사')
        log(f'5. {SRC} 에서 고아 {len(orphans_src)}개 + 잔재 {len(legacy_src)}개 '
            f'+ 미사용 {len(unused_src)}개 DROP')
        log('6. 행수/AUTO_INCREMENT 대조 검증')
        log()
        log('문제 없으면 --execute 를 붙여 다시 실행하세요.')
        conn.close()
        return

    # 파일 백업 여부 확인 (잔재 삭제는 되돌릴 수 없으므로)
    if legacy_src and not args.skip_backup_check:
        import glob
        found = sorted(glob.glob('C:/dev/db-backup/*/freelancer_education.sql'))
        if not found:
            log('[중단] 파일 백업이 없습니다. 잔재 테이블 삭제는 되돌릴 수 없습니다.')
            log('       먼저 실행:  python docs/db-backup.py')
            log('       (백업을 받았는데도 이 메시지가 뜨면 --skip-backup-check)')
            conn.close()
            return
        log(f'파일 백업 확인: {found[-1]}')
        log()

    # ── 1. 백업 스키마 생성 ───────────────────────────────────
    log(f'[1/6] 백업 스키마 생성: {BAK}')
    cur.execute(f'CREATE DATABASE IF NOT EXISTS `{BAK}` '
                f'DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci')
    conn.commit()

    # ── 2. DST 백업 ───────────────────────────────────────────
    log(f'[2/6] {DST} 백업 → {BAK} ({len(present_dst)}개)')
    cur.execute('SET FOREIGN_KEY_CHECKS=0')
    for t in present_dst:
        cur.execute(f'CREATE TABLE `{BAK}`.`{t}` LIKE `{DST}`.`{t}`')
        cur.execute(f'INSERT INTO `{BAK}`.`{t}` SELECT * FROM `{DST}`.`{t}`')
        log(f'      {t} ({count(cur, BAK, t)}행)')
    conn.commit()

    # ── 3. DST 정리 ───────────────────────────────────────────
    log(f'[3/6] {DST} DROP — 대상 {len(present_dst)}개 + 고아 {len(orphans_dst)}개 '
        f'+ 미사용 {len(unused_dst)}개')
    for t in present_dst + orphans_dst + unused_dst:
        if t in PROTECTED:
            log(f'      [보호] {t} 건너뜀')
            continue
        cur.execute(f'DROP TABLE IF EXISTS `{DST}`.`{t}`')
    conn.commit()

    # ── 4. 이관 ───────────────────────────────────────────────
    log(f'[4/6] {SRC} → {DST} 복사 ({len(APP_TABLES)}개)')
    for t in APP_TABLES:
        cur.execute(f'CREATE TABLE `{DST}`.`{t}` LIKE `{SRC}`.`{t}`')
        cur.execute(f'INSERT INTO `{DST}`.`{t}` SELECT * FROM `{SRC}`.`{t}`')
        ai = auto_inc(cur, SRC, t)
        if ai:
            cur.execute(f'ALTER TABLE `{DST}`.`{t}` AUTO_INCREMENT={int(ai)}')
        log(f'      {t} ({count(cur, DST, t)}행)')
    conn.commit()

    # ── 5. SRC 정리 (고아 + 다른 기수 잔재) ───────────────────
    log(f'[5/6] {SRC} 정리 — 고아 {len(orphans_src)}개 + 잔재 {len(legacy_src)}개 '
        f'+ 미사용 {len(unused_src)}개 DROP')
    for t in orphans_src:
        cur.execute(f'DROP TABLE IF EXISTS `{SRC}`.`{t}`')
        log(f'      [고아] {t}')
    for t in legacy_src:
        n = count(cur, SRC, t)
        cur.execute(f'DROP TABLE IF EXISTS `{SRC}`.`{t}`')
        log(f'      [잔재] {t} ({n}행)')
    for t in unused_src:
        n = count(cur, SRC, t)
        cur.execute(f'DROP TABLE IF EXISTS `{SRC}`.`{t}`')
        log(f'      [미사용] {t} ({n}행)')
    conn.commit()
    cur.execute('SET FOREIGN_KEY_CHECKS=1')

    # ── 6. 검증 ───────────────────────────────────────────────
    log('[6/6] 검증 — 행수 / AUTO_INCREMENT 대조')
    bad = []
    for t in APP_TABLES:
        sc, dc = count(cur, SRC, t), count(cur, DST, t)
        sa, da = auto_inc(cur, SRC, t), auto_inc(cur, DST, t)
        ok = (sc == dc) and (sa == da)
        if not ok:
            bad.append((t, sc, dc, sa, da))
        log(f'      {"OK " if ok else "!! "} {t}: {sc}행/{dc}행  AI {sa}/{da}')
    log()
    if bad:
        log(f'*** 불일치 {len(bad)}건 ***')
        for t, sc, dc, sa, da in bad:
            log(f'  {t}: SRC {sc}행 AI {sa} vs DST {dc}행 AI {da}')
    else:
        log('전 테이블 일치. 이관 성공.')
    log()
    log('다음 단계:')
    log(f'  1) application.yml 의 datasource.url 을 {SRC} → {DST} 로 변경')
    log('  2) ./gradlew bootRun 후 로그인/게시글/프로젝트/마이페이지 스모크')
    log(f'  3) 문제 시 롤백: url 을 {SRC} 로 원복 (원본은 그대로 보존됨)')
    log(f'  4) DST 이전 데이터가 필요하면 백업 스키마 {BAK} 에 있음')

    conn.close()


if __name__ == '__main__':
    main()
