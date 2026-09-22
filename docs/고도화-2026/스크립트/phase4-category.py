# -*- coding: utf-8 -*-
"""
Phase 4 카테고리 데이터 정리 (사용자 결정 반영).

  ① 공통코드 3202 '일반' 비활성화 — is_active_yn 을 'N' 으로.
     게시판 이름 자체가 "일반 게시판"이라 "일반 게시판의 일반 카테고리"를 설명할 수 없다.
     행을 지우지 않는 이유: 혹시 이 코드를 참조하는 글이 생기면 라벨을 잃는다.
     비활성이면 목록 API(findActiveChildrenByParent)와 쓰기 검증에서 함께 빠진다.

  ② 기존 일반게시글(1401)의 board_category_cd NULL → 3201 '자유' 백필.
     카테고리를 필수로 바꿨으므로 미분류 글이 남아 있으면 정책이 어긋난다.

주의: 1401 외(Q&A 1402 / 공지 1403)는 카테고리 개념이 없으므로 건드리지 않는다.
      3202 를 이미 값으로 가진 글이 있으면 3201 로 함께 옮긴다(비활성 코드를 가리키면
      뱃지가 비고 어느 탭에서도 안 잡히는 유령 글이 된다).

전부 멱등하다 — 재실행해도 안전하다. 적용 전 대상 2개 테이블을 파일로 백업한다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/phase4-category.py" --dry-run   # 실행 계획만
  !python "C:/dev/Freelancer_Service/docs/phase4-category.py"             # 백업 후 적용
  !python "C:/dev/Freelancer_Service/docs/phase4-category.py" --rollback  # 되돌리기
"""
import os
import sys
from datetime import datetime

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_project', charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor,
)
SCHEMA = 'freelancer_project'
BACKUP_TABLES = ['TBL_BOARD_M', 'TBL_COMMON_CODE_C']

PARENT_BOARD_CATEGORY = 3200
NORMAL_BOARD = 1401
CATEGORY_FREE = 3201
CATEGORY_GENERAL = 3202

# ③ 신규 카테고리. (sq, 한글명, 영문명)
# 카테고리 추가는 이 표에 한 줄 넣고 재실행하면 된다 — 백엔드 코드 변경은 필요 없다
# (라벨·검증·목록 API 가 모두 공통코드를 본다). FO 는 폴백 배열과 설명 문구만 갱신한다.
NEW_CATEGORIES = [
    (3205, '정보', 'INFO'),
]

DRY_RUN = '--dry-run' in sys.argv
ROLLBACK = '--rollback' in sys.argv


def log(msg=''):
    print(msg, flush=True)


def backup(conn, tag):
    stamp = f'{datetime.now():%Y%m%d-%H%M}'
    outdir = f'C:/dev/db-backup/{stamp}-phase4'
    os.makedirs(outdir, exist_ok=True)
    path = os.path.join(outdir, f'phase4-{tag}.sql')
    counts = {}
    with conn.cursor() as cur, open(path, 'w', encoding='utf-8') as f:
        f.write(f'-- Phase 4 카테고리 정리 직전 백업 ({SCHEMA}) {datetime.now():%Y-%m-%d %H:%M:%S}\n')
        f.write('SET FOREIGN_KEY_CHECKS=0;\n\n')
        for table in BACKUP_TABLES:
            cur.execute(f'SHOW CREATE TABLE `{table}`')
            ddl = list(cur.fetchone().values())[1]
            f.write(f'-- ===== {table} =====\n{ddl};\n\n')
            cur.execute(f'SELECT * FROM `{table}`')
            rows = cur.fetchall()
            counts[table] = len(rows)
            if rows:
                cols = list(rows[0].keys())
                collist = ', '.join(f'`{c}`' for c in cols)
                for r in rows:
                    vals = ', '.join(conn.escape(r[c]) for c in cols)
                    f.write(f'INSERT INTO `{table}` ({collist}) VALUES ({vals});\n')
                f.write('\n')
        f.write('SET FOREIGN_KEY_CHECKS=1;\n')
    log(f'백업 저장: {path}')
    for t, c in counts.items():
        log(f'  - {t}: {c}행')
    return path, outdir


