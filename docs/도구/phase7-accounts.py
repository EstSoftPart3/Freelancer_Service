# -*- coding: utf-8 -*-
"""
Phase 7 — 공식 관리자 계정 + 봇 계정 생성 (공용 DB, 승인 후 실행)

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/phase7-accounts.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/phase7-accounts.py" --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/phase7-accounts.py" --rollback

왜 DB 직접 INSERT 인가
  /api/signup 은 user_type_cd 301(개인)·302(기업)만 받는다. 관리자(303)는 가입 경로가 없다.
  봇은 301 이라 가입 API 로도 만들 수 있지만, 이메일 인증 코드를 실제로 받아야 해서
  계정 수만큼 사람이 붙어야 한다. 그래서 둘 다 여기서 만든다.

안전 장치
  - 기본이 드라이런이다. --apply 를 명시해야 쓴다.
  - 기존 계정 한 건을 템플릿으로 복제한다(address_sq 등 부수 컬럼을 그대로 상속).
    스키마를 몰라도 NOT NULL 컬럼이 빠지지 않는다.
  - 아이디·닉네임·이메일 중복을 미리 검사하고, 하나라도 걸리면 아무것도 쓰지 않는다.
  - 트랜잭션 하나로 묶고 실패 시 전량 롤백한다.
  - 생성된 user_sq 범위를 출력한다 — 나중에 봇 글을 일괄 회수할 때의 근거다.

주의: 이 파일에는 DB 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import os
import sys

# Windows 콘솔 기본 인코딩(cp949)에서는 한글 출력이 깨진다.
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

try:
    import pymysql
except ImportError:
    raise SystemExit("pymysql 미설치. 먼저 실행: pip install pymysql")

try:
    import bcrypt
except ImportError:
    raise SystemExit("bcrypt 미설치. 먼저 실행: pip install bcrypt")

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_project', charset='utf8mb4', autocommit=False,
)

# 부수 컬럼(address_sq, user_gender_cd, user_birth_dt, user_signup_type_cd)을 물려받을 템플릿.
# 지금 쓰는 개발용 관리자 계정이다.
TEMPLATE_USER_ID = 'admin'

# ── 생성 대상 ──────────────────────────────────────────────────────────────
# 비밀번호는 실행 전에 반드시 바꿀 것. 여기 적힌 값 그대로 운영에 두지 말 것.
ADMIN_ACCOUNT = dict(
    user_id='estsw_admin',
    user_pw=os.environ['FREELANCER_CORP_PW'],
    user_nm='운영관리자',
    user_nickname='운영자',
    user_email='freelancer.service.platform@gmail.com',
    # 01000000001 은 기존 계정이 이미 쓰고 있다(드라이런에서 걸렸다). 봇 대역과도 겹치지 않게 둔다.
    user_phone_num='01000009000',
    user_type_cd=303,
)

# 봇 계정. user_id 는 bot_ 접두사로 식별하고, 닉네임은 현장 커뮤니티에 어울리게 둔다.
# (FO 는 닉네임만 노출하고 user_id 는 BO 에서만 보인다 — Phase 2 닉네임 치환 결과)
BOT_PASSWORD = os.environ['FREELANCER_BOT_PW']
BOT_ACCOUNTS = [
    dict(user_id='bot_01', user_nm='봇계정01', user_nickname='현장지기',
         user_email='bot01@estsw.local', user_phone_num='01000009001'),
    dict(user_id='bot_02', user_nm='봇계정02', user_nickname='공정관리',
         user_email='bot02@estsw.local', user_phone_num='01000009002'),
    dict(user_id='bot_03', user_nm='봇계정03', user_nickname='안전제일',
         user_email='bot03@estsw.local', user_phone_num='01000009003'),
    dict(user_id='bot_04', user_nm='봇계정04', user_nickname='도면쟁이',
         user_email='bot04@estsw.local', user_phone_num='01000009004'),
    dict(user_id='bot_05', user_nm='봇계정05', user_nickname='현장기록',
         user_email='bot05@estsw.local', user_phone_num='01000009005'),
]
BOT_TYPE_CD = 301  # 개인회원. 봇도 공개 API 로 글을 쓰므로 일반 개인계정과 같아야 한다.

INSERT_SQL = """
INSERT INTO TBL_USER_M
  (address_sq, user_id, user_email, user_pw, user_nm, user_nickname,
   user_gender_cd, user_phone_num, user_birth_dt, user_type_cd, user_signup_type_cd)
SELECT t.address_sq, %s, %s, %s, %s, %s,
       t.user_gender_cd, %s, t.user_birth_dt, %s, t.user_signup_type_cd
