# -*- coding: utf-8 -*-
"""공통코드 INSERT 시 맞춰야 할 관행 확인 (읽기 전용) — lvl / english_nm / is_active_yn."""
import os
import sys
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

conn = pymysql.connect(**DB)
try:
    with conn.cursor() as cur:
        print('--- 부모/자식 코드 샘플 ---')
        cur.execute(
            "SELECT common_code_sq, parent_common_code_sq, common_code_lvl, common_code_nm, "
            "common_code_english_nm, common_code_is_active_yn FROM TBL_COMMON_CODE_C "
            "WHERE common_code_sq IN (1400,1401,1402,1403,2600,2605,2606,3100,3101) "
            "ORDER BY common_code_sq"
        )
        for r in cur.fetchall():
            print(f"  sq={r['common_code_sq']:<6} parent={str(r['parent_common_code_sq']):<6} "
                  f"lvl={r['common_code_lvl']} active={r['common_code_is_active_yn']} "
                  f"nm={r['common_code_nm']} eng={r['common_code_english_nm']}")

        print('\n--- lvl 분포 ---')
        cur.execute(
            "SELECT common_code_lvl, COUNT(*) AS cnt, "
            "SUM(parent_common_code_sq IS NULL) AS no_parent "
            "FROM TBL_COMMON_CODE_C GROUP BY common_code_lvl ORDER BY common_code_lvl"
        )
        for r in cur.fetchall():
            print(f"  lvl={r['common_code_lvl']} 건수={r['cnt']} 부모없음={r['no_parent']}")

        print('\n--- is_active_yn 분포 ---')
        cur.execute(
            "SELECT common_code_is_active_yn AS yn, COUNT(*) AS cnt "
            "FROM TBL_COMMON_CODE_C GROUP BY common_code_is_active_yn"
        )
        for r in cur.fetchall():
            print(f"  {r['yn']} = {r['cnt']}건")

        print('\n--- english_nm 채움 비율 ---')
        cur.execute(
            "SELECT COUNT(*) AS total, SUM(common_code_english_nm IS NULL) AS nulls "
            "FROM TBL_COMMON_CODE_C"
        )
        r = cur.fetchone()
        print(f"  전체 {r['total']}건 중 english_nm NULL {r['nulls']}건")
finally:
    conn.close()
