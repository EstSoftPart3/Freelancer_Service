# -*- coding: utf-8 -*-
"""
2026-09-02 공고 등록 개선 — DB 스키마·데이터 변경.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-grade-and-enddate.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-grade-and-enddate.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-grade-and-enddate.py" --prod --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-grade-and-enddate.py" --rollback --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다. 운영 적용 전 반드시 백업:
   !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

무엇을 하는가
  ① 개발자 등급 공통코드 4개 추가 (부모 700)
       710 초급 LOW / 711 중급 MID / 712 상급 HIGH / 713 등급 무관 ANY

     기존 등급은 초초~상상 9단계(701~709)뿐이라, 현장에서 "초급", "중급" 처럼
     뭉뚱그려 오는 요청을 담을 수 없었다. 등급을 따지지 않는 공고도 표현할 수 없었다.

     🔴 영문명이 중요하다. 서열 판정을 코드값이 아니라 영문명으로 하기 때문이다
     (backend .../project/util/DeveloperGradeSupport.java).
     코드값으로 비교하면 710(초급) > 709(상상) 이라 초급이 최고 등급으로 뒤집힌다.

  ② TBL_PROJECT_M.project_end_dt 를 NULL 허용으로 변경
     NULL = "수행 종료일 미정". 끝나는 날을 정하지 않고 시작하는 현장이 있다.
     모집 인원의 headcount 를 NULL 로 푼 것과 같은 방식이다(별도 플래그 컬럼을 두지 않는다).

  ③ TBL_PROJECT_RECRUIT_HEADCOUNT_S 의 등급 NULL 행을 공고의 대표 등급으로 채운다
     예전에는 developer_grade_cd IS NULL 이 "총 인원으로 모집" 모드를 뜻했다.
     그 모드를 없애고 입력을 하나로 합치면서, 옛 공고도 등급이 채워진 행으로 정규화한다.
     대표 등급(project_developer_grade_cd)이 곧 그 모드에서 등록자가 고른 등급이라 정보 손실이 없다.

멱등하다. 이미 적용돼 있으면 건너뛴다. ③은 데이터를 지우지 않고 채우기만 한다.
"""
import os
import sys
import importlib.util

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

PARENT_GRADE_CD = 700
# (sq, 한글명, 영문명)
NEW_GRADES = [
    (710, '초급', 'LOW'),
    (711, '중급', 'MID'),
    (712, '상급', 'HIGH'),
    (713, '등급 무관', 'ANY'),
]


def say(msg):
    print(msg)


def run(cur, sql, args=None):
    """드라이런이면 SQL 만 찍는다."""
    if not APPLY:
        say(f'    [dry-run] {" ".join(sql.split())}' + (f'  args={args}' if args else ''))
        return 0
    return cur.execute(sql, args or ())


# ─────────────────────────────────────────────────────────── ① 공통코드

def step_common_codes(cur):
    say('\n① 개발자 등급 공통코드 4개 추가')
    cur.execute(
        "SELECT common_code_sq FROM TBL_COMMON_CODE_C WHERE common_code_sq IN (710, 711, 712, 713)")
    existing = {r[0] for r in cur.fetchall()}

    for sq, nm, eng in NEW_GRADES:
        if sq in existing:
            say(f'  - {sq} {nm} : 이미 있음, 건너뜀')
            continue
        say(f'  + {sq} {nm} ({eng})')
        run(cur, """
            INSERT INTO TBL_COMMON_CODE_C
                (common_code_sq, parent_common_code_sq, common_code_lvl,
                 common_code_nm, common_code_english_nm, common_code_is_active_yn)
            VALUES (%s, %s, 2, %s, %s, 'Y')
        """, (sq, PARENT_GRADE_CD, nm, eng))


