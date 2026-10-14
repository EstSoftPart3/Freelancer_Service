# -*- coding: utf-8 -*-
"""
2026-10-14 회의 피드백 1번 — 연봉 시드를 지우고 지역·직무·연차별로 143,840건 다시 만든다.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/seed-2026-10-14-salary-regen.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/seed-2026-10-14-salary-regen.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/seed-2026-10-14-salary-regen.py" --prod --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다. 롤백 기능은 없다 — 운영 적용 전 반드시 백업:
   !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

무엇을 하는가
  is_seed_yn='Y' 행을 전부 지우고(스킬은 FK CASCADE) 칸(지역×고용형태×직무31×연차4)마다 목표 인원만큼
  새로 넣는다. 실제 제출(is_seed_yn='N')은 건드리지 않는다. 난수 seed 고정이라 재실행해도 같은 결과.
  소요: 개발 DB 실측 27초(2026-10-14, 스킬 498,788행 포함).

  칸당 인원(정규/프리) — 수도권(서울·경기·인천) 100/100, 광역시+세종 30/30, 도+제주 10/10, 원격 10/30.
  → 3×124×200 + 6×124×60 + 8×124×20 + 1×124×40 = 143,840건. 30명 미만 칸(도·제주)은 백엔드가
  기존 로직대로 지역 조건을 풀어 전국과 비교한다(SalaryService.resolveGroup).

  연봉 = 연차 기준값 × 지역계수 × 직무계수 × 기술가산(PREMIUM 하나당 +4%) × 0.75~1.40, 10만원 단위.
  프리랜서는 annual_salary 에 월단가가 들어간다(migrate-2026-09-22-salary-freelance-monthly.py 참고).
  이전 연봉·이직연월도 여기서 같이 채운다(migrate-2026-09-17-salary-seed-prev.py 와 같은 공식) —
  그 스크립트는 UPDATE 를 행마다 보내 14만 건이면 원격 DB 에서 수십 분 걸린다.

  🔴 job_nm/region_nm/skill 이름은 GET /projects/forms 가 내려주는 값과 글자 그대로 같아야 한다
  (migrate-2026-09-salary.py 106행 주석). C·C++·Linux·Rust·Figma 는 2026-10-14 개발·운영 스킬 마스터에서 확인.
"""
import importlib.util
import os
import random
import sys
import time
from collections import Counter
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

TABLE_MAIN = 'TBL_SALARY_SUBMISSION_M'
TABLE_SKILL = 'TBL_SALARY_SUBMISSION_SKILL_S'
SEED_RANDOM_SEED = 20261014

YEAR_BUCKETS = ['1~2년', '3~5년', '6~9년', '10년+']
BASE_SALARY_BY_YEARS = {'1~2년': 3600, '3~5년': 4800, '6~9년': 6200, '10년+': 8000}
BASE_MONTHLY_BY_YEARS = {'1~2년': 350, '3~5년': 450, '6~9년': 550, '10년+': 700}

