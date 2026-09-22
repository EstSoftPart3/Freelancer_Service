# -*- coding: utf-8 -*-
"""
DB 복구 스크립트 — docs/도구/db-backup.py 가 만든 .sql 을 되돌린다.

로컬에 mysql 클라이언트가 없어서 pymysql 로 직접 실행한다.

사용법:
  # 1) 무엇이 실행될지 먼저 확인 (기본값, 아무것도 바꾸지 않음)
  !python "C:/dev/Freelancer_Service/docs/도구/db-restore.py" --file "C:/dev/db-backup/20260728-1748/freelancer_education.sql" --schema freelancer_education

  # 2) 실제 복구
  !python "C:/dev/Freelancer_Service/docs/도구/db-restore.py" --file "..." --schema ... --execute

  # 특정 테이블만 복구하고 싶을 때
  !python "..." --file "..." --schema ... --tables tbl_point_m,tbl_banner_s --execute

주의: 덤프에 DROP TABLE IF EXISTS 가 들어 있으므로 대상 스키마의
      동명 테이블은 덮어쓰인다. --schema 를 반드시 확인할 것.
"""
import os
import argparse
import re
import sys

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    charset='utf8mb4', autocommit=False,
)

# 덤프는 "-- ---------- 테이블명 ----------" 로 테이블 구획이 나뉜다
SECTION = re.compile(r'^-- -{10} (\S+) -{10}$')


def split_statements(sql_text):
    """덤프 파일을 문장 단위로 자른다. 문장은 항상 ';\\n' 로 끝난다
    (값 안의 개행은 escape 되어 실제 개행이 아니므로 안전)."""
    stmts, buf = [], []
    for line in sql_text.splitlines(keepends=True):
        if line.startswith('--') and not buf:
            continue
        buf.append(line)
        if line.rstrip().endswith(';'):
            s = ''.join(buf).strip()
            if s:
                stmts.append(s)
            buf = []
    if buf and ''.join(buf).strip():
        stmts.append(''.join(buf).strip())
    return stmts


def parse_by_table(sql_text):
    """{테이블명: [문장,...]} 로 묶는다."""
    blocks, cur_tbl, cur_lines = {}, None, []
    for line in sql_text.splitlines(keepends=True):
        m = SECTION.match(line.rstrip('\n'))
        if m:
            if cur_tbl:
                blocks[cur_tbl] = ''.join(cur_lines)
            cur_tbl, cur_lines = m.group(1), []
            continue
        if cur_tbl:
            cur_lines.append(line)
    if cur_tbl:
        blocks[cur_tbl] = ''.join(cur_lines)
    return blocks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--file', required=True, help='복구할 .sql 파일 경로')
    ap.add_argument('--schema', required=True, help='복구 대상 스키마명')
    ap.add_argument('--tables', help='쉼표로 구분한 테이블 목록. 생략 시 전체')
    ap.add_argument('--execute', action='store_true', help='실제 실행. 없으면 계획만 출력')
    args = ap.parse_args()
    dry = not args.execute

    with open(args.file, encoding='utf-8') as f:
        sql_text = f.read()

    blocks = parse_by_table(sql_text)
    want = [t.strip() for t in args.tables.split(',')] if args.tables else list(blocks)
    missing = [t for t in want if t not in blocks]
    if missing:
        print(f'[중단] 덤프에 없는 테이블: {missing}')
        print(f'       덤프에 있는 테이블: {sorted(blocks)}')
        return

    print('=' * 66)
    print(f'복구 대상 스키마 : {args.schema}')
    print(f'덤프 파일        : {args.file}')
    print(f'테이블           : {len(want)}개 / 덤프 전체 {len(blocks)}개')
    print(f'모드             : {"DRY RUN (변경 없음)" if dry else "*** 실제 실행 ***"}')
    print('=' * 66)

    plan = []
    for t in want:
        stmts = split_statements(blocks[t])
        inserts = sum(1 for s in stmts if s.upper().startswith('INSERT'))
        plan.append((t, stmts, inserts))
        print(f'  {t:48s} 문장 {len(stmts):>3}개 (INSERT {inserts})')

    if dry:
        print()
        print('DROP TABLE IF EXISTS 가 포함되어 있어 대상 스키마의 동명 테이블은 덮어쓰입니다.')
        print('맞으면 --execute 를 붙여 다시 실행하세요.')
        return

    conn = pymysql.connect(database=args.schema, **DB)
    cur = conn.cursor()
    cur.execute('SET NAMES utf8mb4')
    cur.execute('SET FOREIGN_KEY_CHECKS=0')

    done = 0
    for t, stmts, _ in plan:
        for s in stmts:
            if s.upper().startswith(('SET ', 'DROP TABLE IF EXISTS `')) and 'FOREIGN_KEY' in s.upper():
                continue
            cur.execute(s)
        conn.commit()
        cur.execute(f'SELECT COUNT(*) FROM `{t}`')
        print(f'  복구 {t:48s} {cur.fetchone()[0]:>7,}행')
        done += 1

    cur.execute('SET FOREIGN_KEY_CHECKS=1')
    conn.commit()
    conn.close()
    print()
    print(f'완료 — {done}개 테이블 복구')


if __name__ == '__main__':
    main()
