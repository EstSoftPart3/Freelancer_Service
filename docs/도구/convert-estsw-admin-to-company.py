# -*- coding: utf-8 -*-
"""
estsw_admin 을 삭제하고 같은 아이디의 **기업(302) 계정**으로 다시 만든다.

  드라이런(기본): python "C:/dev/Freelancer_Service/docs/도구/convert-estsw-admin-to-company.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/convert-estsw-admin-to-company.py" --apply
  되돌리기      : !python "C:/dev/Freelancer_Service/docs/도구/convert-estsw-admin-to-company.py" --rollback

왜 이걸 하는가
  2026-08-26 기준 기업(302) 계정이 **0개**라 프로젝트 공고를 올릴 수 있는 계정이 없다.
  estsw_admin(148, 관리자 303)은 참조 데이터가 하나도 없어 지워도 안전하다.
  BO 로그인은 admin(106) 이 계속 담당한다.

왜 UPDATE 가 아니라 DELETE + INSERT 인가
  사용자 지시가 "지우고 다시 만들어" 였다. 유형만 바꾸면 관리자 시절의
  user_sq(148)·생성일시가 그대로 남아 이력이 헷갈린다. 새로 만들면 user_sq 가
  봇 대역(174~273) 뒤로 새로 잡혀 "오픈 준비 때 만든 기업 계정"이라는 게 분명해진다.

🔴 2502(인증완료)로 넣는 이유
  FO 는 `companyAuthStatusCd === '2501'`(미인증)이면 공고 등록을 막는다
  (`components/project/ProjectListClient.tsx:422`). 국세청 사업자번호 검증을
  거치지 않고 바로 공고를 올리려면 2502 여야 한다.

안전 장치
  - 기본이 드라이런이다. 드라이런도 **실제로 DELETE/INSERT 를 실행한 뒤 ROLLBACK** 한다.
    그래서 제약 위반·중복이 있으면 드라이런에서 그대로 드러난다.
  - estsw_admin 이 참조 데이터를 물고 있으면 아무것도 하지 않고 중단한다.
  - admin(106)은 절대 건드리지 않는다 — BO 로그인 계정이자 봇 생성 템플릿이다.
  - 트랜잭션 하나로 묶는다.

주의: DB 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import os
import sys

try:
    import pymysql
except ImportError:
    raise SystemExit('pymysql 미설치. 먼저 실행: pip install pymysql')

try:
    import bcrypt
except ImportError:
    raise SystemExit('bcrypt 미설치. 먼저 실행: pip install bcrypt')

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          database='freelancer_project', charset='utf8mb4', autocommit=False)

TARGET_USER_ID = 'estsw_admin'

# 부수 컬럼(user_gender_cd, user_birth_dt, user_signup_type_cd, address_sq)을 물려받을 템플릿.
# phase7-accounts.py 와 같은 방식 — 스키마를 몰라도 NOT NULL 컬럼이 빠지지 않는다.
TEMPLATE_USER_ID = 'admin'

# ── 새로 만들 기업 계정 ────────────────────────────────────────────────────
ACCOUNT = dict(
    user_id=TARGET_USER_ID,
    user_pw=os.environ['FREELANCER_CORP_PW'],      # 기존 estsw_admin 과 동일하게 유지
    user_nm='운영관리자',
    user_nickname='운영자',
    user_email='freelancer.service.platform@gmail.com',
    user_phone_num='01000009000',
    user_type_cd=302,             # 기업
)
COMPANY = dict(
    company_nm='Ctrl + F',
    company_auth_status_cd=2502,  # 인증완료 — 이래야 공고 등록이 열린다
    company_agreed_terms_yn='Y',
)

# estsw_admin 이 물고 있으면 안 되는 참조. (테이블, user_sq 컬럼)
# 존재하지 않는 테이블/컬럼은 건너뛴다 — 스키마가 바뀌어도 스크립트가 죽지 않게.
REF = [
    ('TBL_BOARD_M', 'user_sq'),
    ('TBL_BOARD_ANSWER_S', 'user_sq'),
    ('TBL_COMPANY_S', 'user_sq'),
    ('TBL_COMPANY_MEMBER_R', 'user_sq'),
    ('TBL_RESUME_M', 'user_sq'),
]

INSERT_USER_SQL = """
INSERT INTO TBL_USER_M
  (address_sq, user_id, user_email, user_pw, user_nm, user_nickname,
   user_gender_cd, user_phone_num, user_birth_dt, user_type_cd, user_signup_type_cd)
