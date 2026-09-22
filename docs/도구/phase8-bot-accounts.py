# -*- coding: utf-8 -*-
"""
Phase 8 — 봇 계정 정비 (닉네임 교체 + 증설). 공용 DB, 승인 후 실행.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/phase8-bot-accounts.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/phase8-bot-accounts.py" --apply
  롤백          : !python "C:/dev/Freelancer_Service/docs/도구/phase8-bot-accounts.py" --rollback

무엇을 하는가
  ① bot_01~05 의 닉네임을 바꾼다 (UPDATE)
  ② bot_06~25 를 새로 만든다 (INSERT)

왜 닉네임을 바꾸는가
  이 플랫폼은 "IT 프리랜서와 기업을 연결하는 프로젝트 매칭 플랫폼" 이다(FO 메타 문구).
  그런데 Phase 7 에서 만든 봇 닉네임이 현장지기·공정관리·안전제일·도면쟁이·현장기록으로
  건설업 색이 강했다. 개발자 커뮤니티에 이런 이름이 줄줄이 보이면 어색하다.

  ※ 되돌릴 때를 위해 원래 값을 남겨둔다:
     bot_01 현장지기 / bot_02 공정관리 / bot_03 안전제일 / bot_04 도면쟁이 / bot_05 현장기록

왜 늘리는가
  봇 5개로 게시글 200건 + 댓글 수백 건을 만들면 닉네임 하나가 40회 이상 반복된다.
  FO 는 닉네임만 노출하므로 그 자체로 더미데이터 티가 난다. 25개면 1/5로 떨어진다.

닉네임 규칙
  숫자를 붙이지 않는다. "봇01" 같은 이름은 정체가 그대로 드러난다.
  식별은 user_id(bot_*) 와 user_nm(봇계정NN) 으로 하고, 이 둘은 BO 에서만 보인다.

주의: 이 파일에는 DB 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import os
import sys

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
# phase7-accounts.py 와 같은 방식이다 — 스키마를 몰라도 NOT NULL 컬럼이 빠지지 않는다.
TEMPLATE_USER_ID = 'admin'

BOT_PASSWORD = os.environ['FREELANCER_BOT_PW']
BOT_TYPE_CD = 301  # 개인회원. 시더가 작성자 풀을 뽑을 때 301 만 대상으로 한다.

# bot_01 ~ bot_25.
# IT 프리랜서(SI/SM) 커뮤니티에 있을 법한 handle 로 둔다. 기술 용어를 나열하기보다
# 개발자의 일상·계약 생활이 드러나는 쪽이 사람 같다.
BOT_NICKNAMES = {
    'bot_01': '커밋로그',
    'bot_02': '야근의달인',
    'bot_03': '주석쟁이',
    'bot_04': '리팩터링중',
    'bot_05': '배포전야',
    'bot_06': '무한루프',
    'bot_07': '세미콜론',
    'bot_08': '커피두잔',
    'bot_09': '빌드성공',
    'bot_10': '마감요정',
    'bot_11': '상주생활',
    'bot_12': '단가협상',
    'bot_13': '계약연장',
    'bot_14': '새벽배포',
    'bot_15': '롤백장인',
    'bot_16': '스프린트',
    'bot_17': '레거시탐험',
    'bot_18': '삽질기록',
    'bot_19': '콘솔로그',
    'bot_20': '파견일지',
    'bot_21': '코드리뷰어',
    'bot_22': '테스트통과',
    'bot_23': '유지보수왕',
    'bot_24': '사수없음',
    'bot_25': '퇴근각',
}

# 이 스크립트가 새로 만드는 범위. 롤백은 이 범위만 지운다(기존 bot_01~05 는 건드리지 않는다).
NEW_FROM = 6

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
    rows = []
    for user_id, nickname in BOT_NICKNAMES.items():
        n = int(user_id.split('_')[1])
        rows.append(dict(
            user_id=user_id,
            n=n,
            user_pw=BOT_PASSWORD,
            user_nm=f'봇계정{n:02d}',
            user_nickname=nickname,
            user_email=f'bot{n:02d}@estsw.local',
            # phase7 이 01000009001~005 를 썼다. 같은 규칙을 이어 쓴다.
            user_phone_num=f'010000090{n:02d}',
            user_type_cd=BOT_TYPE_CD,
        ))
    return rows


def nickname_limit(cur):
    """user_nickname 컬럼의 최대 길이. 코드 어디에도 검증이 없어 DB 에 직접 묻는다."""
    cur.execute("""
        SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'TBL_USER_M' AND COLUMN_NAME = 'user_nickname'
    """, (DB['database'],))
    row = cur.fetchone()
    return row[0] if row and row[0] else None


def plan(cur, rows):
    """무엇을 INSERT 하고 무엇을 UPDATE 할지 가른다. 문제가 있으면 함께 돌려준다."""
    problems = []
    to_insert, to_update, unchanged = [], [], []

    cur.execute("SELECT user_sq, address_sq FROM TBL_USER_M WHERE user_id = %s", (TEMPLATE_USER_ID,))
    tpl = cur.fetchone()
    if not tpl:
        problems.append(f"템플릿 계정 '{TEMPLATE_USER_ID}' 이(가) 없다. TEMPLATE_USER_ID 를 고칠 것")
        return to_insert, to_update, unchanged, problems
    print(f"  템플릿: user_id={TEMPLATE_USER_ID} user_sq={tpl[0]} address_sq={tpl[1]}")

    limit = nickname_limit(cur)
    if limit:
        print(f"  user_nickname 최대 길이: {limit}자")
        for r in rows:
            if len(r['user_nickname']) > limit:
                problems.append(
                    f"닉네임이 {len(r['user_nickname'])}자다(최대 {limit}): "
                    f"{r['user_id']} {r['user_nickname']}")

    for r in rows:
        cur.execute("SELECT user_sq, user_nickname FROM TBL_USER_M WHERE user_id = %s", (r['user_id'],))
        found = cur.fetchone()

        # 닉네임은 UNIQUE 다. "다른 계정" 이 그 닉네임을 쓰고 있으면 충돌이다.
        cur.execute("SELECT user_id FROM TBL_USER_M WHERE user_nickname = %s AND user_id <> %s",
                    (r['user_nickname'], r['user_id']))
        clash = cur.fetchone()
        if clash:
            problems.append(f"닉네임 중복: {r['user_nickname']} (원하는 {r['user_id']} vs 기존 {clash[0]})")

        if found:
            r['user_sq'], r['old_nickname'] = found
            (to_update if found[1] != r['user_nickname'] else unchanged).append(r)
            continue

        # 신규는 이메일·전화까지 겹치면 INSERT 가 터진다. 미리 잡는다.
        for col, val in (('user_email', r['user_email']), ('user_phone_num', r['user_phone_num'])):
            cur.execute(f"SELECT user_id FROM TBL_USER_M WHERE {col} = %s", (val,))
            other = cur.fetchone()
            if other:
                problems.append(f"{col} 중복: {val} (만들려는 {r['user_id']} vs 기존 {other[0]})")
        to_insert.append(r)

    return to_insert, to_update, unchanged, problems


def show(to_insert, to_update, unchanged):
    if to_update:
        print("\n닉네임 변경 (기존 계정)")
        print("  " + "-" * 56)
        print("  %-10s %-14s %s" % ('user_id', '기존', '변경'))
        print("  " + "-" * 56)
        for r in to_update:
            print("  %-10s %-14s → %s" % (r['user_id'], r['old_nickname'], r['user_nickname']))

    if to_insert:
        print("\n신규 생성")
        print("  " + "-" * 56)
        print("  %-10s %-14s %s" % ('user_id', '닉네임', '이메일'))
        print("  " + "-" * 56)
        for r in to_insert:
            print("  %-10s %-14s %s" % (r['user_id'], r['user_nickname'], r['user_email']))

    if unchanged:
        print(f"\n변경 없음: {', '.join(r['user_id'] for r in unchanged)}")

    print(f"\n  총 변경 {len(to_update)}건 + 신규 {len(to_insert)}건")


def current_bots(cur):
    cur.execute(r"""
        SELECT user_sq, user_id, user_nickname FROM TBL_USER_M
         WHERE user_id LIKE 'bot!_%' ESCAPE '!' AND user_is_deleted_yn = 'N'
         ORDER BY user_sq
    """)
    return cur.fetchall()


def apply(conn, to_insert, to_update):
    created, renamed = [], []
    with conn.cursor() as cur:
        for r in to_update:
            cur.execute("UPDATE TBL_USER_M SET user_nickname = %s WHERE user_id = %s",
                        (r['user_nickname'], r['user_id']))
            renamed.append((r['user_id'], r['old_nickname'], r['user_nickname']))

        for r in to_insert:
            cur.execute(INSERT_SQL, (
                r['user_id'], r['user_email'], hash_pw(r['user_pw']), r['user_nm'],
                r['user_nickname'], r['user_phone_num'], r['user_type_cd'], TEMPLATE_USER_ID,
            ))
            if cur.rowcount != 1:
                raise RuntimeError(f"INSERT 실패(0행): {r['user_id']}. 템플릿 계정을 확인할 것")
            created.append((r['user_id'], cur.lastrowid, r['user_nickname']))
    conn.commit()
    return created, renamed


def rollback(conn, rows):
    """이 스크립트가 만든 계정(bot_06~)만 지운다. 닉네임 변경은 되돌리지 않는다."""
    ids = [r['user_id'] for r in rows if r['n'] >= NEW_FROM]
    with conn.cursor() as cur:
        placeholders = ','.join(['%s'] * len(ids))
        cur.execute(f"SELECT user_sq, user_id FROM TBL_USER_M WHERE user_id IN ({placeholders})", ids)
        found = cur.fetchall()
        if not found:
            print("삭제할 계정이 없다.")
            return

        # 글이 남아 있는 계정을 지우면 FO 에 "탈퇴한 사용자" 로 남는다. 먼저 알려준다.
        sqs = [f[0] for f in found]
        ph2 = ','.join(['%s'] * len(sqs))
        cur.execute(f"SELECT COUNT(*) FROM TBL_BOARD_M WHERE user_sq IN ({ph2})", sqs)
        boards = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM TBL_BOARD_COMMENT_S WHERE user_sq IN ({ph2})", sqs)
        comments = cur.fetchone()[0]
        if boards or comments:
            print(f"[중단] 대상 계정이 남긴 글 {boards}건, 댓글 {comments}건이 있다.")
            print("       BO '커뮤니티 시드 > 회수' 로 먼저 글을 내린 뒤 다시 실행할 것.")
            print("       (계정만 지우면 그 글들이 '탈퇴한 사용자' 로 남는다)")
            return

        print("삭제 대상:")
        for sq, uid in found:
            print(f"  user_sq={sq} user_id={uid}")
        cur.execute(f"DELETE FROM TBL_USER_M WHERE user_id IN ({placeholders})", ids)
        n = cur.rowcount
    conn.commit()
    print(f"DELETE 완료: {n}건")
    print("\n※ bot_01~05 의 닉네임 변경은 되돌리지 않았다. 필요하면 수동으로:")
    print("   UPDATE TBL_USER_M SET user_nickname='현장지기' WHERE user_id='bot_01';  -- 등")


def main():
    mode = 'dry-run'
    if '--apply' in sys.argv:
        mode = 'apply'
    elif '--rollback' in sys.argv:
        mode = 'rollback'

    rows = targets()
    print(f"=== Phase 8 봇 계정 정비 [{mode}] ===")
    print(f"DB: {DB['host']}/{DB['database']}")

    conn = pymysql.connect(**DB)
    try:
        if mode == 'rollback':
            rollback(conn, rows)
            return

        with conn.cursor() as cur:
            before = current_bots(cur)
            print(f"\n현재 봇 계정 {len(before)}개: "
                  + ', '.join(f"{b[1]}({b[2]})" for b in before))
            to_insert, to_update, unchanged, problems = plan(cur, rows)

        show(to_insert, to_update, unchanged)

        if problems:
            print("\n[사전 점검] 문제 발견:")
            for p in problems:
                print("  -", p)
            print("\n고친 뒤 다시 실행할 것. (아무것도 쓰지 않았다)")
            return

        if not to_insert and not to_update:
            print("\n이미 원하는 상태다. 할 일이 없다.")
            return

        print("\n[사전 점검] 통과")

        if mode == 'dry-run':
            print("\n실제로 반영하려면 --apply 를 붙여 다시 실행할 것.")
            print('!python "C:/dev/Freelancer_Service/docs/도구/phase8-bot-accounts.py" --apply')
            return

        created, renamed = apply(conn, to_insert, to_update)

        if renamed:
            print(f"\n닉네임 변경 {len(renamed)}건")
            for uid, old, new in renamed:
                print(f"  {uid}  {old} → {new}")
        if created:
            print(f"\n생성 완료 {len(created)}건")
            for uid, sq, nick in created:
                print(f"  user_sq={sq}  {uid}  {nick}")

        with conn.cursor() as cur:
            after = current_bots(cur)
        sqs = [b[0] for b in after]
        print(f"\n  ★ 봇 계정 총 {len(after)}개, user_sq {min(sqs)} ~ {max(sqs)}")
        print("    비밀번호는 전원 동일: " + BOT_PASSWORD)
        print("    시더는 user_id LIKE 'bot_%' AND user_type_cd=301 로 자동으로 찾는다.")
    except Exception as e:
        conn.rollback()
        print('[ROLLBACK]', e)
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
