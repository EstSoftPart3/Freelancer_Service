# -*- coding: utf-8 -*-
"""지하철 주소(TBL_PROJECT_M.subway_address_sq) 정합성 점검 (읽기 전용).

  개발 DB: !python "C:/dev/Freelancer_Service/docs/도구/check-subway-address.py"
  운영 DB: !python "C:/dev/Freelancer_Service/docs/도구/check-subway-address.py" --prod
"""
import importlib.util
import os
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

conn, schema = dbconfig.connect()
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


show('지하철 주소를 쓰는 공고', """
    SELECT COUNT(*) cnt FROM TBL_PROJECT_M
     WHERE subway_address_sq IS NOT NULL AND project_is_deleted_yn = 'N'
""")
show('지하철 주소 행 상세', """
    SELECT a.address_sq, a.address, a.sigungu, a.area_code_sq, c.area_sigungu AS master,
           a.latitude, a.longitude, a.zonecode
      FROM TBL_PROJECT_M p
      JOIN TBL_ADDRESS_S a ON a.address_sq = p.subway_address_sq
      LEFT JOIN TBL_AREA_C c ON c.area_code_sq = a.area_code_sq
     WHERE p.project_is_deleted_yn = 'N'
     ORDER BY a.address_sq DESC LIMIT 20
""")
show('🔴 지하철 주소인데 시군구 코드가 마스터에 없는 건', """
    SELECT a.address_sq, a.address, a.area_code_sq
      FROM TBL_PROJECT_M p JOIN TBL_ADDRESS_S a ON a.address_sq = p.subway_address_sq
     WHERE NOT EXISTS (SELECT 1 FROM TBL_AREA_C c WHERE c.area_code_sq = a.area_code_sq)
""")
show('🔴 지하철 주소인데 명칭이 마스터와 다른 건', """
    SELECT a.address_sq, a.address, a.sigungu AS stored, c.area_sigungu AS master
      FROM TBL_PROJECT_M p JOIN TBL_ADDRESS_S a ON a.address_sq = p.subway_address_sq
      JOIN TBL_AREA_C c ON c.area_code_sq = a.area_code_sq
     WHERE a.sigungu <> c.area_sigungu
""")
show('🔴 지하철 주소가 시도 코드로 저장된 건 (지역검색 사각지대)', """
    SELECT a.address_sq, a.address, a.area_code_sq, c.area_sigungu
      FROM TBL_PROJECT_M p JOIN TBL_ADDRESS_S a ON a.address_sq = p.subway_address_sq
      JOIN TBL_AREA_C c ON c.area_code_sq = a.area_code_sq
     WHERE c.parent_area_code_sq IS NULL
""")
show('address_type_cd 분포 (2701 상세 / 2702 지하철)', """
    SELECT address_type_cd, COUNT(*) cnt FROM TBL_PROJECT_M
     WHERE project_is_deleted_yn = 'N' GROUP BY address_type_cd
""")

conn.close()
print()
