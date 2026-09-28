# -*- coding: utf-8 -*-
"""
2026-09-15 연봉계산기·리포트·순위표 백엔드용 테이블 신설 + 시드 데이터.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-salary.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-salary.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-salary.py" --prod --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-salary.py" --rollback --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다. 운영 적용 전 반드시 백업:
   !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

무엇을 하는가
  TBL_SALARY_SUBMISSION_M — 연봉계산기 제출 1건(1인 1건, 재제출 시 UPSERT).
  TBL_SALARY_SUBMISSION_SKILL_S — 제출별 보유 기술스택(스킬별 연봉 상승폭 집계용,
    board_skill_tag_s 처럼 콤마 문자열이 아니라 별도 테이블로 둔다).

  이후 SEED_ROWS 명(기본 4000)의 시드 데이터를 INSERT 한다 — user_sq NULL,
  is_seed_yn='Y'. 표본이 부족한 조건(직무×연차×지역×고용형태)에서 통계가 이상해지는
  콜드스타트 문제를 완화하기 위함이며, 백엔드가 실표본이 30건 이상 쌓이면 시드를
  섞지 않고 실데이터만 쓰도록 되어 있다(SalaryStatsCalculator).

  시드에는 company_nm·job_changed_ym·prev_annual_salary 를 넣지 않는다 — "같은 조건
  개발자가 다니는 회사"·"최근 이직 동향" 두 화면 요소는 가짜 회사명·가짜 이직 사례를
  실데이터처럼 보여주면 안 되므로 실제 제출로만 채운다(빈 상태 문구로 대체).

  멱등하다 — 이미 두 테이블이 있으면 CREATE TABLE 단계는 건너뛴다. 시드는 이미
  IS_SEED_YN='Y' 행이 있으면 다시 넣지 않는다(재실행 시 중복 방지).
"""
import os
import random
import sys
import importlib.util

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

try:
    import pymysql
except ImportError:
    raise SystemExit("pymysql 미설치. 먼저 실행: pip install pymysql")

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

TABLE_MAIN = 'TBL_SALARY_SUBMISSION_M'
TABLE_SKILL = 'TBL_SALARY_SUBMISSION_SKILL_S'
SEED_ROWS = 4000
SEED_RANDOM_SEED = 20260915  # 재실행해도 같은 시드 데이터가 나오도록 고정