FROM TBL_USER_M t
WHERE t.user_id = %s
LIMIT 1
"""


def hash_pw(raw):
    """Spring Security BCryptPasswordEncoder 는 $2a$ 해시를 검증한다. prefix 고정."""
    return bcrypt.hashpw(raw.encode('utf-8'), bcrypt.gensalt(prefix=b'2a')).decode('utf-8')


def targets():
    rows = [dict(ADMIN_ACCOUNT)]
    for b in BOT_ACCOUNTS:
        row = dict(b)
        row['user_pw'] = BOT_PASSWORD
        row['user_type_cd'] = BOT_TYPE_CD
        rows.append(row)
    return rows


def precheck(cur, rows):
    """무엇 하나라도 걸리면 전부 중단한다 — 일부만 만들어지면 정리가 더 번거롭다."""
    problems = []

    cur.execute("SELECT user_sq, address_sq, user_signup_type_cd FROM TBL_USER_M WHERE user_id = %s",
                (TEMPLATE_USER_ID,))
    tpl = cur.fetchone()
    if not tpl:
        problems.append(f"템플릿 계정 '{TEMPLATE_USER_ID}' 이(가) 없다. TEMPLATE_USER_ID 를 고칠 것")
    else:
        print(f"  템플릿: user_id={TEMPLATE_USER_ID} user_sq={tpl[0]} address_sq={tpl[1]}")

    for r in rows:
        for col, val in (('user_id', r['user_id']),
                         ('user_nickname', r['user_nickname']),
                         ('user_email', r['user_email']),
                         ('user_phone_num', r['user_phone_num'])):
            cur.execute(f"SELECT COUNT(*) FROM TBL_USER_M WHERE {col} = %s", (val,))
            if cur.fetchone()[0] > 0:
                problems.append(f"{col} 중복: {val} (계정 {r['user_id']})")

    return problems


def show(rows):
    print("\n생성 예정 계정")
    print("  " + "-" * 74)
    print("  %-14s %-10s %-8s %-30s" % ('user_id', '닉네임', '유형', '이메일'))
    print("  " + "-" * 74)
    for r in rows:
        kind = '관리자' if r['user_type_cd'] == 303 else '봇(개인)'
        print("  %-14s %-10s %-8s %-30s" % (r['user_id'], r['user_nickname'], kind, r['user_email']))
    print("  " + "-" * 74)
    print(f"  총 {len(rows)}건 (관리자 1 + 봇 {len(rows) - 1})")


def apply(conn, rows):
    created = []
    with conn.cursor() as cur:
        problems = precheck(cur, rows)
        if problems:
            print("\n[중단] 사전 점검에서 문제를 찾았다:")
            for p in problems:
                print("  -", p)
            return None

        for r in rows:
            cur.execute(INSERT_SQL, (
                r['user_id'], r['user_email'], hash_pw(r['user_pw']), r['user_nm'],
                r['user_nickname'], r['user_phone_num'], r['user_type_cd'], TEMPLATE_USER_ID,
            ))
            if cur.rowcount != 1:
                raise RuntimeError(f"INSERT 실패(0행): {r['user_id']}. 템플릿 계정을 확인할 것")
            created.append((r['user_id'], cur.lastrowid, r['user_type_cd']))

    conn.commit()
    return created


def rollback(conn, rows):
    ids = [r['user_id'] for r in rows]
    with conn.cursor() as cur:
        placeholders = ','.join(['%s'] * len(ids))
        # 봇이 남긴 글까지 함께 지우지는 않는다 — 글 회수는 별도 판단이 필요한 작업이라
        # 계정만 지우고 user_sq 를 출력해 근거를 남긴다.
        cur.execute(f"SELECT user_sq, user_id FROM TBL_USER_M WHERE user_id IN ({placeholders})", ids)
        found = cur.fetchall()
        if not found:
            print("삭제할 계정이 없다.")
            return
        print("삭제 대상:")
        for sq, uid in found:
            print(f"  user_sq={sq} user_id={uid}")
        cur.execute(f"DELETE FROM TBL_USER_M WHERE user_id IN ({placeholders})", ids)
        n = cur.rowcount
    conn.commit()
    print(f"DELETE 완료: {n}건")


def main():
    mode = 'dry-run'
    if '--apply' in sys.argv:
        mode = 'apply'
    elif '--rollback' in sys.argv:
        mode = 'rollback'

    rows = targets()
    print(f"=== Phase 7 계정 생성 [{mode}] ===")
    print(f"DB: {DB['host']}/{DB['database']}")

    conn = pymysql.connect(**DB)
    try:
        if mode == 'rollback':
            rollback(conn, rows)
            return

        show(rows)

        with conn.cursor() as cur:
            problems = precheck(cur, rows)

        if problems:
            print("\n[사전 점검] 문제 발견:")
            for p in problems:
                print("  -", p)
            print("\n고친 뒤 다시 실행할 것. (아무것도 쓰지 않았다)")
            return

        print("\n[사전 점검] 통과 — 중복·템플릿 모두 이상 없음")

        if mode == 'dry-run':
            print("\n실제로 만들려면 --apply 를 붙여 다시 실행할 것.")
            print("!python \"C:/dev/Freelancer_Service/docs/도구/phase7-accounts.py\" --apply")
            return

        created = apply(conn, rows)
        if created is None:
            return

        print("\n생성 완료")
        bots = [c for c in created if c[2] == BOT_TYPE_CD]
        for uid, sq, type_cd in created:
            print(f"  user_sq={sq}  user_id={uid}  type={type_cd}")
        if bots:
            sqs = [c[1] for c in bots]
            print(f"\n  ★ 봇 user_sq 범위: {min(sqs)} ~ {max(sqs)}  (총 {len(sqs)}개)")
            print("    봇 글 일괄 회수:")
            print(f"    UPDATE TBL_BOARD_M SET board_is_deleted_yn='Y' "
                  f"WHERE user_sq IN ({','.join(map(str, sqs))});")
    except Exception as e:
        conn.rollback()
        print('[ROLLBACK]', e)
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
