# -*- coding: utf-8 -*-
"""
2026-09-17 연봉 시드 데이터에 이전 연봉(prev_annual_salary)·이직연월 보강.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-salary-seed-prev.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-salary-seed-prev.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-salary-seed-prev.py" --prod --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-17-salary-seed-prev.py" --rollback --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다.

무엇을 하는가 / 왜 원래 설계와 다른가
  migrate-2026-09-salary.py 는 시드에 prev_annual_salary·job_changed_ym 을 일부러
  비워뒀다 — "같은 조건 개발자가 다니는 회사"·"최근 이직 동향"을 가짜 이직 사례로
  채우면 안 된다는 이유였다. 연봉 순위표의 증감률(changePct)도 같은 필드에서
  계산되다 보니, 그 설계 그대로는 순위표 증감률이 시드 4000건 전부 "-"로만 뜬다.

  QA/데모 목적으로 순위표 증감률이 실제로 동작하는 모습을 보기 위해, 사용자 요청에
  따라 이 설계를 의도적으로 깨고 시드의 일부(기본 30%)에 prev_annual_salary·
  job_changed_ym 을 채운다. "최근 이직 동향" 피드와 "같은 조건 개발자가 다니는
  회사"(현재 화면에서 주석 처리됨)도 같은 필드를 쓰므로 부수적으로 함께 채워진다 —
  이 트레이드오프를 인지하고 진행하는 것이다. 실서버 배포 전 이 스크립트를
  운영 DB에 --prod 로 적용할지는 별도로 판단할 것.

  대상은 is_seed_yn='Y' AND prev_annual_salary IS NULL 인 행 중 무작위 30%.
  인상률은 대부분 이직으로 인한 상승(+3%~+35%), 10% 확률로 소폭 하락(-10%~-1%)을
  준다. 이직연월은 최근 12개월 내 무작위.

  멱등하다 — 이미 prev_annual_salary 가 채워진 행은 다시 건드리지 않는다.
"""
import importlib.util
import os
import random
import sys
from datetime import date

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
FILL_RATIO = 1.0
SEED_RANDOM_SEED = 20260917


def say(msg):
    print(msg)


def months_ago_ym(today: date, months: int) -> str:
    y, m = today.year, today.month - months
    while m <= 0:
        m += 12
        y -= 1
    return f'{y:04d}-{m:02d}'


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    mode = '롤백' if ROLLBACK else '적용'
    say(f'\n=== 연봉 시드 이전연봉·이직연월 보강 ({mode}) — {"실제 반영" if APPLY else "드라이런"} ===')

    if ROLLBACK:
        cur.execute(
            "SELECT COUNT(*) FROM tbl_salary_submission_m "
            "WHERE is_seed_yn = 'Y' AND prev_annual_salary IS NOT NULL"
        )
        cnt = cur.fetchone()[0]
        say(f'  대상(되돌릴 행): {cnt}건')
        if APPLY:
            cur.execute(
                "UPDATE tbl_salary_submission_m SET prev_annual_salary = NULL, job_changed_ym = NULL "
                "WHERE is_seed_yn = 'Y' AND prev_annual_salary IS NOT NULL"
            )
            conn.commit()
            say(f'커밋 완료 ({schema}). {cnt}건 초기화.')
        else:
            say('\n드라이런이다. 되돌리려면 --apply 를 붙일 것.')
        conn.close()
        return

    cur.execute(
        "SELECT salary_submission_sq, annual_salary FROM tbl_salary_submission_m "
        "WHERE is_seed_yn = 'Y' AND prev_annual_salary IS NULL ORDER BY salary_submission_sq"
    )
    candidates = cur.fetchall()
    if not candidates:
        say('  대상 없음(이미 전부 채워져 있거나 시드가 없음) — 건너뜀')
        conn.close()
        return

    rng = random.Random(SEED_RANDOM_SEED)
    today = date.today()
    picked = rng.sample(candidates, k=round(len(candidates) * FILL_RATIO))

    updates = []
    for sq, annual_salary in picked:
        if rng.random() < 0.10:
            bump = rng.uniform(-0.10, -0.01)
        else:
            bump = rng.uniform(0.03, 0.35)
        prev_salary = max(1, round(annual_salary / (1 + bump)))
        job_changed_ym = months_ago_ym(today, rng.randint(0, 11))
        updates.append((prev_salary, job_changed_ym, sq))

    say(f'  대상 후보 {len(candidates)}건 중 {len(updates)}건({FILL_RATIO:.0%})에 이전연봉·이직연월 채움')

    if APPLY:
        cur.executemany(
            "UPDATE tbl_salary_submission_m SET prev_annual_salary = %s, job_changed_ym = %s "
            "WHERE salary_submission_sq = %s",
            updates,
        )
        conn.commit()
        say(f'\n커밋 완료 ({schema}). {len(updates)}건 반영.')
    else:
        say('\n드라이런이다. 실제로 반영하려면 --apply 를 붙일 것.')

    say('\n--- 반영 후 상태')
    cur.execute(
        "SELECT COUNT(*) FROM tbl_salary_submission_m WHERE is_seed_yn = 'Y' AND prev_annual_salary IS NOT NULL"
    )
    say(f'  prev_annual_salary 채워진 시드 행: {cur.fetchone()[0]}건')

    conn.close()
    print()


if __name__ == '__main__':
    main()
