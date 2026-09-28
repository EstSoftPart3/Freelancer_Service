# -*- coding: utf-8 -*-
"""
2026-09-17 투표 카테고리(IT/일반) 도입.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-vote-category.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-vote-category.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-vote-category.py" --prod --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다. 운영 적용 전 반드시 백업:
   !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

무엇을 하는가
  1) TBL_COMMON_CODE_C 에 투표 카테고리 공통코드를 새로 만든다.
       1410 | 투표_카테고리        (parent 없음 — 게시판_구분(1400)과 같은 레벨의 새 그룹)
       3250 | IT                  (parent 1410)
       3251 | 일반                (parent 1410)
  2) TBL_VOTE_M 에 vote_category_cd 컬럼을 추가한다(BIGINT, NOT NULL).
     기존에 이미 작성된 투표는 카테고리가 없었으므로 전부 "일반"(3251)로 채운다.

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

#            (code, 이름,   parent, level, 영문명)
CODES = [
    (1410, '투표_카테고리', None, 1, 'VOTE_CATEGORY'),
    (3250, 'IT',          1410, 2, 'IT'),
    (3251, '일반',         1410, 2, 'GENERAL'),
]

DEFAULT_CATEGORY = 3251  # 기존 투표(카테고리 없음)를 채울 값 — "일반"


def say(msg):
    print(msg)


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    say(f'\n=== 투표 카테고리(IT/일반) 도입 — {"실제 반영" if APPLY else "드라이런"} ===')

    say('\n[1/2] 공통코드')
    for code, name, parent, lvl, eng in CODES:
        cur.execute('SELECT common_code_nm FROM TBL_COMMON_CODE_C WHERE common_code_sq = %s', (code,))
        row = cur.fetchone()
        if row is not None:
            say(f'  [{code}] 이미 존재("{row[0]}") — 건너뜀')
            continue
        say(f'  [{code}] INSERT "{name}" (parent={parent}, lvl={lvl})')
        if APPLY:
            cur.execute(
                'INSERT INTO TBL_COMMON_CODE_C (common_code_sq, common_code_nm, common_code_english_nm, '
                'parent_common_code_sq, common_code_lvl, common_code_is_active_yn) '
                'VALUES (%s, %s, %s, %s, %s, \'Y\')',
                (code, name, eng, parent, lvl),
            )

    say('\n[2/2] TBL_VOTE_M.vote_category_cd 컬럼')
    cur.execute("""
        SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'TBL_VOTE_M' AND COLUMN_NAME = 'vote_category_cd'
    """, (schema,))
    has_column = cur.fetchone()[0] > 0

    if has_column:
        say('  이미 존재 — 건너뜀')
    else:
        say(f'  ALTER TABLE TBL_VOTE_M ADD COLUMN vote_category_cd (기존 행은 {DEFAULT_CATEGORY}로 채움)')
        if APPLY:
            cur.execute(
                'ALTER TABLE TBL_VOTE_M ADD COLUMN vote_category_cd BIGINT NOT NULL DEFAULT %s AFTER vote_description_edt',
                (DEFAULT_CATEGORY,),
            )
            # DEFAULT 는 이후 INSERT 용 — 이미 있는 행도 명시적으로 채운다(가독성 목적, DEFAULT 지정으로 이미 채워져 있음).
            cur.execute('UPDATE TBL_VOTE_M SET vote_category_cd = %s WHERE vote_category_cd IS NULL',
                        (DEFAULT_CATEGORY,))

    if APPLY:
        conn.commit()
        say(f'\n커밋 완료 ({schema}).')
    else:
        conn.rollback()
        say(f'\n드라이런이라 아무것도 바꾸지 않았다. 반영하려면 --apply 를 붙일 것.')

    say('\n--- 반영 후 상태')
    cur.execute("SELECT common_code_sq, common_code_nm, parent_common_code_sq FROM TBL_COMMON_CODE_C "
                "WHERE common_code_sq IN (1410, 3250, 3251) ORDER BY common_code_sq")
    for r in cur.fetchall():
        say('   ' + ' | '.join(str(v) for v in r))
    cur.execute("SHOW COLUMNS FROM TBL_VOTE_M LIKE 'vote_category_cd'")
    row = cur.fetchone()
    say('   TBL_VOTE_M.vote_category_cd: ' + (' | '.join(str(v) for v in row) if row else '없음'))

    conn.close()
    print()


if __name__ == '__main__':
    main()
