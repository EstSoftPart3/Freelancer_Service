# -*- coding: utf-8 -*-
"""
2026-09-10 소속(TBL_COMPANY_MEMBER_R) 재직 상태 유니크 제약 추가.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-10-affiliation-unique-member.py"
  개발 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-10-affiliation-unique-member.py" --apply
  운영 DB 적용  : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-10-affiliation-unique-member.py" --prod --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/migrate-2026-09-10-affiliation-unique-member.py" --rollback --apply

🔴 --prod 를 붙이지 않으면 개발 DB(freelancer_develop) 다. 운영 적용 전 반드시 백업:
   !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

무엇을 하는가
  AffiliationService.updateApplicationStatus 가 소속 신청을 승인(502)할 때
  "이미 다른 회사에 재직 중인가" 를 SELECT 로 먼저 확인하고 그 다음 INSERT 한다.
  이 둘 사이에 아무 잠금도 없어서, 서로 다른 두 회사가 같은 지원자를 거의 동시에
  승인하면 두 INSERT 가 모두 통과해 한 사람이 두 회사에 동시 재직하는 상태가 될 수 있다.

  2026-09-10 확인 결과 TBL_COMPANY_MEMBER_R 에는 PRIMARY KEY 외에 인덱스가
  전혀 없어 이 경합을 막을 것이 DB 에 아무것도 없었다(SHOW INDEX 로 직접 확인함).

  MariaDB 는 조건부(partial) 유니크 인덱스를 직접 지원하지 않으므로, 가상 컬럼으로
  우회한다 — company_member_status_cd = 401(재직중) 일 때만 user_sq 값을 갖고
  나머지는 NULL 인 가상 컬럼을 만들고 그 컬럼에 유니크 인덱스를 건다.
  유니크 인덱스는 NULL 을 중복으로 보지 않으므로, "재직 중인 소속은 사용자당
  최대 1개" 만 강제되고 퇴사한 이력(401 이 아닌 행)은 얼마든지 쌓일 수 있다.

  적용 후 애플리케이션 코드도 손봐야 한다 — 지금 이 시점엔 아직 안 되어 있다:
    AffiliationService.updateApplicationStatus 의 insertCompanyMember 호출을
    try/catch 로 감싸 DuplicateKeyException 을 기존 IllegalStateException
    ("해당 지원자는 현재 다른 기업에 재직 중입니다.") 으로 변환할 것.

  기존 데이터에 이미 중복(한 사용자가 두 회사에 동시 재직 중인 상태)이 있으면
  ADD UNIQUE KEY 단계에서 에러가 난다 — 이 스크립트는 그 경우를 미리 감지해서
  적용 전에 알려준다(사전 점검 단계, 실행은 막지 않는다. 실제로 중복이 있다면
  먼저 데이터를 정리해야 한다).

멱등하다. 이미 적용돼 있으면 건너뛴다. 기존 데이터는 지우지 않는다.
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
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

TABLE = 'TBL_COMPANY_MEMBER_R'
COLUMN = 'active_user_sq'
INDEX = 'uq_active_member_per_user'

ADD_COLUMN_AND_INDEX = f"""
ALTER TABLE {TABLE}
  ADD COLUMN {COLUMN} BIGINT
    GENERATED ALWAYS AS (CASE WHEN company_member_status_cd = 401 THEN user_sq END) VIRTUAL
    COMMENT '재직 중(401)일 때만 user_sq, 아니면 NULL. 유니크 인덱스로 동시 재직을 막는다',
  ADD UNIQUE KEY {INDEX} ({COLUMN})
"""

DROP_COLUMN_AND_INDEX = f"""
ALTER TABLE {TABLE} DROP INDEX {INDEX}, DROP COLUMN {COLUMN}
"""


def column_exists(cur, table, column):
    cur.execute(
        "SELECT COUNT(*) FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s",
        (table, column))
    return cur.fetchone()[0] > 0


def find_existing_duplicates(cur):
    """이미 두 회사 이상에 재직 중(401)인 사용자가 있는지 사전 점검."""
    cur.execute(
        f"SELECT user_sq, COUNT(*) AS cnt FROM {TABLE} "
        f"WHERE company_member_status_cd = 401 "
        f"GROUP BY user_sq HAVING cnt > 1"
    )
    return cur.fetchall()


def main():
    apply = '--apply' in sys.argv
    rollback = '--rollback' in sys.argv

    conn, schema = dbconfig.connect()
    cur = conn.cursor()

    mode = '롤백' if rollback else '적용'
    print(f'\n=== 소속 재직 상태 유니크 제약 ({mode}) — {"실제 반영" if apply else "드라이런"} ===')

    already = column_exists(cur, TABLE, COLUMN)

    if rollback:
        if already:
            steps = [('가상 컬럼·유니크 인덱스 삭제', DROP_COLUMN_AND_INDEX)]
        else:
            steps = [('가상 컬럼·유니크 인덱스 — 이미 없음 (건너뜀)', None)]
    else:
        if already:
            steps = [('가상 컬럼·유니크 인덱스 — 이미 있음 (건너뜀)', None)]
        else:
            dups = find_existing_duplicates(cur)
            if dups:
                print('\n🔴 사전 점검: 이미 두 회사 이상에 재직 중(401)으로 표시된 사용자가 있다.')
                print('   이 상태로 유니크 인덱스를 걸면 ALTER TABLE 자체가 실패한다.')
                for user_sq, cnt in dups:
                    print(f'   - user_sq={user_sq}: {cnt}개 회사에 동시 재직 중으로 기록됨')
                print('   → 먼저 어느 쪽이 진짜인지 판단해 나머지를 402(퇴사 등)로 정리할 것.\n')
            steps = [(f'{TABLE} 에 {COLUMN} 가상 컬럼 + 유니크 인덱스 추가', ADD_COLUMN_AND_INDEX)]

    todo = 0
    for desc, sql in steps:
        if sql is None:
            print(f'  ·  {desc}')
            continue
        todo += 1
        print(f'  →  {desc}')
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
            cur.execute(sql)
            print(f'  ✓  {desc}')
        conn.commit()
        print(f'\n완료. {todo}건 반영했다.')
        if not rollback:
            print('\n⚠️  애플리케이션 코드도 마저 반영할 것 —')
            print('   AffiliationService.updateApplicationStatus 의 insertCompanyMember 호출을')
            print('   try/catch(DuplicateKeyException) 으로 감싸 "이미 재직 중" 메시지로 바꿀 것.')
    except Exception as e:
        conn.rollback()
        print(f'\n실패해서 되돌렸다: {e}')
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