def rollback_common_codes(cur):
    say('\n① 공통코드 4개 제거')
    # 참조하는 공고가 있으면 지우지 않는다 — 지우면 그 공고의 등급이 미아가 된다.
    cur.execute("""
        SELECT COUNT(*) FROM TBL_PROJECT_M
        WHERE project_developer_grade_cd IN (710, 711, 712, 713)
    """)
    used_project = cur.fetchone()[0]
    cur.execute("""
        SELECT COUNT(*) FROM TBL_PROJECT_RECRUIT_HEADCOUNT_S
        WHERE developer_grade_cd IN (710, 711, 712, 713)
    """)
    used_head = cur.fetchone()[0]

    if used_project or used_head:
        say(f'  🔴 참조 중이라 지울 수 없다 (공고 {used_project}건, 모집인원 {used_head}행).')
        say('     해당 공고의 등급을 기존 9단계로 바꾼 뒤 다시 실행할 것.')
        return
    run(cur, "DELETE FROM TBL_COMMON_CODE_C WHERE common_code_sq IN (710, 711, 712, 713)")


# ─────────────────────────────────────────────────────────── ② 종료일 NULL 허용

def _end_dt_is_nullable(cur, schema):
    cur.execute("""
        SELECT IS_NULLABLE FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'TBL_PROJECT_M'
          AND COLUMN_NAME = 'project_end_dt'
    """, (schema,))
    row = cur.fetchone()
    return row and row[0] == 'YES'


def step_end_dt(cur, schema):
    say('\n② TBL_PROJECT_M.project_end_dt → NULL 허용')
    if _end_dt_is_nullable(cur, schema):
        say('  - 이미 NULL 허용, 건너뜀')
        return
    run(cur, """
        ALTER TABLE TBL_PROJECT_M
        MODIFY COLUMN project_end_dt DATE NULL COMMENT '프로젝트 수행 종료일. NULL 이면 미정'
    """)


def rollback_end_dt(cur, schema):
    say('\n② project_end_dt → NOT NULL 복원')
    if not _end_dt_is_nullable(cur, schema):
        say('  - 이미 NOT NULL, 건너뜀')
        return
    cur.execute("SELECT COUNT(*) FROM TBL_PROJECT_M WHERE project_end_dt IS NULL")
    nulls = cur.fetchone()[0]
    if nulls:
        say(f'  🔴 종료일이 미정인 공고가 {nulls}건 있어 되돌릴 수 없다.')
        say('     그 공고들의 종료일을 먼저 채운 뒤 다시 실행할 것:')
        say('     SELECT project_sq, project_ttl FROM TBL_PROJECT_M WHERE project_end_dt IS NULL;')
        return
    run(cur, """
        ALTER TABLE TBL_PROJECT_M
        MODIFY COLUMN project_end_dt DATE NOT NULL COMMENT '프로젝트 수행 종료일'
    """)


# ─────────────────────────────────────────────────────────── ③ 등급 NULL 행 채우기

def step_fill_grades(cur):
    say('\n③ 모집인원의 등급 NULL 행을 공고 대표 등급으로 채우기')
    cur.execute("SELECT COUNT(*) FROM TBL_PROJECT_RECRUIT_HEADCOUNT_S WHERE developer_grade_cd IS NULL")
    target = cur.fetchone()[0]
    if target == 0:
        say('  - 채울 행 없음, 건너뜀')
        return
    say(f'  + {target}행을 채운다')
    run(cur, """
        UPDATE TBL_PROJECT_RECRUIT_HEADCOUNT_S h
          JOIN TBL_PROJECT_M p ON p.project_sq = h.project_sq
           SET h.developer_grade_cd = p.project_developer_grade_cd
         WHERE h.developer_grade_cd IS NULL
    """)


# ─────────────────────────────────────────────────────────── main

def main():
    conn, schema = dbconfig.connect()
    mode = '롤백' if ROLLBACK else '적용'
    say(f'\n=== 2026-09 등급·종료일 마이그레이션 ({mode}) — {"실행" if APPLY else "드라이런"} ===')

    try:
        with conn.cursor() as cur:
            if ROLLBACK:
                # 되돌리는 순서는 적용의 역순. ③은 정보 손실이 없는 정규화라 되돌리지 않는다.
                say('\n③ 등급 채우기는 되돌리지 않는다 (정보 손실이 없는 정규화).')
                rollback_end_dt(cur, schema)
                rollback_common_codes(cur)
            else:
                step_common_codes(cur)
                step_end_dt(cur, schema)
                step_fill_grades(cur)

        if APPLY:
            conn.commit()
            say('\n✅ 커밋 완료')
        else:
            say('\n(드라이런이라 아무것도 바꾸지 않았다. 실제로 적용하려면 --apply)')
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
