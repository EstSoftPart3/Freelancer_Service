# -*- coding: utf-8 -*-
"""
시드 댓글·답변 날짜를 9월 창 안으로 들이기 (P6-4 보정)

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/fit-seed-reply-dates.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/fit-seed-reply-dates.py" --apply
  구간 지정     : ... --to 2026-09-28

무엇을 고치는가
  `shift-seed-dates.py` 는 글의 이동량(delta)을 댓글·답변에 그대로 더한다.
  상대 순서는 보존되지만, 원래 글보다 한참 뒤에 달렸던 댓글은 창 밖으로 밀려난다.

  실측(2026-08-26) — 글 500건은 9/1~9/28 안에 잘 들어갔는데
    댓글 295건(14%)이 9/28 초과, 최대 2026-10-22 03:40
    답변  25건(10%)이 9/28 초과, 최대 2026-10-18 02:58
  게다가 8~23시 제약은 **글에만** 걸려 있어서 새벽 3시 댓글이 생겼다.

어떻게 고치는가
  글 하나를 묶음으로 보고, 그 글에 달린 답변·댓글의 "글로부터 떨어진 정도"를
  창 끝까지 남은 만큼으로 **비례 압축**한다. 같은 배율을 묶음 전체에 쓰므로
  글→답변→답변댓글, 댓글→대댓글 순서가 그대로 유지된다.

  시간 계산은 **활동시간(08~24시, 하루 960분)만 세는 축**에서 한다.
  실시간 축에서 더하면 압축을 해도 새벽으로 떨어질 수 있다 —
  활동시간 축에서 계산해 되돌리면 결과가 반드시 8~23시가 된다.

무엇을 건드리지 않는가
  - 게시글(TBL_BOARD_M) 은 손대지 않는다. 이미 9/1~9/28 · 8~23시로 잘 들어가 있다.
  - `user_id LIKE 'bot_%'` 인 행만 대상이다. 실유저 글에는 영향이 없다.

주의: DB 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import os
import argparse
import sys
from collections import defaultdict
from datetime import date, datetime, time, timedelta

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          database='freelancer_project', charset='utf8mb4')

# 언더스코어는 LIKE 와일드카드다. ESCAPE 를 안 걸면 botA.. 같은 아이디까지 걸린다.
BOT_WHERE = "u.user_id LIKE 'bot!_%' ESCAPE '!' AND u.user_type_cd = 301"

DAY_START_H = 8            # 활동 시작 시각
ACTIVE_SEC_PER_DAY = (24 - DAY_START_H) * 3600   # 57,600초
EPOCH = date(2026, 1, 1)

# 앞 항목과 최소한 이만큼은 벌린다. 새벽 항목이 08시로 접히면서 겹치는 것을 막는다.
MIN_GAP_SEC = 60
# 원래 간격을 그대로 최소 간격으로 쓰되 이 이상은 쓰지 않는다.
# (사흘 뒤 댓글의 간격을 그대로 요구하면 묶음 전체가 창 밖으로 밀린다)
MAX_GAP_SEC = 3 * 3600


def to_active(t):
    """실시간 → 활동시간 축(초). 08시 이전은 그날 0초, 24시는 다음날 0초로 접힌다.

    08~23:59:59 인 시각은 from_active 로 되돌리면 **초까지 그대로** 복원된다 —
    그래서 이미 제자리에 있는 행은 UPDATE 대상이 되지 않는다.
    """
    d = (t.date() - EPOCH).days
    s = (t.hour - DAY_START_H) * 3600 + t.minute * 60 + t.second
    s = max(0, min(ACTIVE_SEC_PER_DAY, s))
    return d * ACTIVE_SEC_PER_DAY + s


def from_active(a):
    """활동시간 축(초) → 실시간. 결과 시각은 항상 08~23시다."""
    d, s = divmod(a, ACTIVE_SEC_PER_DAY)
    return (datetime.combine(EPOCH + timedelta(days=d), time(0))
            + timedelta(hours=DAY_START_H, seconds=s))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--to', default='2026-09-28', help='창 마지막 날 (포함)')
    args = ap.parse_args()

    end_dt = datetime.strptime(args.to, '%Y-%m-%d').replace(hour=23, minute=30)
    end_a = to_active(end_dt)

    mode = '실행(--apply)' if args.apply else '드라이런'
    print('=' * 72)
    print(f'시드 댓글·답변 날짜 보정 — {mode}')
    print(f"대상: {DB['host']}/{DB['database']}")
    print(f'창 끝: {end_dt:%Y-%m-%d %H:%M}  (시각 {DAY_START_H}~23시)')
    print('=' * 72)

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    # 글 — 기준점. 건드리지 않는다.
    cur.execute(f'''SELECT b.board_sq, b.board_created_at_dtm
                      FROM TBL_BOARD_M b JOIN TBL_USER_M u ON u.user_sq = b.user_sq
                     WHERE {BOT_WHERE}''')
    post_at = {sq: t for sq, t in cur.fetchall()}
    print(f'\n[기준] 시드 게시글 {len(post_at)}건')

    # 답변
    cur.execute(f'''SELECT a.answer_sq, a.board_sq, a.answer_created_at_dtm
                      FROM TBL_BOARD_ANSWER_S a JOIN TBL_USER_M u ON u.user_sq = a.user_sq
                     WHERE {BOT_WHERE}''')
    answers = cur.fetchall()
    answer_board = {sq: b for sq, b, _ in answers}

    # 댓글 — 글댓글(answer_sq NULL)과 답변댓글(board_sq NULL)이 섞여 있다
    cur.execute(f'''SELECT c.comment_sq, c.board_sq, c.answer_sq, c.comment_created_at_dtm
                      FROM TBL_BOARD_COMMENT_S c JOIN TBL_USER_M u ON u.user_sq = c.user_sq
                     WHERE {BOT_WHERE}''')
    comments = cur.fetchall()

    # 글 단위로 묶는다
    groups = defaultdict(list)     # board_sq -> [(kind, sq, 현재시각)]
    orphan = 0
    for sq, b, t in answers:
        if b in post_at:
            groups[b].append(('answer', sq, t))
        else:
            orphan += 1
    for sq, b, a_sq, t in comments:
        board = b if b is not None else answer_board.get(a_sq)
        if board in post_at:
            groups[board].append(('comment', sq, t))
        else:
            orphan += 1

    print(f'[대상] 답변 {len(answers)}건 · 댓글 {len(comments)}건'
          + (f'  (묶을 글을 못 찾은 행 {orphan}건은 건너뜀)' if orphan else ''))

    over_before = sum(1 for g in groups.values() for _, _, t in g if t > end_dt)
    night_before = sum(1 for g in groups.values() for _, _, t in g
                       if not (DAY_START_H <= t.hour <= 23))
    print(f'  보정 전 — 창 초과 {over_before}건 · 활동시간({DAY_START_H}~23시) 밖 {night_before}건')

    updates = []          # (kind, sq, 기존, 신규) — 실제로 바뀌는 것만
    planned = {}          # board_sq -> [(kind, sq, 최종시각)] — 안 바뀌는 것 포함, 검증용
    squeezed_groups = 0
    for board_sq, items in groups.items():
        post_t = post_at[board_sq]
        base_a = to_active(post_t)
        avail = end_a - base_a

        # 원래 시각 순으로 본다 — 이 순서가 결과에서도 유지돼야 한다.
        items = sorted(items, key=lambda x: (x[2], x[1]))

        # ① 활동시간 축 오프셋. 새벽 항목은 08시로 접히면서 서로 겹치므로,
        #    앞 항목과의 "원래 간격" 만큼은 벌려 자연스러운 간격을 되살린다.
        offs, prev_off, prev_t = [], 0, post_t
        for k, sq, t in items:
            gap = min(MAX_GAP_SEC, max(MIN_GAP_SEC, int((t - prev_t).total_seconds())))
            off = max(to_active(t) - base_a, prev_off + gap)
            offs.append([k, sq, t, off])
            prev_off, prev_t = off, t

        # ② 창 끝을 넘으면 묶음 전체를 같은 배율로 줄인다(순서 보존).
        max_off = offs[-1][3]
        scale = 1.0
        if max_off > avail and max_off > 0:
            scale = avail / max_off
            squeezed_groups += 1

        # ③ 압축 때문에 같은 초로 뭉칠 수 있으니 최소 1초씩은 벌린다.
        prev_off = 0
        rows = []
        for row in offs:
            new_off = max(1, int(round(row[3] * scale)), prev_off + 1)
            prev_off = new_off
            new_t = from_active(base_a + new_off)
            rows.append((row[0], row[1], new_t))
            if new_t != row[2]:
                updates.append((row[0], row[1], row[2], new_t))
        planned[board_sq] = rows

    print(f'\n[계획] 변경 {len(updates)}건  (압축이 필요한 글 {squeezed_groups}개)')
    for k, sq, old, new in updates[:10]:
        print(f'  {k:7s} {sq:<7} {old:%Y-%m-%d %H:%M} → {new:%Y-%m-%d %H:%M}')
    if len(updates) > 10:
        print(f'  ... 외 {len(updates) - 10}건')

    # ---- 계획 자체를 먼저 검증한다. 드라이런에서도 결과를 알 수 있어야 한다 ----
    over = night = before_post = 0
    latest = None
    for board_sq, rows in planned.items():
        post_t = post_at[board_sq]
        for _, _, t in rows:
            if t > end_dt:
                over += 1
            if not (DAY_START_H <= t.hour <= 23):
                night += 1
            if t <= post_t:
                before_post += 1
            if latest is None or t > latest:
                latest = t
    print(f'\n[계획 검증] 창 초과 {over} · 활동시간 밖 {night} · 글보다 앞섬 {before_post}'
          f' · 최종 최댓값 {latest:%Y-%m-%d %H:%M:%S}')
    if over or night or before_post:
        raise SystemExit('계획이 제약을 어긴다 — 적용하지 않는다.')

    if not args.apply:
        print('\n' + '=' * 72)
        print('드라이런이라 아무것도 바꾸지 않았다. 실행하려면 --apply 를 붙일 것.')
        conn.close()
        return

    try:
        for k, sq, _, new in updates:
            if k == 'answer':
                cur.execute('UPDATE TBL_BOARD_ANSWER_S SET answer_created_at_dtm = %s '
                            'WHERE answer_sq = %s', (new, sq))
            else:
                cur.execute('UPDATE TBL_BOARD_COMMENT_S SET comment_created_at_dtm = %s '
                            'WHERE comment_sq = %s', (new, sq))
        conn.commit()
    except Exception:
        conn.rollback()
        raise

    print(f'\n완료 — {len(updates)}건 변경')

    # ---- 검증 ----
    print('\n검증')
    cur.execute(f'''SELECT MIN(a.answer_created_at_dtm), MAX(a.answer_created_at_dtm),
                           SUM(HOUR(a.answer_created_at_dtm) NOT BETWEEN {DAY_START_H} AND 23)
                      FROM TBL_BOARD_ANSWER_S a JOIN TBL_USER_M u ON u.user_sq = a.user_sq
                     WHERE {BOT_WHERE}''')
    print('  답변 범위: %s ~ %s · 활동시간 밖 %s건' % cur.fetchone())
    cur.execute(f'''SELECT MIN(c.comment_created_at_dtm), MAX(c.comment_created_at_dtm),
                           SUM(HOUR(c.comment_created_at_dtm) NOT BETWEEN {DAY_START_H} AND 23)
                      FROM TBL_BOARD_COMMENT_S c JOIN TBL_USER_M u ON u.user_sq = c.user_sq
                     WHERE {BOT_WHERE}''')
    print('  댓글 범위: %s ~ %s · 활동시간 밖 %s건' % cur.fetchone())

    cur.execute(f'''SELECT COUNT(*) FROM TBL_BOARD_COMMENT_S c
                      JOIN TBL_USER_M u ON u.user_sq = c.user_sq
                      JOIN TBL_BOARD_M b ON b.board_sq = c.board_sq
                     WHERE {BOT_WHERE} AND c.comment_created_at_dtm < b.board_created_at_dtm''')
    print('  글보다 앞선 댓글:', cur.fetchone()[0])
    cur.execute(f'''SELECT COUNT(*) FROM TBL_BOARD_ANSWER_S a
                      JOIN TBL_USER_M u ON u.user_sq = a.user_sq
                      JOIN TBL_BOARD_M b ON b.board_sq = a.board_sq
                     WHERE {BOT_WHERE} AND a.answer_created_at_dtm < b.board_created_at_dtm''')
    print('  글보다 앞선 답변:', cur.fetchone()[0])
    cur.execute(f'''SELECT COUNT(*) FROM TBL_BOARD_COMMENT_S c
                      JOIN TBL_USER_M u ON u.user_sq = c.user_sq
                      JOIN TBL_BOARD_ANSWER_S a ON a.answer_sq = c.answer_sq
                     WHERE {BOT_WHERE} AND c.comment_created_at_dtm < a.answer_created_at_dtm''')
    print('  답변보다 앞선 답변댓글:', cur.fetchone()[0])

    conn.close()


if __name__ == '__main__':
    main()
