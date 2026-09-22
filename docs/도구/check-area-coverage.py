# -*- coding: utf-8 -*-
"""TBL_AREA_C 표기·검색 정합성 점검 (읽기 전용)"""
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


show('시도별 하위 시군구 개수 (0이면 지역검색에서 영원히 안 잡힌다)', """
    SELECT p.area_code_sq, p.area_sigungu, COUNT(c.area_code_sq) cnt
      FROM TBL_AREA_C p LEFT JOIN TBL_AREA_C c ON c.parent_area_code_sq = p.area_code_sq
     WHERE p.parent_area_code_sq IS NULL
     GROUP BY p.area_code_sq, p.area_sigungu ORDER BY cnt, p.area_code_sq
""")
show('시도명이 붙어 있는 시군구 (표기 불일치)', """
    SELECT c.area_code_sq, c.area_sigungu, p.area_sigungu AS parent
      FROM TBL_AREA_C c JOIN TBL_AREA_C p ON c.parent_area_code_sq = p.area_code_sq
     WHERE c.area_sigungu LIKE CONCAT(p.area_sigungu, ' %')
     ORDER BY c.area_code_sq
""")
show('주소가 시도 코드로 저장된 건 (지역검색 사각지대)', """
    SELECT a.area_code_sq, c.area_sigungu, COUNT(*) cnt
      FROM TBL_ADDRESS_S a JOIN TBL_AREA_C c ON c.area_code_sq = a.area_code_sq
     WHERE c.parent_area_code_sq IS NULL
     GROUP BY a.area_code_sq, c.area_sigungu
""")
show('저장된 sigungu 문자열이 TBL_AREA_C 명칭과 다른 건', """
    SELECT a.address_sq, a.sigungu AS stored, c.area_sigungu AS master, a.area_code_sq
      FROM TBL_ADDRESS_S a JOIN TBL_AREA_C c ON c.area_code_sq = a.area_code_sq
     WHERE a.sigungu <> c.area_sigungu
     LIMIT 20
""")
show('공고가 실제로 걸려 있는 지역 분포 (상위 15)', """
    SELECT c.area_sigungu, COUNT(*) cnt
      FROM TBL_PROJECT_M p
      JOIN TBL_ADDRESS_S a ON a.address_sq = IFNULL(p.address_sq, p.subway_address_sq)
      JOIN TBL_AREA_C c ON c.area_code_sq = a.area_code_sq
     WHERE p.project_is_deleted_yn = 'N'
     GROUP BY c.area_sigungu ORDER BY cnt DESC LIMIT 15
""")

conn.close()
print()
