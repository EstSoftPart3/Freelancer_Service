# -*- coding: utf-8 -*-
"""
Phase 8 — BO 커뮤니티 시드 기능 사전 점검 (조회 전용, 아무것도 쓰지 않는다)

  실행: !python "C:/dev/Freelancer_Service/docs/phase8-seed-precheck.py"

무엇을 왜 보는가
  1) charset  — AI 가 만든 한국어 커뮤니티 글에는 이모지가 흔하다. 대상 컬럼이
                utf8mb4 가 아니면 4바이트 문자에서 INSERT 가 통째로 실패한다.
  2) 컬럼 제약 — 시드는 기존 서비스를 안 쓰고 전용 INSERT 를 새로 만든다.
                NOT NULL 인데 DEFAULT 가 없는 컬럼을 빠뜨리면 런타임에 터진다.
                특히 *_created_at_dtm 이 DEFAULT CURRENT_TIMESTAMP 인지 확인해야
                "과거로 분산" 이 가능한지 판정된다.
  3) 봇 계정   — user_id LIKE 'bot\\_%' ESCAPE '\\' 로 뽑는다.
                언더스코어는 LIKE 와일드카드라 이스케이프 없이 쓰면 botX.. 도 걸린다.
  4) autoinc   — innodb_autoinc_lock_mode 가 interleaved(2) 면 다중 VALUES INSERT 의
                생성키 구간이 어긋날 수 있다. 그래서 게시글·답변은 건당 INSERT 로 간다.
                (여기서는 그 판단이 맞는지 확인만 한다)
  5) 현황      — 기존 게시글/답변/댓글 건수. 시드 후 증분을 대조할 기준선이다.

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

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_project', charset='utf8mb4', autocommit=True,
)

# 시드가 직접 INSERT 할 테이블
SEED_TABLES = ['TBL_BOARD_M', 'TBL_BOARD_ANSWER_S', 'TBL_BOARD_COMMENT_S']

# 이모지가 실제로 들어갈 수 있는 컬럼 — 여기가 utf8mb4 가 아니면 착수 불가
TEXT_COLUMNS = {
    'TBL_BOARD_M': ['board_ttl', 'board_description_edt'],
    'TBL_BOARD_ANSWER_S': ['answer_ttl', 'answer_description_edt'],
    'TBL_BOARD_COMMENT_S': ['comment_description_txt'],
}

SEP = "-" * 100


def section(title):
    print("\n" + "=" * 100)
    print(f"  {title}")
    print("=" * 100)


def check_charset(cur):
    section("1) charset — 이모지(4바이트) 저장 가능 여부")

    cur.execute("""
        SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
          FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s
    """, (DB['database'],))
    row = cur.fetchone()
    print(f"  스키마 기본값: {row[0]} / {row[1]}")

    problems = []
    print(f"\n  %-24s %-26s %-12s %s" % ('테이블', '컬럼', 'charset', '판정'))
    print("  " + SEP)
    for table, cols in TEXT_COLUMNS.items():
        placeholders = ','.join(['%s'] * len(cols))
        cur.execute(f"""
            SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
              FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME IN ({placeholders})
             ORDER BY ORDINAL_POSITION
        """, [DB['database'], table] + cols)
        found = cur.fetchall()
        for name, charset, collation in found:
            ok = (charset or '').startswith('utf8mb4')
            verdict = 'OK' if ok else '★ 이모지 불가 — 착수 전 조치 필요'
            if not ok:
                problems.append(f"{table}.{name} charset={charset}")
            print(f"  %-24s %-26s %-12s %s" % (table, name, charset, verdict))
        missing = set(cols) - {f[0] for f in found}
        for m in missing:
            problems.append(f"{table}.{m} 컬럼 없음")
            print(f"  %-24s %-26s %-12s %s" % (table, m, '-', '★ 컬럼이 존재하지 않는다'))
    return problems


def check_columns(cur):
    section("2) 컬럼 제약 — 전용 INSERT 가 채워야 할 것들")
    print("  NOT NULL 인데 DEFAULT 가 없는 컬럼 = 시드 INSERT 가 반드시 값을 줘야 하는 컬럼\n")

    must_fill = {}
    for table in SEED_TABLES:
        cur.execute("""
            SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
              FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
             ORDER BY ORDINAL_POSITION
        """, (DB['database'], table))
        rows = cur.fetchall()
        if not rows:
            print(f"  [{table}] ★ 테이블이 없다")
            continue

        print(f"  [{table}]")
        print("  %-30s %-22s %-8s %-24s %s" % ('컬럼', '타입', 'NULL', 'DEFAULT', 'EXTRA'))
        print("  " + SEP)
        required = []
        for name, ctype, nullable, default, extra in rows:
            auto = 'auto_increment' in (extra or '')
            if nullable == 'NO' and default is None and not auto:
                required.append(name)
            print("  %-30s %-22s %-8s %-24s %s" % (
                name, ctype[:22], nullable, str(default)[:24], extra or ''))
        must_fill[table] = required
        print(f"  → 시드가 반드시 값을 줘야 하는 컬럼: "
              f"{', '.join(required) if required else '(없음)'}\n")

    section("2-b) *_created_at_dtm — 과거로 분산이 가능한가")
    for table, col in (('TBL_BOARD_M', 'board_created_at_dtm'),
                       ('TBL_BOARD_ANSWER_S', 'answer_created_at_dtm'),
                       ('TBL_BOARD_COMMENT_S', 'comment_created_at_dtm')):
        cur.execute("""
            SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
              FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s
        """, (DB['database'], table, col))
        r = cur.fetchone()
        if not r:
            print(f"  {table}.{col} ★ 없음")
            continue
        ctype, nullable, default, extra = r
        # ON UPDATE CURRENT_TIMESTAMP 가 붙어 있으면 나중 UPDATE 에 작성일이 딸려 움직인다
        warn = ' ★ ON UPDATE 있음 — 수정 시 작성일이 바뀐다' if 'on update' in (extra or '').lower() else ''
        print(f"  {table}.{col}: {ctype} NULL={nullable} DEFAULT={default} EXTRA={extra or '-'}{warn}")
    print("\n  판정 기준: 명시적으로 값을 넣을 수 있으면(생성컬럼이 아니면) 과거 분산 가능하다.")
    return must_fill


def check_bots(cur):
    section("3) 봇 계정 풀")
    cur.execute(r"""
        SELECT user_sq, user_id, user_nickname, user_type_cd, user_is_deleted_yn, user_is_activate_yn
          FROM TBL_USER_M
         WHERE user_id LIKE 'bot\_%' ESCAPE '\\'
         ORDER BY user_sq
    """)
    rows = cur.fetchall()
    if not rows:
        print("  ★ 봇 계정이 없다. docs/phase7-accounts.py --apply 를 먼저 실행할 것")
        return []

    print("  %-10s %-12s %-14s %-10s %-10s %s" % (
        'user_sq', 'user_id', '닉네임', 'type_cd', '삭제', '활성'))
    print("  " + SEP)
    for sq, uid, nick, type_cd, deleted, active in rows:
        print("  %-10s %-12s %-14s %-10s %-10s %s" % (sq, uid, nick, type_cd, deleted, active))

    sqs = [r[0] for r in rows]
    non_301 = [r[1] for r in rows if r[3] != 301]
    print(f"\n  총 {len(rows)}개, user_sq {min(sqs)} ~ {max(sqs)}")
    if non_301:
        print(f"  ★ user_type_cd 가 301(개인) 이 아닌 계정: {', '.join(non_301)} — 작성자 풀에서 제외할 것")
    if len(rows) < 20:
        print(f"  ★ 계정이 {len(rows)}개뿐이다. 200건 + 댓글 수백 건이면 닉네임 하나가"
              f" {200 // max(len(rows), 1)}회 이상 반복된다 — Step 6 에서 25개로 증설 권장")
    return sqs


def check_autoinc(cur):
    section("4) autoinc / 배치 관련 서버 변수")
    for var in ('innodb_autoinc_lock_mode', 'max_allowed_packet', 'version', 'time_zone',
                'wait_timeout', 'transaction_isolation'):
        cur.execute("SHOW VARIABLES LIKE %s", (var,))
        r = cur.fetchone()
        if r:
            print(f"  {r[0]:<28} = {r[1]}")
    print("\n  innodb_autoinc_lock_mode: 0=traditional 1=consecutive 2=interleaved")
    print("  2 이면 다중 VALUES INSERT 의 생성키 구간이 어긋날 수 있다.")
    print("  → 게시글·답변은 건당 INSERT, 댓글만 배치 (계획서 결정과 일치하는지 확인)")


def check_baseline(cur):
    section("5) 현황 기준선 — 시드 후 증분을 대조할 값")

    cur.execute("""
        SELECT board_type_cd, COUNT(*) FROM TBL_BOARD_M
         WHERE board_is_deleted_yn = 'N' GROUP BY board_type_cd ORDER BY board_type_cd
    """)
    print("  게시글(미삭제) — 1401 일반 / 1402 Q&A / 1403 공지 / 1404 VOC")
    for type_cd, cnt in cur.fetchall():
        print(f"    board_type_cd={type_cd}: {cnt}건")

    cur.execute("""
        SELECT b.board_category_cd, c.common_code_nm, COUNT(*)
          FROM TBL_BOARD_M b
          LEFT JOIN TBL_COMMON_CODE_C c ON c.common_code_sq = b.board_category_cd
         WHERE b.board_is_deleted_yn = 'N' AND b.board_type_cd = 1401
         GROUP BY b.board_category_cd, c.common_code_nm ORDER BY b.board_category_cd
    """)
    print("\n  일반게시판 카테고리 분포")
    for cd, nm, cnt in cur.fetchall():
        print(f"    {cd} {nm or '(미분류)'}: {cnt}건")

    cur.execute("""
        SELECT common_code_sq, common_code_nm, common_code_is_active_yn
          FROM TBL_COMMON_CODE_C
         WHERE parent_common_code_sq = 3200 ORDER BY common_code_sq
    """)
    print("\n  카테고리 공통코드(부모 3200) — 활성만 시드에 쓸 수 있다")
    for cd, nm, active in cur.fetchall():
        mark = '' if active == 'Y' else '   ← 비활성'
        print(f"    {cd} {nm} (활성={active}){mark}")

    cur.execute("""
        SELECT common_code_sq, common_code_nm, common_code_is_active_yn
          FROM TBL_COMMON_CODE_C
         WHERE parent_common_code_sq = 1500 ORDER BY common_code_sq
    """)
    print("\n  Q&A 채택상태 공통코드(부모 1500)")
    for cd, nm, active in cur.fetchall():
        print(f"    {cd} {nm} (활성={active})")

    cur.execute("SELECT COUNT(*) FROM TBL_BOARD_ANSWER_S WHERE answer_is_deleted_yn = 'N'")
    print(f"\n  답변(미삭제): {cur.fetchone()[0]}건")
    cur.execute("SELECT COUNT(*) FROM TBL_BOARD_COMMENT_S WHERE comment_is_deleted_yn = 'N'")
    print(f"  댓글(미삭제): {cur.fetchone()[0]}건")

    # 채택상태 이중 관리가 이미 어긋나 있는지 — 시드 버그와 기존 데이터를 구분하려면
    # 착수 전에 기준선을 알아야 한다.
    cur.execute("""
        SELECT b.board_sq, b.board_adopt_status_cd, COUNT(a.answer_sq)
          FROM TBL_BOARD_M b
          LEFT JOIN TBL_BOARD_ANSWER_S a
                 ON a.board_sq = b.board_sq AND a.answer_is_adopted_yn = 'Y'
                AND a.answer_is_deleted_yn = 'N'
         WHERE b.board_type_cd = 1402 AND b.board_is_deleted_yn = 'N'
         GROUP BY b.board_sq, b.board_adopt_status_cd
        HAVING (b.board_adopt_status_cd = 1502 AND COUNT(a.answer_sq) <> 1)
            OR (b.board_adopt_status_cd <> 1502 AND COUNT(a.answer_sq) > 0)
    """)
    bad = cur.fetchall()
    print(f"\n  채택상태 불일치(기존 데이터): {len(bad)}건"
          + (" — 시드 검증 시 이 건들은 제외하고 볼 것" if bad else ""))
    for sq, status, cnt in bad[:10]:
        print(f"    board_sq={sq} status={status} 채택답변={cnt}")


def main():
    print("=== Phase 8 시드 사전 점검 (조회 전용) ===")
    print(f"DB: {DB['host']}/{DB['database']}")

    conn = pymysql.connect(**DB)
    try:
        with conn.cursor() as cur:
            charset_problems = check_charset(cur)
            check_columns(cur)
            bot_sqs = check_bots(cur)
            check_autoinc(cur)
            check_baseline(cur)

        section("결론")
        if charset_problems:
            print("  ★ 착수 불가 — charset 문제부터 해결할 것:")
            for p in charset_problems:
                print(f"    - {p}")
            print("\n  조치 예시(승인 필요):")
            print("    ALTER TABLE <표> MODIFY <컬럼> <타입> "
                  "CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;")
            print("  또는 시드 단계에서 이모지를 제거하는 정책으로 우회한다.")
        else:
            print("  charset OK — 이모지 포함 시드 가능")

        if bot_sqs:
            print(f"  봇 user_sq: {bot_sqs}")
        print("\n  이 스크립트는 아무것도 쓰지 않았다.")
    finally:
        conn.close()


if __name__ == '__main__':
    main()
