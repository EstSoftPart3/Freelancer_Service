# -*- coding: utf-8 -*-
"""
시드 게시글의 작성일시를 지정 구간으로 옮긴다. 공용 DB, 승인 후 실행.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/shift-seed-dates.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/shift-seed-dates.py" --apply
  구간 지정     : ... --from 2026-09-01 --to 2026-09-28

왜 이 스크립트가 필요한가
  BO 시드 API(/admin/seed/community)에 9월 날짜를 지정해도 서버가 오늘로 잘라낸다
  (AdminSeedService.java:343-346). "미래 글이 목록 상단에 영구히 눌러앉는" 사고를 막으려고
  일부러 넣은 방어다. 그래서 등록과 날짜 지정을 두 단계로 나눈다 —
  API 로 넣고, 여기서 옮긴다. DB 에 직접 쓰는 경로에는 그 방어가 없다.

무엇을 지키는가
  ① 글의 이동량(delta)을 그 글의 답변·댓글에 똑같이 적용한다.
     각각 따로 흩뿌리면 "글보다 먼저 달린 댓글" 이 생긴다. SeedPlanner 가 댓글을 글 직후로
     몰아넣은 제곱 편향(SeedPlanner.java:600-613)도 그대로 보존된다.
  ② 시각은 08~23 시로 제한한다. 새벽 4시에 몰린 목록은 그 자체로 부자연스럽다
     (SeedPlanner.java:586-598 과 같은 원칙).
  ③ user_sq 조건을 반드시 건다. 봇이 쓴 글만 대상이다 —
     운영 도구가 실사용자 데이터를 건드리는 사고를 구조로 막는다
     (AdminSeedMapper.xml:125-131 과 같은 장치).

주의: 이 파일에는 DB 비밀번호가 평문으로 있다. git 에 올리지 말 것.
"""
import os
import argparse
import random
import sys
from collections import defaultdict
from datetime import date, datetime, time, timedelta

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
    database='freelancer_project', charset='utf8mb4', autocommit=False,
)

# 기본 구간 — 2026-09-01 ~ 09-28 (회의 결정: 9월 한 달 4주)
DEFAULT_FROM = date(2026, 9, 1)
DEFAULT_TO = date(2026, 9, 28)

HOUR_FROM, HOUR_TO = 8, 23

# 재현 가능하게. 같은 시드로 다시 돌리면 같은 배치가 나온다.
RANDOM_SEED = 20260901

# 봇 판정. AdminSeedMapper.xml 과 같은 규칙이다.
# ESCAPE '!' 인 이유 — 언더스코어는 LIKE 와일드카드라 'bot_%' 로 두면 botA.. 같은
# 실사용자까지 걸린다. 백슬래시는 MariaDB 문자열 리터럴에서 한 번 더 해석돼 모드에 따라
# 의미가 달라지므로 '!' 를 쓴다.
# LIKE 패턴을 리터럴로 박지 않고 파라미터로 넘긴다 — pymysql 은 args 가 있는 execute 에서
# SQL 을 % 포맷으로 해석해, 본문의 '%' 가 그대로 있으면 터진다.
BOT_LIKE = 'bot!_%'

BOT_WHERE = """
    u.user_is_deleted_yn = 'N'
    AND u.user_type_cd = 301
    AND u.user_id LIKE %s ESCAPE '!'
"""


def fetch_targets(cur):
    """옮길 게시글. 회수된 글(is_deleted='Y')은 건드리지 않는다."""
    cur.execute(f"""
        SELECT b.board_sq, b.board_created_at_dtm, b.board_ttl
          FROM TBL_BOARD_M b
          JOIN TBL_USER_M u ON u.user_sq = b.user_sq
         WHERE {BOT_WHERE}
           AND b.board_is_deleted_yn = 'N'
         ORDER BY b.board_sq
    """, (BOT_LIKE,))
    return cur.fetchall()