SELECT t.address_sq, %s, %s, %s, %s, %s,
       t.user_gender_cd, %s, t.user_birth_dt, %s, t.user_signup_type_cd
FROM TBL_USER_M t
WHERE t.user_id = %s
LIMIT 1
"""

INSERT_COMPANY_SQL = """
INSERT INTO TBL_COMPANY_S
  (user_sq, address_sq, company_nm, company_auth_status_cd, company_agreed_terms_yn)
VALUES (%s, NULL, %s, %s, %s)
"""


def hash_pw(raw):
    """Spring Security BCryptPasswordEncoder 는 $2a$ 해시를 검증한다. prefix 고정."""
    return bcrypt.hashpw(raw.encode('utf-8'), bcrypt.gensalt(prefix=b'2a')).decode('utf-8')


def table_exists(cur, tbl, col):
    cur.execute("""
        SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema = %s AND table_name = %s AND column_name = %s
    """, (DB['database'], tbl, col))
    return cur.fetchone()[0] > 0


def precheck(cur):
    """무엇 하나라도 걸리면 전부 중단한다."""
    problems = []

    cur.execute("""
        SELECT user_sq, user_type_cd FROM TBL_USER_M WHERE user_id = %s
    """, (TEMPLATE_USER_ID,))
    tpl = cur.fetchone()
    if not tpl:
        problems.append(f"템플릿 계정 '{TEMPLATE_USER_ID}' 이(가) 없다")
    else:
        print(f'  템플릿      : {TEMPLATE_USER_ID} (user_sq={tpl[0]}, type={tpl[1]}) — 건드리지 않는다')

    cur.execute("""
        SELECT user_sq, user_type_cd, user_nm, user_nickname FROM TBL_USER_M WHERE user_id = %s
    """, (TARGET_USER_ID,))
    tgt = cur.fetchone()
    if not tgt:
        print(f"  ⚠️ '{TARGET_USER_ID}' 이(가) 이미 없다 — 삭제는 건너뛰고 생성만 한다")
        target_sq = None
    else:
        target_sq = tgt[0]
        print(f'  삭제 대상   : {TARGET_USER_ID} (user_sq={target_sq}, type={tgt[1]}, '
              f'{tgt[2]}/{tgt[3]})')

        print('  참조 검사   :')
        for tbl, col in REF:
            if not table_exists(cur, tbl, col):
                print(f'    {tbl:30s} {col:12s} (테이블/컬럼 없음 — 건너뜀)')
                continue
            cur.execute(f'SELECT COUNT(*) FROM {tbl} WHERE {col} = %s', (target_sq,))
            n = cur.fetchone()[0]
            print(f'    {tbl:30s} {col:12s} {n:>6}')
            if n:
                problems.append(f'{tbl}.{col} 이 user_sq={target_sq} 를 {n}건 참조한다 — 삭제 불가')

    # 아이디 말고 나머지 유일값이 다른 계정과 겹치는지
    for col, val in (('user_nickname', ACCOUNT['user_nickname']),
                     ('user_email', ACCOUNT['user_email']),
                     ('user_phone_num', ACCOUNT['user_phone_num'])):
        cur.execute(f'SELECT COUNT(*) FROM TBL_USER_M WHERE {col} = %s AND user_id <> %s',
                    (val, TARGET_USER_ID))
        if cur.fetchone()[0]:
            problems.append(f'{col}={val} 이 다른 계정과 겹친다')

    return problems


def verify(cur):
    """생성 결과를 그 자리에서 확인한다. 드라이런에서도 여기까지 돈다."""
    cur.execute("""
        SELECT u.user_sq, u.user_id, u.user_nm, u.user_nickname, u.user_type_cd,
               c.company_sq, c.company_nm, c.company_auth_status_cd, c.company_agreed_terms_yn
          FROM TBL_USER_M u
          LEFT JOIN TBL_COMPANY_S c ON c.user_sq = u.user_sq
         WHERE u.user_id = %s
    """, (TARGET_USER_ID,))
    row = cur.fetchone()
    print()
    print('  ── 생성 결과')
    if not row:
        print('     🔴 계정이 없다')
        return False
    cols = ['user_sq', 'user_id', 'user_nm', 'user_nickname', 'user_type_cd',
            'company_sq', 'company_nm', 'company_auth_status_cd', 'company_agreed_terms_yn']
    for c, v in zip(cols, row):
        print(f'     {c:26s} = {v}')

    ok = True
    if row[4] != 302:
        print('     🔴 user_type_cd 가 302 가 아니다'); ok = False
    if row[5] is None:
        print('     🔴 TBL_COMPANY_S 행이 없다 — 기업 계정으로 동작하지 않는다'); ok = False
    if row[7] != 2502:
        print('     🔴 company_auth_status_cd 가 2502 가 아니다 — FO 가 공고 등록을 막는다'); ok = False

    cur.execute("SELECT COUNT(*) FROM TBL_USER_M WHERE user_type_cd = 303")
    print(f'     남은 관리자(303) 계정 수      = {cur.fetchone()[0]}  (admin 하나면 정상)')
    return ok


def do_rollback(conn, cur):
    """기업 계정을 지우고 estsw_admin 을 관리자(303)로 되돌린다."""
    print('  기업 계정 삭제 → 관리자 계정으로 복원')
    cur.execute('SELECT user_sq FROM TBL_USER_M WHERE user_id = %s', (TARGET_USER_ID,))
    row = cur.fetchone()
    if row:
        cur.execute('DELETE FROM TBL_COMPANY_S WHERE user_sq = %s', (row[0],))
        print(f'    TBL_COMPANY_S  삭제 {cur.rowcount}행')
        cur.execute('DELETE FROM TBL_USER_M WHERE user_sq = %s', (row[0],))
        print(f'    TBL_USER_M     삭제 {cur.rowcount}행')

    admin = dict(ACCOUNT)
    admin['user_type_cd'] = 303
    cur.execute(INSERT_USER_SQL, (
        admin['user_id'], admin['user_email'], hash_pw(admin['user_pw']),
        admin['user_nm'], admin['user_nickname'], admin['user_phone_num'],
        admin['user_type_cd'], TEMPLATE_USER_ID,
    ))
    print(f'    TBL_USER_M     관리자(303)로 재생성 user_sq={cur.lastrowid}')


def main():
    apply = '--apply' in sys.argv
    rollback = '--rollback' in sys.argv

    print('=' * 72)
    print('estsw_admin → 기업(302) 계정 재생성' if not rollback else 'estsw_admin 관리자 복원(롤백)')
    print(f'대상 DB: {DB["host"]}/{DB["database"]}')
    print(f'모드   : {"🔴 실제 반영(--apply)" if apply else "드라이런 — 끝에 ROLLBACK 한다"}')
    print('=' * 72)

    conn = pymysql.connect(**DB)
    cur = conn.cursor()
    try:
        if rollback:
            do_rollback(conn, cur)
        else:
            print()
            print('── 사전 검사')
            problems = precheck(cur)
            if problems:
                print()
                for p in problems:
                    print(f'  🔴 {p}')
                print()
                print('중단한다. 아무것도 쓰지 않았다.')
                conn.rollback()
                return 1

            print()
            print('── 실행')
            cur.execute('DELETE FROM TBL_USER_M WHERE user_id = %s', (TARGET_USER_ID,))
            print(f'  TBL_USER_M     삭제 {cur.rowcount}행 ({TARGET_USER_ID})')

            cur.execute(INSERT_USER_SQL, (
                ACCOUNT['user_id'], ACCOUNT['user_email'], hash_pw(ACCOUNT['user_pw']),
                ACCOUNT['user_nm'], ACCOUNT['user_nickname'], ACCOUNT['user_phone_num'],
                ACCOUNT['user_type_cd'], TEMPLATE_USER_ID,
            ))
            new_sq = cur.lastrowid
            print(f'  TBL_USER_M     생성 user_sq={new_sq} (user_type_cd=302 기업)')

            cur.execute(INSERT_COMPANY_SQL, (
                new_sq, COMPANY['company_nm'],
                COMPANY['company_auth_status_cd'], COMPANY['company_agreed_terms_yn'],
            ))
            print(f'  TBL_COMPANY_S  생성 company_sq={cur.lastrowid} '
                  f'({COMPANY["company_nm"]}, 인증상태 {COMPANY["company_auth_status_cd"]})')

            if not verify(cur):
                print()
                print('🔴 검증 실패 — 롤백한다.')
                conn.rollback()
                return 1

        print()
        if apply:
            conn.commit()
            print('✅ 커밋했다.')
        else:
            conn.rollback()
            print('드라이런이라 롤백했다. 실제로 반영하려면 --apply 를 붙일 것.')
        return 0
    except Exception as e:
        conn.rollback()
        print()
        print(f'🔴 실패 — 전량 롤백했다: {e}')
        return 1
    finally:
        conn.close()
        print('=' * 72)


if __name__ == '__main__':
    raise SystemExit(main())
