# -*- coding: utf-8 -*-
"""
2026-09-17 라운지(자유게시판) 중분류 개편 — 말머리/잡담 → 유머/일상.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-lounge-category-rename.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-lounge-category-rename.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-lounge-category-rename.py" --prod --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-lounge-category-rename.py" --rollback --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다. 운영 적용 전 반드시 백업:
   !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

무엇을 하는가
  TBL_COMMON_CODE_C 의 라운지(부모 1409) 중분류 두 건을 이름만 바꾼다.
  commonCodeSq(3240/3241)는 그대로 두고 이름만 바꾸므로 이미 그 코드로 작성된
  게시글의 카테고리 참조가 끊기지 않는다(삭제 후 재생성이 아니라 rename).

      3240 | 말머리 → 유머
      3241 | 잡담   → 일상

  프런트 폴백 상수(components/community/boardMeta.ts)도 같은 이름으로 맞춰 뒀다 —
  이 스크립트는 그 정본인 DB 쪽만 반영한다.

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

# (common_code_sq, 바뀌기 전 이름, 바뀐 후 이름)
RENAMES = [
    (3240, '말머리', '유머'),
    (3241, '잡담', '일상'),
]


def say(msg):
    print(msg)


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    mode = '롤백' if ROLLBACK else '적용'
    say(f'\n=== 라운지 중분류 개편 (말머리/잡담 → 유머/일상) ({mode}) — {"실제 반영" if APPLY else "드라이런"} ===')

    changed = 0
    for code, before, after in RENAMES:
        frm, to = (after, before) if ROLLBACK else (before, after)

        cur.execute('SELECT common_code_nm FROM TBL_COMMON_CODE_C WHERE common_code_sq = %s', (code,))
        row = cur.fetchone()
        if row is None:
            say(f'  [{code}] TBL_COMMON_CODE_C 에 없음 — 건너뜀')
            continue
        current = row[0]

        if current == to:
            say(f'  [{code}] 이미 "{to}" — 건너뜀')
        elif current != frm:
            say(f'  🔴 [{code}] 예상과 다른 값 "{current}" (기대: "{frm}") — 안전을 위해 건너뜀')
            continue
        else:
            say(f'  [{code}] TBL_COMMON_CODE_C  "{frm}" → "{to}"')
            if APPLY:
                cur.execute('UPDATE TBL_COMMON_CODE_C SET common_code_nm = %s WHERE common_code_sq = %s',
                            (to, code))
            changed += 1

    if APPLY:
        conn.commit()
        say(f'\n커밋 완료 ({schema}). 변경 {changed}건.')
    else:
        conn.rollback()
        say(f'\n드라이런이라 아무것도 바꾸지 않았다. 반영하려면 --apply 를 붙일 것.')

    say('\n--- 반영 후 상태')
    cur.execute("""
        SELECT common_code_sq, common_code_nm, parent_common_code_sq
          FROM TBL_COMMON_CODE_C WHERE common_code_sq IN (3240, 3241)
         ORDER BY common_code_sq
    """)
    for r in cur.fetchall():
        say('   ' + ' | '.join(str(v) for v in r))

    conn.close()
    print()


if __name__ == '__main__':
    main()
