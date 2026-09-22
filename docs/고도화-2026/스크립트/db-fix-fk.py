# -*- coding: utf-8 -*-
"""
이관 후 외래키(FK) 점검 및 복원.

MariaDB 의 `CREATE TABLE ... LIKE` 는 컬럼/인덱스는 복사하지만
**외래키 제약은 복사하지 않는다**. 이관 스크립트가 이 방식을 썼으므로
원본에 있던 FK 가 대상에 빠져 있을 수 있다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/db-fix-fk.py"            # 점검만
  !python "C:/dev/Freelancer_Service/docs/db-fix-fk.py" --execute  # 누락분 복원

원본(freelancer_education)의 FK 정의를 기준으로 대상에 없는 것만 추가한다.
"""
import os
import argparse
import sys

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

SRC = 'freelancer_education'
DST = 'freelancer_project'
BAK = 'freelancer_project_bak_20260728'   # 이관 전 원래 FK 정의를 여기서 참고

DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, autocommit=False)


def fks(cur, schema):
    """스키마의 FK 정의를 {제약명: dict} 로 반환."""
    cur.execute("""
        SELECT k.constraint_name cn, k.table_name tn, k.column_name col,
               k.referenced_table_name rt, k.referenced_column_name rc,
               r.delete_rule dr, r.update_rule ur
        FROM information_schema.key_column_usage k
        JOIN information_schema.referential_constraints r
          ON r.constraint_schema = k.constraint_schema
         AND r.constraint_name   = k.constraint_name
        WHERE k.constraint_schema = %s AND k.referenced_table_name IS NOT NULL
        ORDER BY k.table_name, k.constraint_name, k.ordinal_position
    """, (schema,))
    out = {}
    for r in cur.fetchall():
        out[r['cn']] = r
    return out


def idx_count(cur, schema, tn):
    cur.execute("SELECT COUNT(DISTINCT index_name) c FROM information_schema.statistics "
                "WHERE table_schema=%s AND table_name=%s", (schema, tn))
    return cur.fetchone()['c']


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--execute', action='store_true', help='누락 FK 를 실제로 추가')
    args = ap.parse_args()
    dry = not args.execute

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    src_fk = fks(cur, SRC)
    dst_fk = fks(cur, DST)
    try:
        bak_fk = fks(cur, BAK)
    except Exception:
        bak_fk = {}

    print('=' * 66)
    print(f'FK 점검  {SRC} → {DST}')
    print(f'모드: {"점검만 (변경 없음)" if dry else "*** 복원 실행 ***"}')
    print('=' * 66)
    print()
    print(f'{SRC}(원본)         : {len(src_fk)}건')
    print(f'{DST}(이관 후)      : {len(dst_fk)}건')
    print(f'{BAK}(이관 전 백업) : {len(bak_fk)}건')
    print()

    print(f'--- {SRC} 의 FK ---')
    for cn, r in src_fk.items():
        mark = 'OK ' if cn in dst_fk else '없음'
        print(f'  [{mark}] {cn}: {r["tn"]}.{r["col"]} → {r["rt"]}.{r["rc"]} '
              f'(ON DELETE {r["dr"]} / ON UPDATE {r["ur"]})')
    print()

    missing = {cn: r for cn, r in src_fk.items() if cn not in dst_fk}
    extra = {cn: r for cn, r in dst_fk.items() if cn not in src_fk}

    if extra:
        print(f'--- {DST} 에만 있는 FK {len(extra)}건 (참고, 손대지 않음) ---')
        for cn, r in extra.items():
            print(f'  {cn}: {r["tn"]}.{r["col"]} → {r["rt"]}.{r["rc"]}')
        print()

    # 인덱스 개수 대조 (CREATE TABLE LIKE 는 인덱스는 복사하므로 같아야 정상)
    cur.execute("SELECT table_name tn FROM information_schema.tables "
                "WHERE table_schema=%s AND table_type='BASE TABLE'", (SRC,))
    idx_bad = []
    for r in cur.fetchall():
        t = r['tn']
        a, b = idx_count(cur, SRC, t), idx_count(cur, DST, t)
        if a != b:
            idx_bad.append((t, a, b))
    if idx_bad:
        print(f'!! 인덱스 개수 불일치 {len(idx_bad)}건')
        for t, a, b in idx_bad:
            print(f'   {t}: SRC {a}개 vs DST {b}개')
    else:
        print('인덱스 개수: 전 테이블 일치')
    print()

    if not missing:
        print('누락된 FK 없음. 추가 작업 불필요.')
        conn.close()
        return

    print(f'--- 누락된 FK {len(missing)}건 ---')
    ddl = []
    for cn, r in missing.items():
        sql = (f'ALTER TABLE `{DST}`.`{r["tn"]}` '
               f'ADD CONSTRAINT `{cn}` FOREIGN KEY (`{r["col"]}`) '
               f'REFERENCES `{r["rt"]}` (`{r["rc"]}`) '
               f'ON DELETE {r["dr"]} ON UPDATE {r["ur"]}')
        ddl.append((cn, sql))
        print(f'  {sql};')
    print()

    if dry:
        print('복원하려면 --execute 를 붙여 다시 실행하세요.')
        conn.close()
        return

    cur.execute('SET FOREIGN_KEY_CHECKS=0')
    ok, fail = 0, []
    for cn, sql in ddl:
        try:
            cur.execute(sql)
            conn.commit()
            ok += 1
            print(f'  추가됨: {cn}')
        except Exception as e:
            conn.rollback()
            fail.append((cn, f'{e.__class__.__name__}: {e}'))
            print(f'  실패:   {cn} — {e}')
    cur.execute('SET FOREIGN_KEY_CHECKS=1')
    conn.commit()

    print()
    print(f'복원 {ok}건 성공, {len(fail)}건 실패')
    after = fks(cur, DST)
    print(f'{DST} 최종 FK: {len(after)}건 (원본 {len(src_fk)}건)')
    conn.close()


if __name__ == '__main__':
    main()
