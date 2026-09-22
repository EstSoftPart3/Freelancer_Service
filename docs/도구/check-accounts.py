# -*- coding: utf-8 -*-
"""
계정 현황 조회 (읽기 전용, SELECT 만)

  python "C:/dev/Freelancer_Service/docs/도구/check-accounts.py"

무엇을 보나
  - TBL_USER_M 의 유형별 분포 + admin/estsw_admin 상세
  - TBL_COMPANY_S (기업 프로필) 현황
  - estsw_admin(148) 을 지울 때 걸리는 참조가 있는지

주의: DB 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import os
import sys

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          database='freelancer_project', charset='utf8mb4')

# estsw_admin(148) 을 참조할 수 있는 곳. (테이블, user_sq 컬럼)
REF = [
    ('TBL_BOARD_M', 'user_sq'),
    ('TBL_BOARD_ANSWER_S', 'user_sq'),
    ('TBL_BOARD_REPLY_S', 'user_sq'),
    ('TBL_PROJECT_M', 'reg_user_sq'),
    ('TBL_PROJECT_APPLICATION_S', 'user_sq'),
    ('TBL_COMPANY_S', 'user_sq'),
    ('TBL_COMPANY_MEMBER_R', 'user_sq'),
    ('TBL_RESUME_M', 'user_sq'),
    ('TBL_NOTIFICATION_S', 'user_sq'),
]


def show(cur, title, sql, args=None):
    print()
    print(f'── {title}')
    try:
        cur.execute(sql, args or ())
        rows = cur.fetchall()
        if not rows:
            print('   (없음)')
            return
        cols = [d[0] for d in cur.description]
        print('   ' + ' | '.join(cols))
        for r in rows:
            print('   ' + ' | '.join('' if v is None else str(v) for v in r))
    except Exception as e:
        print(f'   ERR {e}')


def main():
    print('=' * 72)
    print('계정 현황 (읽기 전용)')
    print(f'대상 DB: {DB["host"]}/{DB["database"]}')
    print('=' * 72)

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    show(cur, '회원 유형별 분포', """
        SELECT u.user_type_cd,
               (SELECT c.common_code_nm FROM TBL_COMMON_CODE_C c
                 WHERE c.common_code_sq = u.user_type_cd) AS type_nm,
               COUNT(*) AS cnt
          FROM TBL_USER_M u
         GROUP BY u.user_type_cd
         ORDER BY u.user_type_cd
    """)

    show(cur, '관리자/운영 계정 상세', """
        SELECT user_sq, user_id, user_nm, user_nickname, user_email,
               user_phone_num, user_type_cd, address_sq, user_is_deleted_yn
          FROM TBL_USER_M
         WHERE user_id IN ('admin', 'estsw_admin')
         ORDER BY user_sq
    """)

    show(cur, '기업 프로필(TBL_COMPANY_S)', """
        SELECT company_sq, user_sq, company_nm, company_biz_num,
               company_auth_status_cd, address_sq
          FROM TBL_COMPANY_S
         ORDER BY company_sq
    """)

    print()
    print('── estsw_admin(148) 참조 현황')
    for tbl, col in REF:
        try:
            cur.execute(f'SELECT COUNT(*) FROM {tbl} WHERE {col} = 148')
            n = cur.fetchone()[0]
            mark = '  ← 있다' if n else ''
            print(f'   {tbl:32s} {col:12s} {n:>6}{mark}')
        except Exception as e:
            print(f'   {tbl:32s} {col:12s}   ERR {e}')

    show(cur, 'TBL_USER_M 컬럼 구조', """
        SELECT column_name, column_type, is_nullable, column_default
          FROM information_schema.columns
         WHERE table_schema = %s AND table_name = 'TBL_USER_M'
         ORDER BY ordinal_position
    """, (DB['database'],))

    show(cur, 'TBL_COMPANY_S 컬럼 구조', """
        SELECT column_name, column_type, is_nullable, column_default
          FROM information_schema.columns
         WHERE table_schema = %s AND table_name = 'TBL_COMPANY_S'
         ORDER BY ordinal_position
    """, (DB['database'],))

    conn.close()
    print()
    print('=' * 72)


if __name__ == '__main__':
    main()
