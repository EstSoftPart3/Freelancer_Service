# -*- coding: utf-8 -*-
"""TBL_ADDRESS_S / TBL_AREA_C 현황 (읽기 전용)"""
import os
import sys

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          database='freelancer_project', charset='utf8mb4')

conn = pymysql.connect(**DB)
cur = conn.cursor()


def show(title, sql, args=()):
    print()
    print(f'── {title}')
    cur.execute(sql, args) if args else cur.execute(sql)
    rows = cur.fetchall()
    if not rows:
        print('   (없음)')
        return
    print('   ' + ' | '.join(d[0] for d in cur.description))
    for r in rows:
        print('   ' + ' | '.join('' if v is None else str(v) for v in r))


show('TBL_ADDRESS_S 행수', 'SELECT COUNT(*) AS cnt FROM TBL_ADDRESS_S')
show('TBL_ADDRESS_S 샘플', 'SELECT * FROM TBL_ADDRESS_S ORDER BY address_sq DESC LIMIT 5')
show('TBL_ADDRESS_S 컬럼', """
    SELECT column_name, column_type, is_nullable
      FROM information_schema.columns
     WHERE table_schema = %s AND table_name = 'TBL_ADDRESS_S'
     ORDER BY ordinal_position
""", (DB['database'],))
show('TBL_AREA_C 컬럼', """
    SELECT column_name, column_type, is_nullable
      FROM information_schema.columns
     WHERE table_schema = %s AND table_name = 'TBL_AREA_C'
     ORDER BY ordinal_position
""", (DB['database'],))
show('서울 지역코드 샘플', """
    SELECT * FROM TBL_AREA_C
     WHERE area_sigungu LIKE '%서초%' OR area_sigungu LIKE '%강남%' OR area_sigungu LIKE '%서울%'
     LIMIT 12
""")
show('TBL_COMPANY_MEMBER_R 컬럼', """
    SELECT column_name, column_type, is_nullable, column_default
      FROM information_schema.columns
     WHERE table_schema = %s AND table_name = 'TBL_COMPANY_MEMBER_R'
     ORDER BY ordinal_position
""", (DB['database'],))

conn.close()
print()