def survey(cur):
    """적용 전 현황. 드라이런에서 이 숫자를 먼저 확인할 것."""
    cur.execute(
        "SELECT COUNT(*) AS cnt FROM TBL_BOARD_M "
        "WHERE board_type_cd = %s AND board_is_deleted_yn = 'N' AND board_category_cd IS NULL",
        (NORMAL_BOARD,))
    null_cnt = cur.fetchone()['cnt']

    cur.execute(
        "SELECT COUNT(*) AS cnt FROM TBL_BOARD_M "
        "WHERE board_type_cd = %s AND board_is_deleted_yn = 'N' AND board_category_cd = %s",
        (NORMAL_BOARD, CATEGORY_GENERAL))
    general_cnt = cur.fetchone()['cnt']

    cur.execute(
        "SELECT board_category_cd AS cd, COUNT(*) AS cnt FROM TBL_BOARD_M "
        "WHERE board_type_cd = %s AND board_is_deleted_yn = 'N' "
        "GROUP BY board_category_cd ORDER BY 1",
        (NORMAL_BOARD,))
    dist = cur.fetchall()

    # 카테고리 개념이 없는 게시판에 값이 새 들어간 게 있는지 (있으면 코드 결함 신호)
    cur.execute(
        "SELECT COUNT(*) AS cnt FROM TBL_BOARD_M "
        "WHERE board_type_cd <> %s AND board_category_cd IS NOT NULL",
        (NORMAL_BOARD,))
    leaked = cur.fetchone()['cnt']

    log('\n[현황]')
    log(f'  일반게시글 중 미분류(NULL): {null_cnt}건  ← 3201 자유로 백필 대상')
    log(f"  일반게시글 중 '일반'(3202): {general_cnt}건  ← 3201 자유로 이동 대상")
    log(f'  카테고리 분포: {[(r["cd"], r["cnt"]) for r in dist]}')
    log(f'  1401 외 게시판에 카테고리가 박힌 행: {leaked}건 (0이어야 정상)')
    return null_cnt, general_cnt


def apply_changes(conn):
    with conn.cursor() as cur:
        survey(cur)

        log("\n① 공통코드 3202 '일반' 비활성화")
        cur.execute(
            "SELECT common_code_nm AS nm, common_code_is_active_yn AS yn "
            "FROM TBL_COMMON_CODE_C WHERE common_code_sq = %s", (CATEGORY_GENERAL,))
        row = cur.fetchone()
        if row is None:
            log(f'  [스킵] {CATEGORY_GENERAL} 코드가 없다')
        elif row['yn'] == 'N':
            log(f"  [스킵] 이미 비활성 ({row['nm']})")
        elif DRY_RUN:
            log(f"  [DRY-RUN] UPDATE ... SET is_active_yn='N' WHERE common_code_sq={CATEGORY_GENERAL} ({row['nm']})")
        else:
            cur.execute(
                "UPDATE TBL_COMMON_CODE_C SET common_code_is_active_yn = 'N' "
                "WHERE common_code_sq = %s", (CATEGORY_GENERAL,))
            log(f"  [실행] {row['nm']} 비활성화 ({cur.rowcount}행)")

        log('\n② 미분류·일반 게시글을 3201 자유로')
        if DRY_RUN:
            log('  [DRY-RUN] UPDATE TBL_BOARD_M SET board_category_cd=3201 '
                'WHERE board_type_cd=1401 AND (board_category_cd IS NULL OR board_category_cd=3202)')
        else:
            cur.execute(
                "UPDATE TBL_BOARD_M SET board_category_cd = %s "
                "WHERE board_type_cd = %s "
                "  AND (board_category_cd IS NULL OR board_category_cd = %s)",
                (CATEGORY_FREE, NORMAL_BOARD, CATEGORY_GENERAL))
            log(f'  [실행] {cur.rowcount}행 백필')

        log('\n③ 신규 카테고리 추가')
        for sq, nm, eng in NEW_CATEGORIES:
            cur.execute("SELECT COUNT(*) AS cnt FROM TBL_COMMON_CODE_C WHERE common_code_sq = %s", (sq,))
            if cur.fetchone()['cnt'] > 0:
                log(f'  [스킵] {sq} {nm} — 이미 존재')
                continue
            if DRY_RUN:
                log(f'  [DRY-RUN] INSERT {sq} {nm} (parent={PARENT_BOARD_CATEGORY}, lvl=2, eng={eng})')
                continue
            # is_active_yn 기본값이 'N' 이라 'Y' 를 명시해야 목록에 잡힌다(Phase 1 실사 사항)
            cur.execute(
                "INSERT INTO TBL_COMMON_CODE_C "
                "(common_code_sq, parent_common_code_sq, common_code_lvl, common_code_nm, "
                " common_code_english_nm, common_code_is_active_yn) "
                "VALUES (%s, %s, 2, %s, %s, 'Y')",
                (sq, PARENT_BOARD_CATEGORY, nm, eng))
            log(f'  [실행] INSERT {sq} {nm}')

        if not DRY_RUN:
            log('\n[적용 후 검증]')
            null_cnt, general_cnt = survey(cur)
            if null_cnt or general_cnt:
                raise SystemExit(f'  [경고] 남은 미분류 {null_cnt}건 / 일반 {general_cnt}건 — 확인 필요')
            log('  남은 미분류 0건 / 일반 0건 ✔')


