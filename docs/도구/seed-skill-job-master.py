# -*- coding: utf-8 -*-
"""
기술 태그 / 모집 직군 마스터 확충. 공용 DB, 승인 후 실행.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/seed-skill-job-master.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/seed-skill-job-master.py" --apply

왜 필요한가
  프로젝트 등록 폼의 기술 목록이 24개뿐이었다. Language 는 Java·Python 둘, Tool 은 Docker·Git 둘이
  전부다. IT 프리랜서 매칭 플랫폼의 선택지로는 너무 좁아, 대부분의 공고가 실제 기술 스택을
  고를 수 없었다.

  등록 폼에는 "직접 입력"도 새로 생겼지만, 직접 입력한 값은 그 공고에만 저장되고 검색 필터에는
  잡히지 않는다. 흔한 기술은 마스터에 있어야 한다.

번호 규칙 (TBL_SKILL_TAG_C)
  그룹(lvl 1)은 100 단위, 자식(lvl 2)은 그룹번호+1 부터. AUTO_INCREMENT 가 아니라 직접 채번한다.
    100 Language / 200 FrameWork / 300 Tool / 400 Device / 500 OS / 600 DBMS
  여기에 700 Cloud/Infra 그룹을 새로 만든다.

  ※ Device(PC/노트북)는 프로젝트 기술로 부적절해 등록 폼 화이트리스트에서 계속 제외한다
    (ProjectMapper.xml 의 findSkillFormList).

멱등하다. 이름이 이미 있으면 건너뛴다. 어떤 행도 지우거나 고치지 않고 INSERT 만 한다.
접속 정보는 db-backup.py 의 DB 설정을 재사용한다.
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

# ── 추가할 기술 ─────────────────────────────────────────────────────────
# 그룹명 → 기술 목록. 그룹이 없으면 새로 만든다(NEW_GROUP_BASE 참고).
SKILLS = {
    'Language': ['JavaScript', 'TypeScript', 'Kotlin', 'Swift', 'Go', 'C', 'C++', 'C#',
                 'PHP', 'Ruby', 'Rust', 'Dart'],
    'FrameWork': ['Next.js', 'Nuxt', 'Angular', 'Svelte', 'Node.js', 'Express', 'NestJS',
                  'Spring', 'JPA/Hibernate', 'MyBatis', 'Flutter', 'React Native',
                  '.NET', 'FastAPI', 'Laravel'],
    'Tool': ['Jira', 'Confluence', 'Figma', 'GitHub', 'GitLab', 'Postman', 'Grafana'],
    # OracleDB·MySQL·MariaDB·MongoDB·Redis 는 이미 있다.
    'DBMS': ['PostgreSQL', 'MSSQL', 'Elasticsearch', 'DynamoDB'],
    'Cloud/Infra': ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Jenkins', 'Terraform',
                    'Nginx', 'Kafka', 'RabbitMQ'],
}

# 새로 만들 그룹의 번호. 기존 그룹은 100~600 을 쓰고 있다.
NEW_GROUP_BASE = {'Cloud/Infra': 700}

# ── 추가할 모집 직군 (공통코드 1000 하위) ────────────────────────────────
# SQA(품질), 딥러닝·머신러닝은 이미 있어서 겹치는 것은 넣지 않았다.
JOBS = [
    ('DBA', 'DBA'),
    ('DevOps', 'DEVOPS'),
    ('클라우드엔지니어', 'CLOUD_ENGINEER'),
    ('UI/UX디자이너', 'UI_UX_DESIGNER'),
    ('서비스기획', 'SERVICE_PLANNING'),
    ('임베디드', 'EMBEDDED'),
    ('iOS개발', 'IOS_DEVELOPMENT'),
    ('안드로이드개발', 'ANDROID_DEVELOPMENT'),
    ('AI/LLM엔지니어', 'AI_LLM_ENGINEER'),
    ('블록체인', 'BLOCKCHAIN'),
    ('기술지원', 'TECHNICAL_SUPPORT'),
]

JOB_PARENT_CD = 1000


def load_db_config():
    spec = importlib.util.spec_from_file_location('_dbb', os.path.join(HERE, 'db-backup.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    cfg = dict(mod.DB)
    cfg['database'] = 'freelancer_project'
    cfg['autocommit'] = False
    return cfg


def main():
    apply = '--apply' in sys.argv

    conn = pymysql.connect(**load_db_config())
    cur = conn.cursor()

    # ── 기술 ────────────────────────────────────────────────────────────
    cur.execute("SELECT skill_tag_sq, skill_tag_nm FROM TBL_SKILL_TAG_C WHERE parent_skill_tag_sq IS NULL")
    group_sq = {nm: sq for sq, nm in cur.fetchall()}

    cur.execute("SELECT LOWER(skill_tag_nm) FROM TBL_SKILL_TAG_C")
    existing_skills = {r[0] for r in cur.fetchall()}

    skill_rows = []   # (sq, parent_sq, lvl, nm)
    new_groups = []

    for group, names in SKILLS.items():
        if group in group_sq:
            gsq = group_sq[group]
        else:
            gsq = NEW_GROUP_BASE.get(group)
            if gsq is None:
                raise SystemExit(f"'{group}' 그룹이 없고 NEW_GROUP_BASE 에도 번호가 없다.")
            if gsq in {sq for sq in group_sq.values()}:
                raise SystemExit(f"그룹 번호 {gsq} 가 이미 쓰이고 있다.")
            new_groups.append((gsq, None, 1, group))
            skill_rows.append((gsq, None, 1, group))
            existing_skills.add(group.lower())
            group_sq[group] = gsq

        # 그 그룹 안에서 이미 쓰인 가장 큰 번호 다음부터 채번한다.
        cur.execute("SELECT COALESCE(MAX(skill_tag_sq), %s) FROM TBL_SKILL_TAG_C WHERE parent_skill_tag_sq = %s",
                    (gsq, gsq))
        next_sq = cur.fetchone()[0] + 1

        for nm in names:
            if nm.lower() in existing_skills:
                continue
            if next_sq >= gsq + 100:
                raise SystemExit(f"'{group}' 그룹 번호 공간({gsq}~{gsq + 99})이 가득 찼다.")
            skill_rows.append((next_sq, gsq, 2, nm))
            existing_skills.add(nm.lower())
            next_sq += 1

    # ── 직군 ────────────────────────────────────────────────────────────
    cur.execute("SELECT LOWER(common_code_nm) FROM TBL_COMMON_CODE_C WHERE parent_common_code_sq = %s",
                (JOB_PARENT_CD,))
    existing_jobs = {r[0] for r in cur.fetchall()}

    cur.execute("SELECT COALESCE(MAX(common_code_sq), %s) FROM TBL_COMMON_CODE_C WHERE parent_common_code_sq = %s",
                (JOB_PARENT_CD, JOB_PARENT_CD))
    next_job = cur.fetchone()[0] + 1

    job_rows = []     # (sq, parent, lvl, nm, eng)
    for nm, eng in JOBS:
        if nm.lower() in existing_jobs:
            continue
        job_rows.append((next_job, JOB_PARENT_CD, 2, nm, eng))
        next_job += 1

    # ── 출력 ────────────────────────────────────────────────────────────
    print('=' * 60)
    print('마스터 확충 ' + ('(실제 실행)' if apply else '(드라이런)'))
    print('=' * 60)

    if new_groups:
        print(f'\n[신규 그룹] {len(new_groups)}개')
        for sq, _, _, nm in new_groups:
            print(f'  {sq:>4}  {nm}')

    child_rows = [r for r in skill_rows if r[1] is not None]
    print(f'\n[기술] {len(child_rows)}개 추가')
    for sq, parent, _, nm in child_rows:
        gname = next(g for g, s in group_sq.items() if s == parent)
        print(f'  {sq:>4}  [{gname}] {nm}')

    print(f'\n[직군] {len(job_rows)}개 추가')
    for sq, _, _, nm, eng in job_rows:
        print(f'  {sq:>4}  {nm} ({eng})')

    total = len(skill_rows) + len(job_rows)
    if total == 0:
        print('\n추가할 것이 없다. 이미 전부 들어 있다.')
        conn.close()
        return

    if not apply:
        print(f'\n드라이런이다. 실제로 넣으려면 --apply 를 붙일 것. (총 {total}행)')
        conn.close()
        return

    try:
        if skill_rows:
            cur.executemany(
                "INSERT INTO TBL_SKILL_TAG_C "
                "(skill_tag_sq, parent_skill_tag_sq, skill_tag_lvl, skill_tag_nm, skill_tag_is_deleted_yn) "
                "VALUES (%s, %s, %s, %s, 'N')", skill_rows)
        if job_rows:
            cur.executemany(
                "INSERT INTO TBL_COMMON_CODE_C "
                "(common_code_sq, parent_common_code_sq, common_code_lvl, common_code_nm, "
                " common_code_english_nm, common_code_is_active_yn) "
                "VALUES (%s, %s, %s, %s, %s, 'Y')", job_rows)
        conn.commit()
        print(f'\n완료. 기술 {len(skill_rows)}행 / 직군 {len(job_rows)}행 넣었다.')
    except Exception as e:
        conn.rollback()
        print(f'\n실패해서 되돌렸다: {e}')
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