CREATE_MAIN = f"""
CREATE TABLE {TABLE_MAIN} (
  salary_submission_sq  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '연봉 제출 순번',
  user_sq               BIGINT       NULL     COMMENT '사용자 순번. 시드 행은 NULL',
  is_seed_yn            CHAR(1)      NOT NULL DEFAULT 'N' COMMENT '시드(가상) 데이터 여부 / Y 또는 N',
  seed_nickname         VARCHAR(20)  NULL     COMMENT '시드 전용 마스킹 닉네임(예: 김**). 실제 제출은 NULL, 조회 시 회원 닉네임 사용',
  employment_type       VARCHAR(20)  NOT NULL COMMENT 'EMPLOYED 또는 FREELANCE',
  job_nm                VARCHAR(100) NOT NULL COMMENT '직무명 (JOB_POSITION 공통코드 명칭)',
  career_bucket         VARCHAR(20)  NOT NULL COMMENT '연차 구간 (1~2년/3~5년/6~9년/10년+)',
  region_nm             VARCHAR(30)  NOT NULL COMMENT '지역명 (시/도 또는 원격)',
  annual_salary         INT          NOT NULL COMMENT '연봉(만원 단위)',
  age_band              VARCHAR(20)  NULL     COMMENT '선택 입력 — 나이대',
  education_nm          VARCHAR(50)  NULL     COMMENT '선택 입력 — 최종학력',
  company_size          VARCHAR(30)  NULL     COMMENT '선택 입력 — 회사 규모',
  company_type          VARCHAR(30)  NULL     COMMENT '선택 입력 — 회사 유형',
  position_nm           VARCHAR(50)  NULL     COMMENT '선택 입력 — 직급',
  team_size             VARCHAR(30)  NULL     COMMENT '선택 입력 — 팀 규모',
  employment_subtype    VARCHAR(30)  NULL     COMMENT '선택 입력 — 정규직/계약직 (재직자만)',
  remote_type           VARCHAR(30)  NULL     COMMENT '선택 입력 — 근무 형태',
  bonus_amount          INT          NULL     COMMENT '선택 입력 — 성과급(만원). NULL=미응답, 0=없음',
  stock_opt             VARCHAR(10)  NULL     COMMENT '선택 입력 — 스톡옵션 보유 여부(있음/없음)',
  job_change_count      VARCHAR(20)  NULL     COMMENT '선택 입력 — 이직 횟수 구간',
  company_nm            VARCHAR(100) NULL     COMMENT '현재 재직 회사명 — "같은 조건 개발자가 다니는 회사" 실데이터 집계용',
  prev_annual_salary    INT          NULL     COMMENT '직전 연봉(만원) — 이직 동향 인상폭 계산용',
  job_changed_ym        CHAR(7)      NULL     COMMENT '최근 이직 연월(YYYY-MM) — "최근 이직 동향" 피드용',
  created_at_dtm        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  updated_at_dtm        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시(재제출 시 갱신)',
  PRIMARY KEY (salary_submission_sq),
  UNIQUE KEY uq_salary_submission_user (user_sq),
  KEY idx_salary_group (job_nm, career_bucket, region_nm, employment_type),
  KEY idx_salary_amount (annual_salary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='연봉계산기 제출 — 1인 1건, 재제출 시 UPSERT. 시드(is_seed_yn=Y)는 표본 보정용 가상 데이터'
"""

CREATE_SKILL = f"""
CREATE TABLE {TABLE_SKILL} (
  salary_submission_skill_sq BIGINT      NOT NULL AUTO_INCREMENT COMMENT '연봉 제출 기술스택 순번',
  salary_submission_sq       BIGINT      NOT NULL COMMENT '연봉 제출 순번',
  skill_tag_nm                VARCHAR(50) NOT NULL COMMENT '기술 태그 이름',
  PRIMARY KEY (salary_submission_skill_sq),
  KEY idx_skill_submission (salary_submission_sq),
  KEY idx_skill_nm (skill_tag_nm),
  CONSTRAINT FK_salary_submission_skill FOREIGN KEY (salary_submission_sq)
    REFERENCES {TABLE_MAIN} (salary_submission_sq) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='연봉 제출별 보유 기술스택 — 스킬 취득 시 예상 상승률 집계용'
"""

DROP_ALL = f"DROP TABLE IF EXISTS {TABLE_SKILL}; DROP TABLE IF EXISTS {TABLE_MAIN};"

