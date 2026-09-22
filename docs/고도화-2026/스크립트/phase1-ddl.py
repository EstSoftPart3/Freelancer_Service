# -*- coding: utf-8 -*-
"""
Phase 1 스키마 최소 확장 DDL.

대상: freelancer_project
  ① TBL_USER_M.user_nickname            닉네임 (Phase 2 전면 치환의 선행 조건)
  ② TBL_BOARD_M.board_category_cd       게시판 카테고리 (Phase 4)
  ③ TBL_BOARD_M.board_is_secret_yn      VOC 비공개 플래그 (Phase 5)
  ④ TBL_COMMON_CODE_C                   3200번대 카테고리 / 1404 고객의소리 / 2607 고객의소리답변

전부 멱등하다 — 이미 적용된 항목은 건너뛰므로 재실행해도 안전하다.
실행 전 대상 3개 테이블을 파일로 백업한다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/phase1-ddl.py"            # 적용
  !python "C:/dev/Freelancer_Service/docs/phase1-ddl.py" --dry-run  # 실행 계획만 출력
  !python "C:/dev/Freelancer_Service/docs/phase1-ddl.py" --rollback # 되돌리기

[닉네임을 NOT NULL 로 만들지 않는 이유]
계획 초안은 백필 후 NOT NULL + UNIQUE 였으나, NOT NULL 을 지금 걸면
아직 닉네임을 쓰지 않는 현재 코드(UserMapper.insertUser)의 회원가입이
"컬럼에 기본값 없음" 오류로 즉시 깨진다. 공용 DB라 다른 팀원 로컬도 같이 죽는다.
UNIQUE 는 NULL 을 중복 허용하므로 지금 걸어도 안전하다.
→ NULL 허용 + UNIQUE 로 두고, NOT NULL 전환은 가입 코드가 닉네임을 채우는
   Phase 2 마지막 단계에서 수행한다.
"""
import os
import sys
from datetime import datetime

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_project', charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor,
)
SCHEMA = 'freelancer_project'
BACKUP_TABLES = ['TBL_USER_M', 'TBL_BOARD_M', 'TBL_COMMON_CODE_C']

# (sq, parent, lvl, 한글명, 영문명)
NEW_CODES = [
    (3200, None, 1, '게시판_카테고리', 'BOARD_CATEGORY'),
    (3201, 3200, 2, '자유', 'FREE'),
    (3202, 3200, 2, '일반', 'GENERAL'),
    (3203, 3200, 2, '현장정보', 'FIELD_INFO'),
    (3204, 3200, 2, '기능요청', 'FEATURE_REQUEST'),
    (1404, 1400, 2, '고객의소리', 'VOC'),
    (2607, 2600, 2, '고객의소리 답변', 'VOC_ANSWER'),
]

DRY_RUN = '--dry-run' in sys.argv
ROLLBACK = '--rollback' in sys.argv


def log(msg=''):
    print(msg, flush=True)


def has_column(cur, table, column):
    cur.execute(
        "SELECT COUNT(*) AS cnt FROM information_schema.columns "
        "WHERE table_schema=%s AND table_name=%s AND column_name=%s",
        (SCHEMA, table, column),
    )
    return cur.fetchone()['cnt'] > 0


def has_index(cur, table, index):
    cur.execute(
        "SELECT COUNT(*) AS cnt FROM information_schema.statistics "
        "WHERE table_schema=%s AND table_name=%s AND index_name=%s",
        (SCHEMA, table, index),
    )
    return cur.fetchone()['cnt'] > 0


def run(cur, sql, label):
    if DRY_RUN:
        log(f'  [DRY-RUN] {label}')
        log(f'            {sql}')
        return
    cur.execute(sql)
    log(f'  [실행] {label}')


def backup(conn):
    stamp = f'{datetime.now():%Y%m%d-%H%M}'
    outdir = f'C:/dev/db-backup/{stamp}-phase1'
    os.makedirs(outdir, exist_ok=True)
    path = os.path.join(outdir, 'phase1-tables.sql')
    counts = {}
    with conn.cursor() as cur, open(path, 'w', encoding='utf-8') as f:
        f.write(f'-- Phase 1 DDL 직전 백업 ({SCHEMA}) {datetime.now():%Y-%m-%d %H:%M:%S}\n')
        f.write('SET FOREIGN_KEY_CHECKS=0;\n\n')
        for table in BACKUP_TABLES:
            cur.execute(f'SHOW CREATE TABLE `{table}`')
            ddl = list(cur.fetchone().values())[1]
            f.write(f'-- ===== {table} =====\n{ddl};\n\n')
            cur.execute(f'SELECT * FROM `{table}`')
            rows = cur.fetchall()
            counts[table] = len(rows)
            if rows:
                cols = list(rows[0].keys())
                collist = ', '.join(f'`{c}`' for c in cols)
                for r in rows:
                    vals = ', '.join(conn.escape(r[c]) for c in cols)
                    f.write(f'INSERT INTO `{table}` ({collist}) VALUES ({vals});\n')
                f.write('\n')
        f.write('SET FOREIGN_KEY_CHECKS=1;\n')
    log(f'백업 저장: {path}')
    for t, c in counts.items():
        log(f'  - {t}: {c}행')
    return path