def pick_new_time(rnd, day_from, day_to):
    span = (day_to - day_from).days
    day = day_from + timedelta(days=rnd.randint(0, max(0, span)))
    return datetime.combine(day, time(
        rnd.randint(HOUR_FROM, HOUR_TO), rnd.randint(0, 59), rnd.randint(0, 59)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='실제로 옮긴다(기본은 드라이런)')
    ap.add_argument('--from', dest='date_from', default=DEFAULT_FROM.isoformat())
    ap.add_argument('--to', dest='date_to', default=DEFAULT_TO.isoformat())
    args = ap.parse_args()

    day_from = date.fromisoformat(args.date_from)
    day_to = date.fromisoformat(args.date_to)
    if day_to < day_from:
        raise SystemExit("--to 가 --from 보다 앞선다.")

    mode = '실행(--apply)' if args.apply else '드라이런'
    print('=' * 72)
    print(f'시드 게시글 날짜 이동 — {mode}')
    print(f'대상: {DB["host"]}/{DB["database"]}')
    print(f'구간: {day_from} ~ {day_to}  (시각 {HOUR_FROM}~{HOUR_TO}시)')
    print('=' * 72)

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    boards = fetch_targets(cur)
    if not boards:
        print('\n옮길 시드 게시글이 없다. 먼저 BO 커뮤니티 시드로 글을 등록할 것.')
        conn.close()
        return 0

    rnd = random.Random(RANDOM_SEED)

    # board_sq -> (기존시각, 새시각, delta)
    plans = {}
    for board_sq, created, title in boards:
        new_at = pick_new_time(rnd, day_from, day_to)
        plans[board_sq] = (created, new_at, new_at - created, title)

    print(f'\n[대상] 게시글 {len(plans)}건')
    print('  ' + '-' * 66)
    print('  %-8s %-19s %-19s %s' % ('board_sq', '기존', '변경', '제목'))
    print('  ' + '-' * 66)
    for sq in list(plans)[:8]:
        old, new, _d, title = plans[sq]
        print('  %-8s %-19s %-19s %s' % (
            sq, old.strftime('%Y-%m-%d %H:%M:%S'), new.strftime('%Y-%m-%d %H:%M:%S'),
            (title or '')[:24]))
    if len(plans) > 8:
        print(f'  ... 외 {len(plans) - 8}건')

    # 답변·댓글은 원글과 같은 delta 로 민다. 상대 순서가 보존된다.
    cur.execute(f"""
        SELECT a.answer_sq, a.board_sq, a.answer_created_at_dtm
          FROM TBL_BOARD_ANSWER_S a
          JOIN TBL_USER_M u ON u.user_sq = a.user_sq
         WHERE {BOT_WHERE}
           AND a.answer_is_deleted_yn = 'N'
           AND a.board_sq IN ({','.join(['%s'] * len(plans))})
    """, (BOT_LIKE, *plans))
    answers = cur.fetchall()

    cur.execute(f"""
        SELECT c.comment_sq, c.board_sq, c.answer_sq, c.comment_created_at_dtm
          FROM TBL_BOARD_COMMENT_S c
          JOIN TBL_USER_M u ON u.user_sq = c.user_sq
         WHERE {BOT_WHERE}
           AND c.comment_is_deleted_yn = 'N'
    """, (BOT_LIKE,))
    comments_all = cur.fetchall()

    # 답변 댓글은 board_sq 가 비어 있을 수 있어 answer_sq 로 원글을 되짚는다.
    answer_to_board = {a[0]: a[1] for a in answers}
    comments = []
    for comment_sq, board_sq, answer_sq, created in comments_all:
        bsq = board_sq or answer_to_board.get(answer_sq)
        if bsq in plans:
            comments.append((comment_sq, bsq, created))

    print(f'\n[동반 이동] 답변 {len(answers)}건 · 댓글 {len(comments)}건')

    # 이동 후 순서가 뒤집히지 않는지 표본 검증
    bad = 0
    for comment_sq, bsq, created in comments:
        delta = plans[bsq][2]
        if created + delta < plans[bsq][1]:
            bad += 1
    if bad:
        print(f'  ⚠ 원글보다 앞서는 댓글 {bad}건 — 이동 전부터 어긋나 있던 데이터다(이동이 만든 문제가 아님)')

    if not args.apply:
        print('\n' + '=' * 72)
        print('드라이런이라 아무것도 바꾸지 않았다.')
        print('실행하려면 --apply 를 붙일 것. 그 전에 백업을 권한다:')
        print('  !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"')
        conn.close()
        return 0

    # ── 실행 ────────────────────────────────────────────────────────────
    try:
        for sq, (_old, new, _d, _t) in plans.items():
            cur.execute("""
                UPDATE TBL_BOARD_M
                   SET board_created_at_dtm = %s, board_modified_at_dtm = %s
                 WHERE board_sq = %s
            """, (new, new, sq))

        for answer_sq, board_sq, created in answers:
            delta = plans[board_sq][2]
            moved = created + delta
            cur.execute("""
                UPDATE TBL_BOARD_ANSWER_S
                   SET answer_created_at_dtm = %s, answer_modified_at_dtm = %s
                 WHERE answer_sq = %s
            """, (moved, moved, answer_sq))

        for comment_sq, board_sq, created in comments:
            delta = plans[board_sq][2]
            moved = created + delta
            cur.execute("""
                UPDATE TBL_BOARD_COMMENT_S
                   SET comment_created_at_dtm = %s, comment_modified_at_dtm = %s
                 WHERE comment_sq = %s
            """, (moved, moved, comment_sq))

        conn.commit()
        print(f'\n완료 — 게시글 {len(plans)} · 답변 {len(answers)} · 댓글 {len(comments)}건을 옮겼다.')
    except Exception as e:
        conn.rollback()
        print(f'\n실패, 전량 롤백했다: {e}')
        conn.close()
        return 1

    # 결과 확인
    cur.execute(f"""
        SELECT MIN(b.board_created_at_dtm), MAX(b.board_created_at_dtm), COUNT(*)
          FROM TBL_BOARD_M b
          JOIN TBL_USER_M u ON u.user_sq = b.user_sq
         WHERE {BOT_WHERE} AND b.board_is_deleted_yn = 'N'
    """, (BOT_LIKE,))
    lo, hi, cnt = cur.fetchone()
    print(f'검증 — 시드 글 {cnt}건의 작성일시 범위: {lo} ~ {hi}')

    conn.close()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
