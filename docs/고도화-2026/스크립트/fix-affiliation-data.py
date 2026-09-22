# -*- coding: utf-8 -*-
"""
BO 유저목록 행 중복의 잔여 데이터 정리 + 재발 방지 제약.

PR #310에서 쿼리는 이미 고쳤다(활성소속 판정 조건 보강 + GROUP BY).
이 스크립트는 그 원인이 된 데이터 자체를 정리하고, 같은 불일치가 다시 생기지 않도록 제약을 건다.

① 소속 상태 불일치 교정
   `company_member_leave_dt`(퇴사일)는 있는데 `company_member_status_cd`가 401(소속중)로 남은 행.
   현재 코드의 퇴사 경로 3곳(AdminUsersMapper.updateCompanyMemberLeave /
   AffiliationMapper.updateMemberToResigned / CompanyMapper.updateMemberToResigned)은
   전부 status와 leave_dt를 함께 쓰므로 이 상태를 만들 수 없다 → 과거 잔재로 판단.

② 관리자 계정의 고아 회사 삭제
   BO 회사 등록 테스트로 admin(user_sq=106)에 쌓인 회사들.
   참조가 하나라도 있으면 대상에서 자동 제외한다(아래 REF_TABLES 전수 검사).

③ CHECK 제약 추가 (재발 방지의 핵심)
   `status=401 ⟺ leave_dt IS NULL` 을 DB가 강제한다.
   어떤 코드 경로로도 ①번 같은 불일치를 만들 수 없게 된다.

전부 멱등하다. 실행 전 대상 테이블을 파일로 백업한다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/fix-affiliation-data.py" --dry-run   # 계획만 출력
  !python "C:/dev/Freelancer_Service/docs/fix-affiliation-data.py"             # 적용
  !python "C:/dev/Freelancer_Service/docs/fix-affiliation-data.py" --rollback  # 제약만 해제
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
ADMIN_USER_SQ = 106
CONSTRAINT_NAME = 'chk_member_leave_status'

# company_sq 를 참조하는 테이블 전수. 하나라도 걸리면 그 회사는 삭제하지 않는다.
REF_TABLES = [
    'tbl_company_application_h', 'tbl_company_member_r', 'tbl_company_profile_image_s',
    'tbl_company_tag_s', 'tbl_project_application_h', 'tbl_project_m', 'tbl_scrap_s',
]
BACKUP_TABLES = ['TBL_COMPANY_MEMBER_R', 'TBL_COMPANY_S', 'TBL_ADDRESS_S']

DRY_RUN = '--dry-run' in sys.argv
ROLLBACK = '--rollback' in sys.argv


def log(msg=''):
    print(msg, flush=True)


def backup(conn):
    stamp = f'{datetime.now():%Y%m%d-%H%M}'
    outdir = f'C:/dev/db-backup/{stamp}-affiliation-fix'
    os.makedirs(outdir, exist_ok=True)
    path = os.path.join(outdir, 'tables.sql')
    counts = {}
    with conn.cursor() as cur, open(path, 'w', encoding='utf-8') as f:
        f.write(f'-- 소속/회사 데이터 정리 직전 백업 {datetime.now():%Y-%m-%d %H:%M:%S}\n')
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


def fix_member_status(cur):
    log('\n① 소속 상태 불일치 교정 (leave_dt 있는데 status=401)')
    cur.execute('''SELECT company_member_sq, user_sq, company_sq, company_member_leave_dt
                   FROM TBL_COMPANY_MEMBER_R
                   WHERE company_member_status_cd = 401
                     AND company_member_leave_dt IS NOT NULL''')
    rows = cur.fetchall()
    if not rows:
        log('  [스킵] 불일치 없음')
        return
    for r in rows:
        log(f"  대상: member_sq={r['company_member_sq']} user_sq={r['user_sq']} "
            f"company_sq={r['company_sq']} leave_dt={r['company_member_leave_dt']}")
    if DRY_RUN:
        log(f'  [DRY-RUN] {len(rows)}건을 status=402(퇴사)로 교정')
        return
    cur.execute('''UPDATE TBL_COMPANY_MEMBER_R SET company_member_status_cd = 402
                   WHERE company_member_status_cd = 401
                     AND company_member_leave_dt IS NOT NULL''')
    log(f'  [실행] {cur.rowcount}건 교정 (401 → 402)')


def delete_orphan_companies(cur):
    log(f'\n② 관리자(user_sq={ADMIN_USER_SQ}) 소유 고아 회사 삭제')
    cur.execute('SELECT company_sq, company_nm, address_sq FROM TBL_COMPANY_S WHERE user_sq = %s',
                (ADMIN_USER_SQ,))
    owned = cur.fetchall()
    if not owned:
        log('  [스킵] 소유 회사 없음')
        return

    deletable, kept = [], []
    for c in owned:
        refs = {}
        for t in REF_TABLES:
            cur.execute(f'SELECT COUNT(*) AS c FROM `{t}` WHERE company_sq = %s', (c['company_sq'],))
            n = cur.fetchone()['c']
            if n:
                refs[t] = n
        (kept if refs else deletable).append((c, refs))

    for c, refs in kept:
        log(f"  [보존] {c['company_sq']} {c['company_nm']} — 참조 {refs}")
    for c, _ in deletable:
        log(f"  [삭제] {c['company_sq']} {c['company_nm']}")
    if not deletable:
        log('  [스킵] 삭제 대상 없음')
        return
    if DRY_RUN:
        log(f'  [DRY-RUN] 회사 {len(deletable)}건 + 전용 주소 삭제')
        return

    for c, _ in deletable:
        cur.execute('DELETE FROM TBL_COMPANY_S WHERE company_sq = %s', (c['company_sq'],))
        addr = c['address_sq']
        if addr:
            # 다른 회사·유저가 같은 주소를 쓰지 않을 때만 삭제
            cur.execute('SELECT COUNT(*) AS c FROM TBL_COMPANY_S WHERE address_sq = %s', (addr,))
            used = cur.fetchone()['c']
            cur.execute('SELECT COUNT(*) AS c FROM TBL_USER_M WHERE address_sq = %s', (addr,))
            used += cur.fetchone()['c']
            if used == 0:
                cur.execute('DELETE FROM TBL_ADDRESS_S WHERE address_sq = %s', (addr,))
    log(f'  [실행] 회사 {len(deletable)}건 삭제 완료')


def has_constraint(cur):
    cur.execute('''SELECT COUNT(*) AS c FROM information_schema.TABLE_CONSTRAINTS
                   WHERE CONSTRAINT_SCHEMA = %s AND TABLE_NAME = 'TBL_COMPANY_MEMBER_R'
                     AND CONSTRAINT_NAME = %s''', (SCHEMA, CONSTRAINT_NAME))
    return cur.fetchone()['c'] > 0


def add_constraint(cur):
    log('\n③ CHECK 제약 추가 — status=401 ⟺ leave_dt IS NULL')
    if has_constraint(cur):
        log('  [스킵] 이미 존재')
        return
    cur.execute('''SELECT COUNT(*) AS c FROM TBL_COMPANY_MEMBER_R
                   WHERE (company_member_status_cd = 401 AND company_member_leave_dt IS NOT NULL)
                      OR (company_member_status_cd <> 401 AND company_member_leave_dt IS NULL)''')
    bad = cur.fetchone()['c']
    if bad:
        raise SystemExit(f'  [중단] 제약을 위반하는 행이 {bad}건 남아 있다 — ①을 먼저 적용할 것')
    log('  [확인] 위반 행 0건')
    sql = (f'ALTER TABLE TBL_COMPANY_MEMBER_R ADD CONSTRAINT {CONSTRAINT_NAME} '
           'CHECK ((company_member_status_cd = 401 AND company_member_leave_dt IS NULL) '
           'OR (company_member_status_cd <> 401 AND company_member_leave_dt IS NOT NULL))')
    if DRY_RUN:
        log(f'  [DRY-RUN] {sql}')
        return
    cur.execute(sql)
    log('  [실행] 제약 추가 완료 — 이제 어떤 코드 경로로도 불일치를 만들 수 없다')


def drop_constraint(cur):
    log(f'\n[롤백] CHECK 제약 해제')
    if not has_constraint(cur):
        log('  [스킵] 제약 없음')
        return
    if DRY_RUN:
        log(f'  [DRY-RUN] ALTER TABLE TBL_COMPANY_MEMBER_R DROP CONSTRAINT {CONSTRAINT_NAME}')
        return
    cur.execute(f'ALTER TABLE TBL_COMPANY_MEMBER_R DROP CONSTRAINT {CONSTRAINT_NAME}')
    log('  [실행] 해제 완료 (데이터는 되돌리지 않는다 — 백업 SQL 사용)')


def main():
    mode = 'DRY-RUN' if DRY_RUN else ('ROLLBACK' if ROLLBACK else 'APPLY')
    log('=' * 70)
    log(f'소속/회사 데이터 정리 + 재발 방지 제약  [{mode}]')
    log(f'대상: {DB["host"]}/{SCHEMA}')
    log('=' * 70)

    conn = pymysql.connect(**DB)
    try:
        if not DRY_RUN:
            backup(conn)
        with conn.cursor() as cur:
            if ROLLBACK:
                drop_constraint(cur)
            else:
                fix_member_status(cur)
                delete_orphan_companies(cur)
                add_constraint(cur)
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