# --- 시드 생성용 후보값 ---
# 🔴 반드시 GET /projects/forms(JOB_POSITION 공통코드·TBL_AREA_C·스킬 마스터)가 실제로 내려주는
# 값과 "글자 그대로" 같아야 한다. 시드의 job_nm/region_nm/skill_tag_nm이 실제 회원 제출값과
# 다르면 두 데이터가 절대 같은 그룹으로 안 묶여 시드 보정이 무의미해진다(2026-09-15 QA 중 발견 —
# 처음엔 "백엔드 개발자"·"서울" 같은 임의 표기를 썼다가 실제론 "백엔드/서버개발"·"서울특별시"임을
# 확인하고 고쳤다). 값이 바뀌면(공통코드·지역 개편) 이 목록도 같이 갱신해야 한다.
YEAR_BUCKETS = ['1~2년', '3~5년', '6~9년', '10년+']
JOBS = [
    '개발PM', '데이터분석가', '게임개발', '백엔드/서버개발', '보안컨설팅', '앱개발',
    '데이터엔지니어', '웹마스터', '웹개발', '프론트엔드', 'BI 엔지니어', '시스템엔지니어',
    '퍼블리셔', 'SQA', 'SI개발', '검색엔진', '네트워크', '딥러닝', '전문분야', '머신러닝',
    'DBA', 'DevOps', '클라우드엔지니어', 'UI/UX디자이너', '서비스기획', '임베디드',
    'iOS개발', '안드로이드개발', 'AI/LLM엔지니어', '블록체인', '기술지원',
]
REGIONS = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시',
    '울산광역시', '세종특별자치시', '경기도', '충청북도', '충청남도', '전라남도',
    '경상북도', '경상남도', '제주도', '강원도', '전라북도', '원격',
]
SKILL_POOL = [
    'Java', 'Python', 'JavaScript', 'TypeScript', 'Kotlin', 'Swift', 'Go',
    'Spring Boot', 'Spring', 'Django', 'React', 'Vue.js', 'Next.js', 'Node.js', 'NestJS',
    'Flutter', 'React Native', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Jenkins',
    'MySQL', 'MariaDB', 'MongoDB', 'Redis', 'PostgreSQL', 'Elasticsearch', 'Kafka',
]
BASE_SALARY_BY_YEARS = {'1~2년': 3600, '3~5년': 4800, '6~9년': 6200, '10년+': 8000}
# annual_salary 컬럼은 FREELANCE 에는 "월단가"가 들어간다(SalaryMapper.xml rankingWhere 주석 참고,
# 4대보험·국민연금 미포함 특성상 EMPLOYED 연봉/12 역산 대신 연차별로 직접 지정, 2026-09-22 확정).
BASE_MONTHLY_BY_YEARS = {'1~2년': 350, '3~5년': 450, '6~9년': 550, '10년+': 700}


def table_exists(cur, table):
    cur.execute(
        "SELECT COUNT(*) FROM information_schema.TABLES "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s",
        (table,))
    return cur.fetchone()[0] > 0


def seed_exists(cur):
    if not table_exists(cur, TABLE_MAIN):
        return False
    cur.execute(f"SELECT COUNT(*) FROM {TABLE_MAIN} WHERE is_seed_yn = 'Y'")
    return cur.fetchone()[0] > 0


def build_seed_rows():
    rng = random.Random(SEED_RANDOM_SEED)
    rows = []
    for i in range(SEED_ROWS):
        job = rng.choice(JOBS)
        years = rng.choice(YEAR_BUCKETS)
        region = rng.choice(REGIONS)
        employment = 'FREELANCE' if rng.random() < 0.12 else 'EMPLOYED'
        base = BASE_MONTHLY_BY_YEARS[years] if employment == 'FREELANCE' else BASE_SALARY_BY_YEARS[years]
        salary = round(base * rng.uniform(0.72, 1.55) / 10) * 10
        nickname = rng.choice(['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']) + '**'
        skills = rng.sample(SKILL_POOL, k=rng.randint(2, 5))
        rows.append(dict(
            nickname=nickname, employment=employment, job=job, years=years,
            region=region, salary=salary, skills=skills,
        ))
    return rows


