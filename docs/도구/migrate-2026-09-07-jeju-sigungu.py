# -*- coding: utf-8 -*-
"""
2026-09-07 제주 시군구 명칭 정규화.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-07-jeju-sigungu.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-07-jeju-sigungu.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-07-jeju-sigungu.py" --prod --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-07-jeju-sigungu.py" --rollback --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다. 운영 적용 전 반드시 백업:
   !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

무엇을 하는가
  TBL_AREA_C 에서 제주 하위 두 시군구만 시도명이 붙은 채로 들어 있다.

      50110 | 제주도 제주시      → 제주시
      50130 | 제주도 서귀포시    → 서귀포시

  나머지 16개 시도의 하위는 전부 "강남구", "춘천시" 처럼 시군구명만 있다.
  제주만 다르면 두 군데가 어긋난다.

    ① TBL_ADDRESS_S.sigungu 에 "제주도 제주시" 가 그대로 저장된다.
       명칭은 등록 시 이 테이블에서 조회해 채우기 때문이다
       (ProjectService.registerAddressWithDbCheck).
    ② 지도 핀은 sigungu 로 GROUP BY 하므로(ProjectMapper.findProjectGroupsByRegion)
       핀 라벨이 "제주도 제주시" 로 뜬다.

  지금 제주 공고가 0건이라 고치기 가장 쉬운 시점이다.

  area_code_sq(50110/50130)와 parent_area_code_sq(50000)는 건드리지 않는다.
  지역 검색은 코드로 하므로 검색 동작에는 영향이 없다.

  이미 저장된 TBL_ADDRESS_S.sigungu 도 함께 맞춘다(현재 0건이지만 멱등하게 처리).

멱등하다. 이미 적용돼 있으면 건너뛴다.
"""
import importlib.util
import os
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

try:
    import pymysql  # noqa: F401
except ImportError:
    raise SystemExit("pymysql 미설치. 먼저 실행: pip install pymysql")

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

APPLY = '--apply' in sys.argv
ROLLBACK = '--rollback' in sys.argv

# (area_code_sq, 잘못된 현재 명칭, 바로잡을 명칭)
RENAMES = [
    (50110, '제주도 제주시', '제주시'),
    (50130, '제주도 서귀포시', '서귀포시'),
]


def say(msg):
    print(msg)


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    mode = '롤백' if ROLLBACK else '적용'
    say(f'\n=== 제주 시군구 명칭 정규화 ({mode}) — {"실제 반영" if APPLY else "드라이런"} ===')

    changed = 0
    for code, wrong, right in RENAMES:
        frm, to = (right, wrong) if ROLLBACK else (wrong, right)

        cur.execute('SELECT area_sigungu FROM TBL_AREA_C WHERE area_code_sq = %s', (code,))
        row = cur.fetchone()
        if row is None:
            say(f'  [{code}] TBL_AREA_C 에 없음 — 건너뜀')
            continue
        current = row[0]

        if current == to:
            say(f'  [{code}] 이미 "{to}" — 건너뜀')
        elif current != frm:
            say(f'  🔴 [{code}] 예상과 다른 값 "{current}" (기대: "{frm}") — 안전을 위해 건너뜀')
            continue
        else:
            say(f'  [{code}] TBL_AREA_C  "{frm}" → "{to}"')
            if APPLY:
                cur.execute('UPDATE TBL_AREA_C SET area_sigungu = %s WHERE area_code_sq = %s',
                            (to, code))
            changed += 1

        # 이미 저장된 주소의 sigungu 도 맞춘다. 명칭은 마스터에서 복사된 값이라 어긋나면 안 된다.
        cur.execute('SELECT COUNT(*) FROM TBL_ADDRESS_S WHERE area_code_sq = %s AND sigungu = %s',
                    (code, frm))
        cnt = cur.fetchone()[0]
        if cnt:
            say(f'        TBL_ADDRESS_S {cnt}건도 "{frm}" → "{to}"')
            if APPLY:
                cur.execute(
                    'UPDATE TBL_ADDRESS_S SET sigungu = %s WHERE area_code_sq = %s AND sigungu = %s',
                    (to, code, frm))
            changed += 1

    if APPLY:
        conn.commit()
        say(f'\n커밋 완료 ({schema}). 변경 {changed}건.')
    else:
        conn.rollback()
        say(f'\n드라이런이라 아무것도 바꾸지 않았다. 반영하려면 --apply 를 붙일 것.')

    say('\n--- 반영 후 상태')
    cur.execute("""
        SELECT c.area_code_sq, c.area_sigungu, p.area_sigungu AS parent
          FROM TBL_AREA_C c JOIN TBL_AREA_C p ON c.parent_area_code_sq = p.area_code_sq
         WHERE c.area_code_sq IN (50110, 50130) ORDER BY c.area_code_sq
    """)
    for r in cur.fetchall():
        say('   ' + ' | '.join(str(v) for v in r))

    cur.execute("""
        SELECT COUNT(*) FROM TBL_ADDRESS_S a JOIN TBL_AREA_C c ON c.area_code_sq = a.area_code_sq
         WHERE a.sigungu <> c.area_sigungu
    """)
    say(f'   마스터와 명칭이 어긋난 주소: {cur.fetchone()[0]}건 (0 이어야 정상)')

    conn.close()
    print()


if __name__ == '__main__':
    main()
