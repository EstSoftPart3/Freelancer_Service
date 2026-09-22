# -*- coding: utf-8 -*-
"""
Phase 3 — 모집 종료일이 수행 종료일보다 늦은 공고 정정.

배경:
  프로젝트 등록/수정에 날짜 간 관계 검증이 전혀 없어서 "3월에 끝나는 프로젝트를
  12월까지 모집"하는 공고가 실제로 저장돼 있다. 이런 공고는 수행이 끝난 뒤에도
  '채용중'으로 판정되어 메인 인기 프로젝트에까지 노출된다.

정정 규칙(사용자 확정):
  - 모집 종료 > 수행 종료  →  모순. 모집 종료를 수행 종료일로 당긴다.
  - 모집 종료 > 수행 시작  →  정상. 수행 중 인력 추가 모집은 허용한다. 건드리지 않는다.
  - 모집 시작 > 모집 종료 / 수행 시작 > 수행 종료  →  탐지해서 보고만 한다.
    (어느 쪽이 옳은지 자동으로 정할 수 없다. 눈으로 보고 결정할 것)

사용법:
  python "C:/dev/Freelancer_Service/docs/phase3-fix-project-dates.py" --dry-run   # 조사만
  python "C:/dev/Freelancer_Service/docs/phase3-fix-project-dates.py"             # 백업 후 적용
  python "C:/dev/Freelancer_Service/docs/phase3-fix-project-dates.py" --rollback  # 백업으로 되돌림

멱등하다 — 이미 정정된 행은 대상에서 빠진다.
DB 비밀번호가 평문이므로 git에 올리지 말 것.
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

DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          database='freelancer_project', charset='utf8mb4', autocommit=False)

BACKUP_ROOT = 'C:/dev/db-backup'
BACKUP_NAME = 'phase3-project-dates.sql'

# 모순 조건: 모집 종료가 수행 종료보다 뒤
BROKEN_WHERE = """
    project_is_deleted_yn = 'N'
    AND project_recruit_end_dt IS NOT NULL
    AND project_end_dt IS NOT NULL
    AND project_recruit_end_dt > project_end_dt
"""


def find_backup_dir():
    """가장 최근의 phase3 백업 디렉터리를 찾는다."""
    if not os.path.isdir(BACKUP_ROOT):
        return None
    cands = sorted(d for d in os.listdir(BACKUP_ROOT) if d.endswith('-phase3'))
    return os.path.join(BACKUP_ROOT, cands[-1]) if cands else None


def survey(cur):
    """정정 대상과 그 밖의 이상 데이터를 조사해 출력한다."""
    cur.execute(f"""
        SELECT project_sq, LEFT(project_ttl, 24),
               project_start_dt, project_end_dt,
               project_recruit_start_dt, project_recruit_end_dt
          FROM TBL_PROJECT_M
         WHERE {BROKEN_WHERE}
         ORDER BY project_sq
    """)
    broken = cur.fetchall()

    print(f'\n[정정 대상] 모집 종료 > 수행 종료 : {len(broken)}건')
    for sq, ttl, ps, pe, rs, re_ in broken:
        print(f'   sq={sq:<5} {ttl:<26} 수행 {ps} ~ {pe} | 모집 {rs} ~ {re_}  →  모집종료를 {pe}로')

    cur.execute("""
        SELECT project_sq, LEFT(project_ttl, 24),
               project_start_dt, project_end_dt,
               project_recruit_start_dt, project_recruit_end_dt
          FROM TBL_PROJECT_M
         WHERE project_is_deleted_yn = 'N'
           AND (project_recruit_start_dt > project_recruit_end_dt
                OR project_start_dt > project_end_dt)
         ORDER BY project_sq
    """)
    reversed_rows = cur.fetchall()
    print(f'\n[보고만 — 자동 정정하지 않음] 시작일 > 종료일 : {len(reversed_rows)}건')
    for sq, ttl, ps, pe, rs, re_ in reversed_rows:
        print(f'   sq={sq:<5} {ttl:<26} 수행 {ps} ~ {pe} | 모집 {rs} ~ {re_}')

    # 참고: 수행 중 추가 모집(정상)이 몇 건인지도 같이 본다 — 규칙이 과잉인지 확인용
    cur.execute("""
        SELECT COUNT(*) FROM TBL_PROJECT_M
         WHERE project_is_deleted_yn = 'N'
           AND project_recruit_end_dt > project_start_dt
           AND project_recruit_end_dt <= project_end_dt
    """)
    print(f'\n[참고] 수행 중 추가 모집(허용되는 정상 케이스) : {cur.fetchone()[0]}건')

    return broken


def backup(cur, rows):
    stamp = datetime.now().strftime('%Y%m%d-%H%M')
    d = os.path.join(BACKUP_ROOT, f'{stamp}-phase3')
    os.makedirs(d, exist_ok=True)
    path = os.path.join(d, BACKUP_NAME)

    with open(path, 'w', encoding='utf-8') as f:
        f.write('-- Phase 3 날짜 정정 전 백업 (모집 종료일 원본)\n')
        f.write(f'-- 생성 {datetime.now():%Y-%m-%d %H:%M:%S}\n\n')
        for sq, _ttl, _ps, _pe, _rs, re_ in rows:
            f.write(f"UPDATE TBL_PROJECT_M SET project_recruit_end_dt = '{re_}' "
                    f"WHERE project_sq = {sq};\n")
    print(f'\n백업 저장: {path} ({len(rows)}행)')
    return path


def apply(conn, cur, rows):
    cur.execute(f"""
        UPDATE TBL_PROJECT_M
           SET project_recruit_end_dt = project_end_dt,
               project_modified_at_dtm = NOW()
         WHERE {BROKEN_WHERE}
    """)
    n = cur.rowcount
    conn.commit()
    print(f'\n적용 완료: {n}행 수정')

    cur.execute(f'SELECT COUNT(*) FROM TBL_PROJECT_M WHERE {BROKEN_WHERE}')
    left = cur.fetchone()[0]
    print(f'검증: 남은 모순 {left}건 ({"OK" if left == 0 else "확인 필요"})')


def rollback(conn, cur):
    d = find_backup_dir()
    if not d:
        print('되돌릴 백업이 없다.')
        return
    path = os.path.join(d, BACKUP_NAME)
    with open(path, encoding='utf-8') as f:
        stmts = [s.strip() for s in f.read().split(';') if s.strip() and not s.strip().startswith('--')]
    for s in stmts:
        cur.execute(s)
    conn.commit()
    print(f'{path} 기준으로 {len(stmts)}행 되돌림')


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--dry-run', action='store_true', help='조사만 하고 아무것도 바꾸지 않는다')
    p.add_argument('--rollback', action='store_true', help='최근 백업으로 되돌린다')
    args = p.parse_args()

    conn = pymysql.connect(**DB)
    cur = conn.cursor()
    try:
        if args.rollback:
            rollback(conn, cur)
            return

        rows = survey(cur)

        if args.dry_run:
            print('\n--dry-run 이므로 아무것도 바꾸지 않았다.')
            return
        if not rows:
            print('\n정정할 것이 없다(멱등).')
            return

        backup(cur, rows)
        apply(conn, cur, rows)
    finally:
        conn.close()


if __name__ == '__main__':
    main()