def main():
    apply = '--apply' in sys.argv
    rollback = '--rollback' in sys.argv

    conn, schema = dbconfig.connect()
    cur = conn.cursor()

    mode = '롤백' if rollback else '적용'
    print(f'\n=== 연봉 백엔드 테이블 + 시드 ({mode}) — {"실제 반영" if apply else "드라이런"} ===')

    if rollback:
        exists = table_exists(cur, TABLE_MAIN) or table_exists(cur, TABLE_SKILL)
        if not exists:
            print('  ·  두 테이블 모두 이미 없음 (건너뜀)')
            conn.close()
            return
        print(f'  →  {TABLE_SKILL}, {TABLE_MAIN} DROP (데이터 전부 삭제됨)')
        if not apply:
            print('\n드라이런이다. 실제로 반영하려면 --apply 를 붙일 것.')
            conn.close()
            return
        try:
            for stmt in DROP_ALL.strip().split(';'):
                stmt = stmt.strip()
                if stmt:
                    cur.execute(stmt)
            conn.commit()
            print('완료. 두 테이블 삭제했다.')
        except Exception as e:
            conn.rollback()
            print(f'\n실패해서 되돌렸다: {e}')
            raise
        finally:
            conn.close()
        return

    steps = []
    if table_exists(cur, TABLE_MAIN):
        steps.append((f'{TABLE_MAIN} — 이미 있음 (건너뜀)', None))
    else:
        steps.append((f'{TABLE_MAIN} 생성', CREATE_MAIN))
    if table_exists(cur, TABLE_SKILL):
        steps.append((f'{TABLE_SKILL} — 이미 있음 (건너뜀)', None))
    else:
        steps.append((f'{TABLE_SKILL} 생성 (FK → {TABLE_MAIN})', CREATE_SKILL))

    need_seed = not seed_exists(cur)
    seed_rows = build_seed_rows() if need_seed else []
    if need_seed:
        steps.append((f'시드 {len(seed_rows)}건 INSERT (is_seed_yn=Y, 회사명·이직정보 없음)', 'SEED'))
    else:
        steps.append((f'시드 — 이미 있음 (건너뜀)', None))

    todo = 0
    for desc, sql in steps:
        if sql is None:
            print(f'  ·  {desc}')
            continue
        todo += 1
        print(f'  →  {desc}')
        if sql not in ('SEED',):
            print('     ' + ' '.join(sql.split())[:200])

    if todo == 0:
        print('\n변경할 것이 없다.')
        conn.close()
        return

    if not apply:
        print(f'\n드라이런이다. 실제로 반영하려면 --apply 를 붙일 것. (변경 {todo}건)')
        conn.close()
        return

    try:
        for desc, sql in steps:
            if sql is None:
                continue
            if sql == 'SEED':
                # 행마다 개별 INSERT를 왕복하면 원격 DB(db.estsw.co.kr) 기준 4000건에 수십 분이
                # 걸린다 — executemany로 멀티-VALUES INSERT 한두 번에 몰아넣는다.
                insert_main = (
                    f"INSERT INTO {TABLE_MAIN} "
                    "(is_seed_yn, seed_nickname, employment_type, job_nm, career_bucket, region_nm, annual_salary) "
                    "VALUES ('Y', %s, %s, %s, %s, %s, %s)"
                )
                cur.executemany(insert_main, [
                    (row['nickname'], row['employment'], row['job'], row['years'], row['region'], row['salary'])
                    for row in seed_rows
                ])
                # pymysql의 executemany는 내부적으로 여러 배치로 쪼갤 수 있어 lastrowid만으로
                # id 연속성을 가정하면 틀릴 수 있다 — 방금 넣은 시드 행을 다시 조회해 실제
                # 할당된 id를 가져온다(이 트랜잭션 안에서 넣은 순서 그대로 정렬됨을 보장).
                cur.execute(
                    f"SELECT salary_submission_sq FROM {TABLE_MAIN} WHERE is_seed_yn = 'Y' "
                    "ORDER BY salary_submission_sq"
                )
                submission_sqs = [r[0] for r in cur.fetchall()]
                if len(submission_sqs) != len(seed_rows):
                    raise RuntimeError(
                        f"방금 넣은 시드 행 수({len(submission_sqs)})가 예상({len(seed_rows)})과 다르다."
                    )
                skill_values = []
                for submission_sq, row in zip(submission_sqs, seed_rows):
                    skill_values.extend((submission_sq, skill) for skill in row['skills'])
                insert_skill = f"INSERT INTO {TABLE_SKILL} (salary_submission_sq, skill_tag_nm) VALUES (%s, %s)"
                cur.executemany(insert_skill, skill_values)
                print(f'  ✓  {desc} (스킬 {len(skill_values)}건 포함)')
            else:
                cur.execute(sql)
                print(f'  ✓  {desc}')
        conn.commit()
        print(f'\n완료. {todo}건 반영했다.')
    except Exception as e:
        conn.rollback()
        print(f'\n실패해서 되돌렸다: {e}')
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
