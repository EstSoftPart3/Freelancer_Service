# -*- coding: utf-8 -*-
"""
백업 복구 리허설 — 백업이 실제로 되돌아가는지 증명한다.

잔재 테이블 31개는 영구 삭제되므로, 삭제 전에 "백업 파일로 복원이 된다"는 것을
실물로 확인해야 한다. 임시 스키마에 복원해보고 행수를 대조한 뒤 임시 스키마를 지운다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/도구/db-restore-drill.py"

기존 스키마는 건드리지 않는다. 임시 스키마 freelancer_drill_test 만 만들었다 지운다.
"""
import os
import glob
import re
import sys

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DRILL = 'freelancer_drill_test'
DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          charset='utf8mb4', autocommit=False)

# 삭제 예정 잔재 중 데이터가 있는 것들 + 앱 핵심 테이블을 섞어서 검증
TARGETS = ['tbl_chatmessages_s', 'tbl_audit_log_m', 'tbl_point_history_m',
           'tbl_banner_s', 'tbl_resume_link_s', 'tbl_interview_s',
           'tbl_user_m', 'tbl_board_m']

SECTION = re.compile(r'^-- -{10} (\S+) -{10}$')


def parse_by_table(text):
    blocks, tbl, buf = {}, None, []
    for line in text.splitlines(keepends=True):
        m = SECTION.match(line.rstrip('\n'))
        if m:
            if tbl:
                blocks[tbl] = ''.join(buf)
            tbl, buf = m.group(1), []
            continue
        if tbl:
            buf.append(line)
    if tbl:
        blocks[tbl] = ''.join(buf)
    return blocks


def split_statements(text):
    stmts, buf = [], []
    for line in text.splitlines(keepends=True):
        if line.startswith('--') and not buf:
            continue
        buf.append(line)
        if line.rstrip().endswith(';'):
            s = ''.join(buf).strip()
            if s:
                stmts.append(s)
            buf = []
    return stmts


def main():
    found = sorted(glob.glob('C:/dev/db-backup/*/freelancer_education.sql'))
    if not found:
        print('[중단] 백업 파일이 없습니다. 먼저 docs/도구/db-backup.py 를 실행하세요.')
        return
    path = found[-1]
    print(f'백업 파일: {path}\n')

    with open(path, encoding='utf-8') as f:
        blocks = parse_by_table(f.read())

    targets = [t for t in TARGETS if t in blocks]

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    # 원본 행수 (대조 기준)
    print('원본 행수 확인')
    origin = {}
    for t in targets:
        cur.execute(f'SELECT COUNT(*) FROM `freelancer_education`.`{t}`')
        origin[t] = cur.fetchone()[0]
        print(f'  {t:36s} {origin[t]:>7,}행')
    print()

    # 임시 스키마에 복원
    print(f'임시 스키마 {DRILL} 에 복원 시도')
    cur.execute(f'DROP DATABASE IF EXISTS `{DRILL}`')
    cur.execute(f'CREATE DATABASE `{DRILL}` DEFAULT CHARACTER SET utf8mb4 '
                f'COLLATE utf8mb4_general_ci')
    conn.commit()
    conn.close()

    conn = pymysql.connect(database=DRILL, **DB)
    cur = conn.cursor()
    cur.execute('SET NAMES utf8mb4')
    cur.execute('SET FOREIGN_KEY_CHECKS=0')

    restored, failed = {}, []
    for t in targets:
        try:
            for s in split_statements(blocks[t]):
                cur.execute(s)
            conn.commit()
            cur.execute(f'SELECT COUNT(*) FROM `{t}`')
            restored[t] = cur.fetchone()[0]
        except Exception as e:
            failed.append((t, f'{e.__class__.__name__}: {e}'))
            conn.rollback()

    # 대조
    print()
    print('복원 결과 대조')
    print(f'  {"테이블":36s} {"원본":>8} {"복원":>8}  판정')
    ok_all = True
    for t in targets:
        r = restored.get(t)
        ok = (r == origin[t])
        ok_all = ok_all and ok
        print(f'  {t:36s} {origin[t]:>8,} {("-" if r is None else f"{r:,}"):>8}  '
              f'{"OK" if ok else "!! 불일치"}')
    if failed:
        ok_all = False
        print()
        print('복원 실패:')
        for t, e in failed:
            print(f'  {t}: {e}')

    # 정리
    conn.close()
    conn = pymysql.connect(**DB)
    cur = conn.cursor()
    cur.execute(f'DROP DATABASE IF EXISTS `{DRILL}`')
    conn.commit()
    conn.close()
    print(f'\n임시 스키마 {DRILL} 삭제 완료')

    print()
    print('=' * 60)
    if ok_all:
        print('리허설 성공 — 백업으로 복구 가능함이 확인됐습니다.')
        print('이제 이관을 진행해도 됩니다:')
        print('  python docs/db-migrate.py            (계획 확인)')
        print('  python docs/db-migrate.py --execute  (실행)')
    else:
        print('*** 리허설 실패 — 이관을 진행하지 마세요. ***')
        print('백업으로 되돌릴 수 없는 상태에서 잔재 테이블을 지우면 데이터가 영구 소실됩니다.')


if __name__ == '__main__':
    main()