def rollback(conn, backup_dir=None):
    """
    되돌리기 — 3202 를 다시 활성화한다.

    백필된 3201 값은 "원래 NULL이었던 행"을 알아야 되돌릴 수 있는데, 그 정보는
    적용 전 백업 파일(TBL_BOARD_M 전체 INSERT)에만 있다. 자동 복원은 다른 컬럼까지
    되돌릴 위험이 있어 하지 않는다 — 백업 파일에서 board_sq 목록을 뽑아 수동 처리할 것.
    """
    with conn.cursor() as cur:
        log("[롤백] 공통코드 3202 '일반' 재활성화")
        if DRY_RUN:
            log("  [DRY-RUN] UPDATE ... SET is_active_yn='Y' WHERE common_code_sq=3202")
        else:
            cur.execute(
                "UPDATE TBL_COMMON_CODE_C SET common_code_is_active_yn = 'Y' "
                "WHERE common_code_sq = %s", (CATEGORY_GENERAL,))
            log(f'  [실행] {cur.rowcount}행')
        log('\n[롤백] 신규 카테고리 삭제')
        for sq, nm, _eng in NEW_CATEGORIES:
            cur.execute(
                "SELECT COUNT(*) AS cnt FROM TBL_BOARD_M WHERE board_category_cd = %s", (sq,))
            used = cur.fetchone()['cnt']
            if used:
                log(f'  [스킵] {sq} {nm} — 이 카테고리를 쓰는 글 {used}건이 있어 삭제하지 않는다')
                continue
            if DRY_RUN:
                log(f'  [DRY-RUN] DELETE {sq} {nm}')
                continue
            cur.execute("DELETE FROM TBL_COMMON_CODE_C WHERE common_code_sq = %s", (sq,))
            log(f'  [실행] DELETE {sq} {nm}')

        log('\n[안내] 백필된 board_category_cd=3201 은 자동으로 되돌리지 않는다.')
        log('       적용 전 백업의 TBL_BOARD_M INSERT 문에서 board_category_cd 가 NULL 이던')
        log('       board_sq 를 뽑아 직접 UPDATE 할 것.')


def main():
    mode = '롤백' if ROLLBACK else ('드라이런' if DRY_RUN else '적용')
    log(f'=== Phase 4 카테고리 정리 ({mode}) — {SCHEMA} ===')
    conn = pymysql.connect(**DB)
    try:
        if not DRY_RUN:
            backup(conn, 'rollback' if ROLLBACK else 'apply')
        if ROLLBACK:
            rollback(conn)
        else:
            apply_changes(conn)
        if DRY_RUN:
            conn.rollback()
            log('\n[드라이런] 아무것도 커밋하지 않았다.')
        else:
            conn.commit()
            log('\n커밋 완료.')
    except Exception:
        conn.rollback()
        log('\n[오류] 롤백했다.')
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