# 지역 묶음: (지역들, 정규 인원, 프리 인원, 연봉 계수)
REGION_GROUPS = [
    ('수도권', ['서울특별시', '경기도', '인천광역시'], 100, 100, 1.00),
    ('광역시·세종', ['부산광역시', '대구광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'], 30, 30, 0.93),
    ('도·제주', ['충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '강원도', '제주도'], 10, 10, 0.88),
    ('원격', ['원격'], 10, 30, 1.00),
]

SKILL_POOLS = {
    'BE': ['Java', 'Kotlin', 'Go', 'Python', 'Spring Boot', 'Spring', 'Django', 'Node.js', 'NestJS',
           'MySQL', 'MariaDB', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'AWS'],
    'FE': ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Next.js', 'Node.js'],
    'DESIGN': ['Figma', 'JavaScript', 'TypeScript', 'React', 'Vue.js'],
    'IOS': ['Swift', 'Flutter', 'React Native'],
    'AOS': ['Kotlin', 'Java', 'Flutter', 'React Native'],
    'APP': ['Swift', 'Kotlin', 'Flutter', 'React Native', 'JavaScript', 'TypeScript'],
    'DATA': ['Python', 'Kafka', 'Elasticsearch', 'PostgreSQL', 'MongoDB', 'AWS', 'GCP', 'Docker', 'Kubernetes'],
    'INFRA': ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Jenkins', 'Go', 'Python', 'Redis', 'Linux'],
    'EMB': ['C', 'C++', 'Linux', 'Python', 'Rust'],
    'DB': ['MySQL', 'MariaDB', 'PostgreSQL', 'MongoDB', 'Redis', 'Python'],
    'ETC': ['JavaScript', 'TypeScript', 'Python', 'Java', 'MySQL', 'AWS'],
}
PREMIUM_SKILLS = {'Kubernetes', 'Kafka', 'Go', 'AWS', 'Elasticsearch', 'Next.js', 'Swift'}

# 직무: (연봉 계수, 기술 풀)
JOBS = {
    'AI/LLM엔지니어': (1.25, 'DATA'), '딥러닝': (1.22, 'DATA'), '머신러닝': (1.20, 'DATA'),
    '보안컨설팅': (1.15, 'INFRA'), '블록체인': (1.15, 'BE'), '데이터엔지니어': (1.12, 'DATA'),
    '클라우드엔지니어': (1.12, 'INFRA'), '개발PM': (1.10, 'ETC'), 'DevOps': (1.10, 'INFRA'),
    '백엔드/서버개발': (1.08, 'BE'), '검색엔진': (1.08, 'DATA'), 'iOS개발': (1.03, 'IOS'),
    'DBA': (1.03, 'DB'), '안드로이드개발': (1.02, 'AOS'), '프론트엔드': (1.02, 'FE'),
    '데이터분석가': (1.00, 'DATA'), 'BI 엔지니어': (1.00, 'DATA'), '게임개발': (1.00, 'BE'),
    '앱개발': (1.00, 'APP'), '임베디드': (1.00, 'EMB'), '전문분야': (1.00, 'ETC'),
    '웹개발': (0.98, 'FE'), '시스템엔지니어': (0.97, 'INFRA'), '서비스기획': (0.97, 'ETC'),
    '네트워크': (0.95, 'INFRA'), 'SI개발': (0.93, 'BE'), 'SQA': (0.92, 'ETC'),
    'UI/UX디자이너': (0.92, 'DESIGN'), '웹마스터': (0.86, 'FE'), '퍼블리셔': (0.85, 'FE'),
    '기술지원': (0.85, 'ETC'),
}

NICK_INITIALS = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']


def months_ago_ym(today, months):
    y, m = today.year, today.month - months
    while m <= 0:
        m += 12
        y -= 1
    return f'{y}-{m:02d}'


def round10(n):
    return round(n / 10) * 10


def build_seed_rows(today):
    rng = random.Random(SEED_RANDOM_SEED)
    rows = []
    for _, regions, n_emp, n_free, region_mult in REGION_GROUPS:
        for region in regions:
            for employment, n in (('EMPLOYED', n_emp), ('FREELANCE', n_free)):
                base_by_years = BASE_MONTHLY_BY_YEARS if employment == 'FREELANCE' else BASE_SALARY_BY_YEARS
                for job, (job_mult, pool_key) in JOBS.items():
                    pool = SKILL_POOLS[pool_key]
                    for years in YEAR_BUCKETS:
                        for _ in range(n):
                            skills = rng.sample(pool, k=min(rng.randint(2, 5), len(pool)))
                            premium = 1 + 0.04 * sum(s in PREMIUM_SKILLS for s in skills)
                            salary = round10(base_by_years[years] * region_mult * job_mult * premium
                                             * rng.uniform(0.75, 1.40))
                            # 90% 이직 인상(+3~35%), 10% 소폭 하락(-1~-10%) — seed-prev 스크립트와 같은 공식
                            bump = rng.uniform(-0.10, -0.01) if rng.random() < 0.10 else rng.uniform(0.03, 0.35)
                            rows.append(dict(
                                nickname=rng.choice(NICK_INITIALS) + '**', employment=employment, job=job,
                                years=years, region=region, salary=salary,
                                prev=max(10, round10(salary / (1 + bump))),
                                changed_ym=months_ago_ym(today, rng.randint(0, 11)), skills=skills,
                            ))
    return rows


def main():
    apply = '--apply' in sys.argv
    conn, schema = dbconfig.connect()
    cur = conn.cursor()

    rows = build_seed_rows(date.today())
    assert len(rows) == 143840, len(rows)
    by_group = Counter()
    region_to_group = {r: g for g, regions, *_ in REGION_GROUPS for r in regions}
    for row in rows:
        by_group[(region_to_group[row['region']], row['employment'])] += 1

    cur.execute(f"SELECT COUNT(*) FROM {TABLE_MAIN} WHERE is_seed_yn = 'Y'")
    old_seed = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {TABLE_MAIN} WHERE is_seed_yn = 'N'")
    real = cur.fetchone()[0]

    print(f'\n=== 연봉 시드 재생성 — {"실제 반영" if apply else "드라이런"} ({schema}) ===')
    print(f'  →  기존 시드 {old_seed:,}건 삭제 (실제 제출 {real:,}건은 유지)')
    for (group, employment), n in by_group.items():
        print(f'  →  {group:<6} {"정규" if employment == "EMPLOYED" else "프리"} {n:>7,}건')
    print(f'  →  합계 {len(rows):,}건, 스킬 {sum(len(r["skills"]) for r in rows):,}건')

    if not apply:
        print('\n드라이런이다. 실제로 반영하려면 --apply 를 붙일 것.')
        conn.close()
        return

    started = time.time()
    try:
        cur.execute(f"DELETE FROM {TABLE_MAIN} WHERE is_seed_yn = 'Y'")
        # executemany 가 INSERT 를 멀티 VALUES 로 묶어줘 왕복 수십 번이면 끝난다(행마다 보내면 수십 분).
        # 🔴 VALUES 안에 'Y' 같은 리터럴이 하나라도 섞이면 pymysql 이 묶지 않고 행마다 보낸다 — 전부 %s 로 둘 것.
        cur.executemany(
            f"INSERT INTO {TABLE_MAIN} (is_seed_yn, seed_nickname, employment_type, job_nm, career_bucket, "
            "region_nm, annual_salary, prev_annual_salary, job_changed_ym) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            [('Y', r['nickname'], r['employment'], r['job'], r['years'], r['region'], r['salary'], r['prev'],
              r['changed_ym']) for r in rows])
        # 기존 시드를 방금 지웠으니 is_seed_yn='Y' 는 전부 이번에 넣은 행 — 넣은 순서대로 id 를 받는다.
        cur.execute(f"SELECT salary_submission_sq FROM {TABLE_MAIN} WHERE is_seed_yn = 'Y' "
                    "ORDER BY salary_submission_sq")
        sqs = [r[0] for r in cur.fetchall()]
        if len(sqs) != len(rows):
            raise RuntimeError(f'방금 넣은 시드 행 수({len(sqs)})가 예상({len(rows)})과 다르다.')
        cur.executemany(
            f"INSERT INTO {TABLE_SKILL} (salary_submission_sq, skill_tag_nm) VALUES (%s, %s)",
            [(sq, skill) for sq, row in zip(sqs, rows) for skill in row['skills']])
        conn.commit()
        print(f'\n완료. {len(rows):,}건 넣었다. ({time.time() - started:.0f}초)')
    except Exception as e:
        conn.rollback()
        print(f'\n실패해서 되돌렸다: {e}')
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
