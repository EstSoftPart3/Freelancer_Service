# -*- coding: utf-8 -*-
"""
Phase 2 마지막 단계 — TBL_USER_M.user_nickname 를 NOT NULL 로 전환.

Phase 1(docs/phase1-ddl.py)에서 의도적으로 미뤄둔 항목이다.
그때는 가입 코드가 닉네임을 채우지 않아 NOT NULL 을 걸면 회원가입이 즉시 깨졌다.
Phase 2 에서 UserMapper.insertUser 가 user_nickname 을 채우고 가입 폼에 입력 필드가
생겼으므로 이제 안전하다.

전환 전에 다음을 검사하고, 하나라도 걸리면 아무것도 바꾸지 않고 중단한다.
  ① user_nickname 컬럼 존재
  ② NULL 인 행 0건            (있으면 NOT NULL 전환이 실패한다)
  ③ 닉네임 중복 0건            (UNIQUE 는 이미 걸려 있으므로 사실상 보증되지만 재확인)
  ④ 길이가 VARCHAR(20) 이내

멱등하다 — 이미 NOT NULL 이면 건너뛴다.
실행 전 TBL_USER_M 을 파일로 백업한다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/phase2-ddl.py"            # 적용
  !python "C:/dev/Freelancer_Service/docs/phase2-ddl.py" --dry-run  # 실행 계획만 출력
  !python "C:/dev/Freelancer_Service/docs/phase2-ddl.py" --rollback # NULL 허용으로 되돌리기
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
TABLE = 'TBL_USER_M'
COLUMN = 'user_nickname'

DRY_RUN = '--dry-run' in sys.argv
ROLLBACK = '--rollback' in sys.argv


def log(msg=''):
    print(msg, flush=True)


def column_info(cur):
    cur.execute(
        "SELECT column_type, is_nullable FROM information_schema.columns "
        "WHERE table_schema=%s AND table_name=%s AND column_name=%s",
        (SCHEMA, TABLE, COLUMN),
    )
    return cur.fetchone()


def backup(conn):
    stamp = f'{datetime.now():%Y%m%d-%H%M}'
    outdir = f'C:/dev/db-backup/{stamp}-phase2'
    os.makedirs(outdir, exist_ok=True)
    path = os.path.join(outdir, 'phase2-user-table.sql')
    with conn.cursor() as cur, open(path, 'w', encoding='utf-8') as f:
        f.write(f'-- Phase 2 DDL 직전 백업 ({SCHEMA}.{TABLE}) {datetime.now():%Y-%m-%d %H:%M:%S}\n')
        f.write('SET FOREIGN_KEY_CHECKS=0;\n\n')
        cur.execute(f'SHOW CREATE TABLE `{TABLE}`')
        ddl = list(cur.fetchone().values())[1]
        f.write(f'-- ===== {TABLE} =====\n{ddl};\n\n')
        cur.execute(f'SELECT * FROM `{TABLE}`')
        rows = cur.fetchall()
        if rows:
            cols = list(rows[0].keys())
            collist = ', '.join(f'`{c}`' for c in cols)
            for r in rows:
                vals = ', '.join(conn.escape(r[c]) for c in cols)
                f.write(f'INSERT INTO `{TABLE}` ({collist}) VALUES ({vals});\n')
        f.write('\nSET FOREIGN_KEY_CHECKS=1;\n')
    log(f'백업 저장: {path}  ({len(rows)}행)')
    return path


def precheck(cur):
    """전환 가능 여부. 문제가 있으면 SystemExit."""
    info = column_info(cur)
    if info is None:
        raise SystemExit(f'  [중단] {TABLE}.{COLUMN} 컬럼이 없다 — phase1-ddl.py 를 먼저 적용할 것')
    log(f'  현재 정의: {info["column_type"]} / NULL 허용={info["is_nullable"]}')

    cur.execute(f'SELECT COUNT(*) AS cnt FROM {TABLE} WHERE {COLUMN} IS NULL')
    nulls = cur.fetchone()['cnt']
    if nulls:
        cur.execute(f'SELECT user_sq, user_id FROM {TABLE} WHERE {COLUMN} IS NULL LIMIT 10')
        raise SystemExit(
            f'  [중단] {COLUMN} 이 NULL 인 행 {nulls}건 — 먼저 채워야 한다. 예시: {cur.fetchall()}')
    log('  [확인] NULL 행 0건')

    cur.execute(
        f'SELECT {COLUMN}, COUNT(*) AS cnt FROM {TABLE} '
        f'GROUP BY {COLUMN} HAVING COUNT(*) > 1')
    dups = cur.fetchall()
    if dups:
        raise SystemExit(f'  [중단] 닉네임 중복 {len(dups)}건: {dups}')
    log('  [확인] 닉네임 중복 0건')

    cur.execute(f'SELECT MAX(CHAR_LENGTH({COLUMN})) AS maxlen, COUNT(*) AS cnt FROM {TABLE}')
    row = cur.fetchone()
    if row['maxlen'] and row['maxlen'] > 20:
        raise SystemExit(f'  [중단] 최대 길이 {row["maxlen"]}자 > VARCHAR(20)')
    log(f'  [확인] 회원 {row["cnt"]}명 / 최대 길이 {row["maxlen"]}자 ≤ 20')
    return info


def apply_ddl(conn):
    with conn.cursor() as cur:
        log(f'\n{TABLE}.{COLUMN} → NOT NULL')
        info = precheck(cur)

        if info['is_nullable'] == 'NO':
            log('  [스킵] 이미 NOT NULL')
            return

        sql = f'ALTER TABLE {TABLE} MODIFY {COLUMN} VARCHAR(20) NOT NULL'
        if DRY_RUN:
            log(f'  [DRY-RUN] NOT NULL 전환\n            {sql}')
            return
        cur.execute(sql)
        log('  [실행] NOT NULL 전환 완료')

        after = column_info(cur)
        log(f'  검증: {after["column_type"]} / NULL 허용={after["is_nullable"]}')


def rollback_ddl(conn):
    with conn.cursor() as cur:
        log(f'\n[롤백] {TABLE}.{COLUMN} → NULL 허용')
        info = column_info(cur)
        if info is None:
            log('  [스킵] 컬럼 없음')
            return
        if info['is_nullable'] == 'YES':
            log('  [스킵] 이미 NULL 허용')
            return
        sql = f'ALTER TABLE {TABLE} MODIFY {COLUMN} VARCHAR(20) NULL'
        if DRY_RUN:
            log(f'  [DRY-RUN] {sql}')
            return
        cur.execute(sql)
        log('  [실행] NULL 허용으로 되돌림 (UNIQUE 제약은 유지)')


def main():
    mode = 'DRY-RUN' if DRY_RUN else ('ROLLBACK' if ROLLBACK else 'APPLY')
    log('=' * 70)
    log(f'Phase 2 DDL — user_nickname NOT NULL 전환  [{mode}]')
    log(f'대상: {DB["host"]}/{SCHEMA}')
    log('=' * 70)

    conn = pymysql.connect(**DB)
    try:
        if not DRY_RUN:
            backup(conn)
        if ROLLBACK:
            rollback_ddl(conn)
        else:
            apply_ddl(conn)
        if not DRY_RUN:
            conn.commit()
            log('\n커밋 완료')
        else:
            log('\n[DRY-RUN] 실제 변경 없음')
    finally:
        conn.close()
    log('=' * 70)


if __name__ == '__main__':
    main()
