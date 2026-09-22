# -*- coding: utf-8 -*-
"""
2026-09 프로젝트 등록 폼 개선 — DB 스키마 변경. 공용 DB, 승인 후 실행.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-project-form.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-project-form.py" --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-project-form.py" --rollback --apply

무엇을 하는가
  ① TBL_PROJECT_RECRUIT_JOB_ROLE_S 에 recruit_job_position_nm 컬럼 추가
     등록자가 직접 입력한 직군을 담는다. 공통코드에 새 코드를 만들지 않고
     recruit_job_position_type_cd = 0 + 이름으로 그 공고에만 저장한다.
     (기존 행은 전부 NULL 이고, 조회는 COALESCE 로 공통코드 이름을 우선한다)

  ② TBL_PROJECT_RECRUIT_HEADCOUNT_S 신규 생성
     모집 인원. 지금까지 DB 에 인원 개념 자체가 없었다.
       - developer_grade_cd 가 NULL 인 행 1개  → "총 N명" 모드
       - 등급이 채워진 행 여러 개              → "등급별 모집" 모드
     별도의 모드 플래그를 두지 않는 이유가 이것이다.

  ③ TBL_PROJECT_RECRUIT_HEADCOUNT_S.headcount 를 NULL 허용으로 변경
     NULL = "인원 미정". 인원을 정하지 않고 공고를 올릴 수 있어야 한다는 요구가 나중에 붙었다.
     0 을 미정으로 쓰는 방법도 있지만 "0명 모집" 과 구분이 안 돼 NULL 로 간다.
     ②에서 이미 만든 테이블이면 컬럼만 완화한다.

왜 기존 컬럼은 그대로 두는가
  TBL_PROJECT_M.project_developer_grade_cd 는 검색 필터(경력)와 목록 표시가 쓴다.
  등급별 모드에서도 대표 등급을 계속 채워 넣어 기존 화면이 깨지지 않게 한다.

멱등하다. 이미 적용돼 있으면 건너뛴다. 어떤 데이터도 지우지 않는다.

접속 정보는 db-backup.py 의 DB 설정을 그대로 재사용한다(비밀번호를 여기 또 적지 않기 위해).
실행 전 반드시 db-backup.py 로 백업할 것.
"""
import os
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


def load_db_config():
    """db-backup.py 의 DB dict 를 그대로 쓴다."""
    spec = importlib.util.spec_from_file_location('_dbb', os.path.join(HERE, 'db-backup.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    cfg = dict(mod.DB)
    cfg['database'] = 'freelancer_project'
    cfg['autocommit'] = False
    return cfg


JOB_NAME_COLUMN = """
ALTER TABLE TBL_PROJECT_RECRUIT_JOB_ROLE_S
  ADD COLUMN recruit_job_position_nm VARCHAR(100) NULL
  COMMENT '직접 입력한 직군 이름. 공통코드 직군이면 NULL'
  AFTER recruit_job_position_type_cd
"""

HEADCOUNT_NULLABLE = """
ALTER TABLE TBL_PROJECT_RECRUIT_HEADCOUNT_S
  MODIFY COLUMN headcount INT NULL COMMENT '모집 인원. NULL 이면 인원 미정'
"""

HEADCOUNT_TABLE = """
CREATE TABLE TBL_PROJECT_RECRUIT_HEADCOUNT_S (
  recruit_headcount_sq BIGINT       NOT NULL AUTO_INCREMENT COMMENT '모집 인원 순번',
  project_sq           BIGINT       NOT NULL COMMENT '프로젝트 순번',
  developer_grade_cd   BIGINT       NULL     COMMENT '공통코드 700. NULL 이면 총원 모드',
  headcount            INT          NULL     COMMENT '모집 인원. NULL 이면 인원 미정',
  PRIMARY KEY (recruit_headcount_sq),
  KEY idx_project (project_sq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='공고별 모집 인원. 등급별 여러 행 또는 등급 NULL 단일 행'
"""


def column_exists(cur, table, column):
    cur.execute(
        "SELECT COUNT(*) FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s",
        (table, column))
    return cur.fetchone()[0] > 0


def column_is_nullable(cur, table, column):
    cur.execute(
        "SELECT IS_NULLABLE FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s",
        (table, column))
    row = cur.fetchone()
    return row is not None and row[0] == 'YES'


def table_exists(cur, table):
    cur.execute(
        "SELECT COUNT(*) FROM information_schema.TABLES "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s", (table,))
    return cur.fetchone()[0] > 0


def main():
    apply = '--apply' in sys.argv
    rollback = '--rollback' in sys.argv

    conn = pymysql.connect(**load_db_config())
    cur = conn.cursor()

    steps = []  # (설명, 실행할 SQL 또는 None)

    if rollback:
        if column_exists(cur, 'TBL_PROJECT_RECRUIT_JOB_ROLE_S', 'recruit_job_position_nm'):
            steps.append(('직군 이름 컬럼 삭제',
                          'ALTER TABLE TBL_PROJECT_RECRUIT_JOB_ROLE_S DROP COLUMN recruit_job_position_nm'))
        else:
            steps.append(('직군 이름 컬럼 — 이미 없음 (건너뜀)', None))

        if table_exists(cur, 'TBL_PROJECT_RECRUIT_HEADCOUNT_S'):
            cur.execute("SELECT COUNT(*) FROM TBL_PROJECT_RECRUIT_HEADCOUNT_S")
            rows = cur.fetchone()[0]
            steps.append((f'모집 인원 테이블 삭제 (데이터 {rows}행이 함께 사라진다)',
                          'DROP TABLE TBL_PROJECT_RECRUIT_HEADCOUNT_S'))
        else:
            steps.append(('모집 인원 테이블 — 이미 없음 (건너뜀)', None))
    else:
        if column_exists(cur, 'TBL_PROJECT_RECRUIT_JOB_ROLE_S', 'recruit_job_position_nm'):
            steps.append(('직군 이름 컬럼 — 이미 있음 (건너뜀)', None))
        else:
            steps.append(('TBL_PROJECT_RECRUIT_JOB_ROLE_S.recruit_job_position_nm 추가', JOB_NAME_COLUMN))

        if table_exists(cur, 'TBL_PROJECT_RECRUIT_HEADCOUNT_S'):
            steps.append(('모집 인원 테이블 — 이미 있음 (건너뜀)', None))
            # 이미 NOT NULL 로 만들어진 테이블이라면 NULL 허용으로 완화한다.
            if column_is_nullable(cur, 'TBL_PROJECT_RECRUIT_HEADCOUNT_S', 'headcount'):
                steps.append(('headcount NULL 허용 — 이미 적용됨 (건너뜀)', None))
            else:
                steps.append(('headcount 를 NULL 허용으로 변경 (NULL = 인원 미정)', HEADCOUNT_NULLABLE))
        else:
            steps.append(('TBL_PROJECT_RECRUIT_HEADCOUNT_S 생성', HEADCOUNT_TABLE))

    mode = '롤백' if rollback else '적용'
    print('=' * 60)
    print(f'{mode} 대상 ({"실제 실행" if apply else "드라이런"})')
    print('=' * 60)

    todo = 0
    for desc, sql in steps:
        if sql is None:
            print(f'  ·  {desc}')
            continue
        todo += 1
        print(f'  →  {desc}')
        print('     ' + ' '.join(sql.split())[:160])

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