def apply_ddl(conn):
    with conn.cursor() as cur:
        log('\n① TBL_USER_M.user_nickname')
        if has_column(cur, 'TBL_USER_M', 'user_nickname'):
            log('  [스킵] 이미 존재')
        else:
            run(cur,
                "ALTER TABLE TBL_USER_M ADD COLUMN user_nickname VARCHAR(20) NULL AFTER user_nm",
                '컬럼 추가 (NULL 허용 — NOT NULL 전환은 Phase 2)')

        if not DRY_RUN:
            cur.execute(
                "UPDATE TBL_USER_M SET user_nickname = user_id WHERE user_nickname IS NULL")
            log(f'  [실행] 백필 {cur.rowcount}행 (user_nickname ← user_id)')
            cur.execute(
                "SELECT user_nickname, COUNT(*) AS cnt FROM TBL_USER_M "
                "WHERE user_nickname IS NOT NULL GROUP BY user_nickname HAVING COUNT(*) > 1")
            dups = cur.fetchall()
            if dups:
                raise SystemExit(f'  [중단] 닉네임 중복 {len(dups)}건 — UNIQUE 적용 불가: {dups}')
            log('  [확인] 닉네임 중복 0건 → UNIQUE 적용 가능')
        else:
            log('  [DRY-RUN] 백필 + 중복 확인')

        if has_index(cur, 'TBL_USER_M', 'uk_user_nickname'):
            log('  [스킵] uk_user_nickname 이미 존재')
        else:
            run(cur,
                "ALTER TABLE TBL_USER_M ADD UNIQUE KEY uk_user_nickname (user_nickname)",
                'UNIQUE 제약 추가')

        log('\n② TBL_BOARD_M.board_category_cd')
        if has_column(cur, 'TBL_BOARD_M', 'board_category_cd'):
            log('  [스킵] 이미 존재')
        else:
            run(cur,
                "ALTER TABLE TBL_BOARD_M ADD COLUMN board_category_cd BIGINT NULL AFTER board_type_cd",
                '컬럼 추가 (NULL = 미분류, 기존 글은 자유로 해석)')

        if has_index(cur, 'TBL_BOARD_M', 'idx_board_type_category'):
            log('  [스킵] idx_board_type_category 이미 존재')
        else:
            run(cur,
                "ALTER TABLE TBL_BOARD_M ADD INDEX idx_board_type_category "
                "(board_type_cd, board_category_cd, board_is_deleted_yn)",
                '복합 인덱스 추가 (현재 PRIMARY 외 인덱스가 없음)')

        log('\n③ TBL_BOARD_M.board_is_secret_yn')
        if has_column(cur, 'TBL_BOARD_M', 'board_is_secret_yn'):
            log('  [스킵] 이미 존재')
        else:
            run(cur,
                "ALTER TABLE TBL_BOARD_M ADD COLUMN board_is_secret_yn CHAR(1) NOT NULL DEFAULT 'N'",
                "컬럼 추가 (DEFAULT 'N' 이라 기존 코드 INSERT 무영향)")

        log('\n④ TBL_COMMON_CODE_C 신규 코드')
        for sq, parent, lvl, nm, eng in NEW_CODES:
            cur.execute("SELECT COUNT(*) AS cnt FROM TBL_COMMON_CODE_C WHERE common_code_sq=%s", (sq,))
            if cur.fetchone()['cnt'] > 0:
                log(f'  [스킵] {sq} {nm} — 이미 존재')
                continue
            if DRY_RUN:
                log(f'  [DRY-RUN] INSERT {sq} {nm} (parent={parent}, lvl={lvl}, eng={eng})')
                continue
            cur.execute(
                "INSERT INTO TBL_COMMON_CODE_C "
                "(common_code_sq, parent_common_code_sq, common_code_lvl, common_code_nm, "
                " common_code_english_nm, common_code_is_active_yn) "
                "VALUES (%s, %s, %s, %s, %s, 'Y')",
                (sq, parent, lvl, nm, eng),
            )
            log(f'  [실행] INSERT {sq} {nm} (parent={parent}, lvl={lvl})')


