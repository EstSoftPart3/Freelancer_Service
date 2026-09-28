# -*- coding: utf-8 -*-
"""
2026-09-22 FREELANCE 시드 480여건의 스케일 오류 보정 — 연봉 스케일 → 월단가 스케일.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-22-salary-freelance-monthly.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-22-salary-freelance-monthly.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-22-salary-freelance-monthly.py" --prod --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-22-salary-freelance-monthly.py" --rollback --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다.

무엇을 고치는가
  migrate-2026-09-salary.py 의 build_seed_rows() 가 FREELANCE 시드행에도 EMPLOYED와
  똑같은 BASE_SALARY_BY_YEARS(연봉 스케일, 만원)를 그대로 곱해 넣었다. 그런데
  annual_salary 컬럼은 SalaryMapper.xml 의 rankingWhere 주석에도 있듯 "프리랜서는
  월단가가 들어간다"는 게 기존 설계다 — 실제 사용자가 연봉계산기에서 프리랜서를
  고르면 프론트가 "월단가"로 입력받는다(SalaryCalculatorForm.tsx). 그 결과 같은
  FREELANCE 그룹 안에서 실제 제출값(월단가, 수백만원)과 시드값(연봉 스케일,
  수천만원)이 10배 가까이 스케일이 안 맞아 리포트(내 연봉 비교·5년 추정 등)가
  프리랜서 유저에게 왜곡되어 보였다.

  4대보험·국민연금이 안 들어가는 프리랜서 특성상 "연봉/12" 역산 대신, 연차별 월단가를
  직접 지정한다(사용자 확정, 2026-09-22): 1~2년 350 · 3~5년 450 · 6~9년 550 ·
  10년+ 700(만원/월). 기존 시드가 이미 같은 연차별 난수 배율(uniform 0.72~1.55)로
  갈라져 있었으므로, 그 비율을 그대로 보존한 채 절대 스케일만
  new_base/old_base 비율로 낮춘다 — 시드 행 간 상대적인 분포 모양은 그대로 두고
  절대값만 고치는 방식(재추첨하면 어느 행이 몇 등인지 순서가 바뀔 수 있어서 피함).

  대상은 is_seed_yn='Y' AND employment_type='FREELANCE' AND annual_salary >= 2000
  (새 스케일 상한은 700*1.55≈1085, 기존 스케일 하한은 3600*0.72≈2592라 2000을
  경계로 삼으면 재실행해도 이미 고친 행을 또 건드리지 않는다 — 멱등).

  migrate-2026-09-salary.py 자체도 이번 커밋에서 함께 고쳤다(향후 빈 DB에 처음부터
  시드를 새로 넣을 때는 이 스크립트 없이도 바로 맞는 스케일로 들어가도록) — 이
  스크립트는 이미 시드가 들어간 기존 DB(개발/운영)를 보정하기 위한 것.
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

# 연차별 (기존 연봉 스케일 base, 새 월단가 스케일 base) — 새/기존 비율만큼 절대값을 낮춘다.
OLD_BASE_BY_YEARS = {'1~2년': 3600, '3~5년': 4800, '6~9년': 6200, '10년+': 8000}
NEW_BASE_BY_YEARS = {'1~2년': 350, '3~5년': 450, '6~9년': 550, '10년+': 700}
SCALE_THRESHOLD = 2000  # 이 값 이상이면 "아직 안 고친 연봉 스케일"로 판단


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    mode = '롤백' if ROLLBACK else '적용'
    say(f'\n=== FREELANCE 시드 스케일 보정 (연봉 → 월단가) ({mode}) — {"실제 반영" if APPLY else "드라이런"} ===')

    if ROLLBACK:
        cur.execute(
            "SELECT salary_submission_sq, career_bucket, annual_salary FROM tbl_salary_submission_m "
            "WHERE is_seed_yn = 'Y' AND employment_type = 'FREELANCE' AND annual_salary < %s "
            "ORDER BY salary_submission_sq", (SCALE_THRESHOLD,),
        )
        rows = cur.fetchall()
        if not rows:
            say('  대상 없음(이미 연봉 스케일이거나 시드가 없음) — 건너뜀')
            conn.close()
            return
        updates = [
            (round(salary * OLD_BASE_BY_YEARS[years] / NEW_BASE_BY_YEARS[years] / 10) * 10, sq)
            for sq, years, salary in rows
        ]
        say(f'  대상(되돌릴 행): {len(updates)}건')
        if APPLY:
            cur.executemany(
                "UPDATE tbl_salary_submission_m SET annual_salary = %s WHERE salary_submission_sq = %s",
                updates,
            )
            conn.commit()
            say(f'커밋 완료 ({schema}). {len(updates)}건을 연봉 스케일로 되돌림.')
        else:
            say('\n드라이런이다. 되돌리려면 --apply 를 붙일 것.')
        conn.close()
        return

    cur.execute(
        "SELECT salary_submission_sq, career_bucket, annual_salary FROM tbl_salary_submission_m "
        "WHERE is_seed_yn = 'Y' AND employment_type = 'FREELANCE' AND annual_salary >= %s "
        "ORDER BY salary_submission_sq", (SCALE_THRESHOLD,),
    )
    rows = cur.fetchall()
    if not rows:
        say('  대상 없음(이미 월단가 스케일이거나 시드가 없음) — 건너뜀')
        conn.close()
        return

    updates = [
        (round(salary * NEW_BASE_BY_YEARS[years] / OLD_BASE_BY_YEARS[years] / 10) * 10, sq)
        for sq, years, salary in rows
    ]
    say(f'  대상 {len(updates)}건 — 연봉 스케일 → 월단가 스케일로 낮춤(연차별 비율 보존)')
    say(f'  예시(앞 3건): {[(s, u) for (u, _), (_, _, s) in zip(updates, rows)][:3]}')

    if APPLY:
        cur.executemany(
            "UPDATE tbl_salary_submission_m SET annual_salary = %s WHERE salary_submission_sq = %s",
            updates,
        )
        conn.commit()
        say(f'\n커밋 완료 ({schema}). {len(updates)}건 반영.')
    else:
        say('\n드라이런이다. 실제로 반영하려면 --apply 를 붙일 것.')

    conn.close()
    print()


def say(msg):
    print(msg)


if __name__ == '__main__':
    main()
