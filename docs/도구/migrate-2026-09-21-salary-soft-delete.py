# -*- coding: utf-8 -*-
"""
2026-09-21 연봉 제출건 BO 관리(소프트 삭제) 도입.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-21-salary-soft-delete.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-21-salary-soft-delete.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-21-salary-soft-delete.py" --prod --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다. 운영 적용 전 반드시 백업:
   !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

무엇을 하는가
  TBL_SALARY_SUBMISSION_M 에 salary_submission_is_deleted_yn 컬럼을 추가한다(CHAR(1) NOT NULL
  DEFAULT 'N'). 게시판/투표/면접후기 BO와 같은 소프트삭제 패턴 — 관리자가 이상치·허위 제출건을
  통계(리포트·순위표·이직동향)에서 제외하되 감사를 위해 원본은 남긴다.

  기존 통계 집계 쿼리(비교그룹·순위표·스킬평균·회사추천·이직동향)는 전부 이 컬럼 = 'N'만
  포함하도록 바뀐다(이 스크립트는 컬럼만 추가, 쿼리 수정은 애플리케이션 코드에서).
  본인 조회(GET /salary/submissions/me)는 필터하지 않는다 — 삭제돼도 본인은 자기 데이터를
  계속 보고 수정할 수 있어야 하며, 재제출(UPDATE) 시 이 값이 자동으로 'N'으로 복구된다.

  기존 행은 전부 'N'(정상)으로 채워진다.

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


def say(msg):
    print(msg)


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    say(f'\n=== 연봉 제출건 소프트삭제 컬럼 도입 — {"실제 반영" if APPLY else "드라이런"} ===')

    cur.execute("""
        SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'TBL_SALARY_SUBMISSION_M'
           AND COLUMN_NAME = 'salary_submission_is_deleted_yn'
    """, (schema,))
    has_column = cur.fetchone()[0] > 0

    if has_column:
        say('  이미 존재 — 건너뜀')
    else:
        say('  ALTER TABLE TBL_SALARY_SUBMISSION_M ADD COLUMN salary_submission_is_deleted_yn')
        if APPLY:
            cur.execute(
                "ALTER TABLE TBL_SALARY_SUBMISSION_M "
                "ADD COLUMN salary_submission_is_deleted_yn CHAR(1) NOT NULL DEFAULT 'N' "
                "COMMENT '관리자 소프트삭제 여부 — Y면 통계 집계에서 제외' AFTER updated_at_dtm"
            )

    if APPLY:
        conn.commit()
        say(f'\n커밋 완료 ({schema}).')
    else:
        conn.rollback()
        say(f'\n드라이런이라 아무것도 바꾸지 않았다. 반영하려면 --apply 를 붙일 것.')

    say('\n--- 반영 후 상태')
    cur.execute("SHOW COLUMNS FROM TBL_SALARY_SUBMISSION_M LIKE 'salary_submission_is_deleted_yn'")
    row = cur.fetchone()
    say('   TBL_SALARY_SUBMISSION_M.salary_submission_is_deleted_yn: '
        + (' | '.join(str(v) for v in row) if row else '없음'))

    conn.close()
    print()


if __name__ == '__main__':
    main()