def rollback(conn):
    """되돌리기 — 추가한 것만 제거한다. 백필된 닉네임 값은 컬럼과 함께 사라진다."""
    with conn.cursor() as cur:
        log('\n[롤백] 신규 공통코드 삭제')
        sqs = ','.join(str(c[0]) for c in NEW_CODES)
        cur.execute(f"DELETE FROM TBL_COMMON_CODE_C WHERE common_code_sq IN ({sqs})")
        log(f'  삭제 {cur.rowcount}행')

        log('[롤백] TBL_BOARD_M')
        if has_index(cur, 'TBL_BOARD_M', 'idx_board_type_category'):
            cur.execute("ALTER TABLE TBL_BOARD_M DROP INDEX idx_board_type_category")
            log('  idx_board_type_category 삭제')
        if has_column(cur, 'TBL_BOARD_M', 'board_is_secret_yn'):
            cur.execute("ALTER TABLE TBL_BOARD_M DROP COLUMN board_is_secret_yn")
            log('  board_is_secret_yn 삭제')
        if has_column(cur, 'TBL_BOARD_M', 'board_category_cd'):
            cur.execute("ALTER TABLE TBL_BOARD_M DROP COLUMN board_category_cd")
            log('  board_category_cd 삭제')

        log('[롤백] TBL_USER_M')
        if has_index(cur, 'TBL_USER_M', 'uk_user_nickname'):
            cur.execute("ALTER TABLE TBL_USER_M DROP INDEX uk_user_nickname")
            log('  uk_user_nickname 삭제')
        if has_column(cur, 'TBL_USER_M', 'user_nickname'):
            cur.execute("ALTER TABLE TBL_USER_M DROP COLUMN user_nickname")
            log('  user_nickname 삭제')


def verify(conn):
    with conn.cursor() as cur:
        log('\n' + '=' * 60)
        log('검증')
        log('=' * 60)
        cur.execute(
            "SELECT column_name, column_type, is_nullable, column_default "
            "FROM information_schema.columns "
            "WHERE table_schema=%s AND table_name IN ('TBL_USER_M','TBL_BOARD_M') "
            "AND column_name IN ('user_nickname','board_category_cd','board_is_secret_yn')",
            (SCHEMA,))
        rows = cur.fetchall()
        if not rows:
            log('  (신규 컬럼 없음)')
        for r in rows:
            log(f"  컬럼 {r['column_name']:<20} {r['column_type']:<12} "
                f"NULL={r['is_nullable']} DEFAULT={r['column_default']}")

        for table, index in (('TBL_USER_M', 'uk_user_nickname'),
                             ('TBL_BOARD_M', 'idx_board_type_category')):
            log(f"  인덱스 {index:<28} 존재={has_index(cur, table, index)}")

        if has_column(cur, 'TBL_USER_M', 'user_nickname'):
            cur.execute(
                "SELECT COUNT(*) AS total, SUM(user_nickname IS NULL) AS nulls, "
                "COUNT(DISTINCT user_nickname) AS uniq FROM TBL_USER_M")
            r = cur.fetchone()
            log(f"  닉네임 백필: 총 {r['total']}명 / NULL {r['nulls']}명 / 고유 {r['uniq']}개")

        cur.execute(
            "SELECT common_code_sq, common_code_nm, parent_common_code_sq "
            "FROM TBL_COMMON_CODE_C WHERE common_code_sq IN (3200,3201,3202,3203,3204,1404,2607) "
            "ORDER BY common_code_sq")
        codes = cur.fetchall()
        log(f'  신규 공통코드 {len(codes)}/7건')
        for c in codes:
            log(f"    {c['common_code_sq']:<6} {c['common_code_nm']:<18} parent={c['parent_common_code_sq']}")


def main():
    mode = '롤백' if ROLLBACK else ('DRY-RUN' if DRY_RUN else '적용')
    log(f'Phase 1 DDL — 모드: {mode} / 대상: {SCHEMA}')

    conn = pymysql.connect(**DB, autocommit=False)
    try:
        if not DRY_RUN:
            backup(conn)
        if ROLLBACK:
            rollback(conn)
        else:
            apply_ddl(conn)
        if DRY_RUN:
            conn.rollback()
            log('\nDRY-RUN 종료 — 아무것도 변경하지 않았다.')
        else:
            conn.commit()
            log('\n커밋 완료')
        verify(conn)
    except Exception:
        conn.rollback()
        log('\n오류로 롤백했다.')
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
