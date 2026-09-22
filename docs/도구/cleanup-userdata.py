# -*- coding: utf-8 -*-
"""
사용자 생성 데이터 정리 (공용 DB, 승인 후 실행)

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/cleanup-userdata.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/cleanup-userdata.py" --apply
  계정까지 전부 : !python "C:/dev/Freelancer_Service/docs/도구/cleanup-userdata.py" --apply --purge-accounts

무엇을 하는가
  회원·게시글·프로젝트·지원내역 등 **사용자가 만든 데이터**를 지우고,
  코드/설정 테이블은 그대로 둔다.

🔴 지우면 안 되는 것 — 이게 이 스크립트의 존재 이유다
  `TBL_COMMON_CODE_C`(공통코드)와 `TBL_AREA_C`(지역코드)는 데이터가 아니라 **설정값**이다.
  게시판 카테고리(3201 자유/3203 현장정보/3204 기능요청/3205 정보)·게시판 유형(1401~)·
  프로젝트 상태·회원 구분(301/302/303)이 전부 여기 들어 있다.
  지우면 화면이 비는 정도가 아니라 **글쓰기·로그인·목록이 전부 깨진다.**
  스킬태그(`TBL_SKILL_TAG_C`)도 마스터 데이터라 보존한다.

🔴 계정을 남기는 이유 (기본 동작)
  `docs/도구/phase7-accounts.py` 는 **`user_id='admin'` 계정을 템플릿으로 복제**해서
  관리자·봇을 만든다(address_sq 등 NOT NULL 부수 컬럼을 상속받기 위해서다).
  회원을 전부 지우면 그 스크립트가 "템플릿 계정이 없다"로 멈춰 **계정을 다시 만들 수 없다.**
  그래서 기본값은 관리자·봇·템플릿 계정을 남긴다.
  정말 전부 지우려면 `--purge-accounts` 를 주되, 그 뒤에는 회원가입 API 로 계정을
  하나 만들어야 phase7 스크립트를 쓸 수 있다.

어떻게 순서를 정하나
  테이블 목록과 외래키를 information_schema 에서 **직접 읽어** 자식→부모 순으로 지운다.
  스키마가 바뀌어도 스크립트를 고칠 필요가 없다. 순환 참조가 있으면 경고하고
  FOREIGN_KEY_CHECKS 를 잠시 끈 뒤, 끝나고 나서 고아 행이 없는지 검증한다.

안전 장치
  - 기본이 드라이런이다. --apply 를 명시해야 쓴다.
  - 실행 전에 백업 유무를 확인하고, 없으면 진행을 막는다(--skip-backup-check 로 우회 가능).
  - 삭제 전후 행수를 테이블별로 출력한다.
  - 트랜잭션 하나로 묶고 실패 시 전량 롤백한다.
  - 끝나고 FK 고아 행을 검증한다.

주의: 이 파일에는 DB 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import argparse
import glob
import os
import sys
from collections import defaultdict

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_project', charset='utf8mb4',
)
SCHEMA = 'freelancer_project'

BACKUP_ROOT = 'C:/dev/db-backup'

# ---------------------------------------------------------------------------
# 보존 대상
# ---------------------------------------------------------------------------

# 코드/설정 테이블 — 통째로 보존한다. 지우면 앱이 동작하지 않는다.
PRESERVE_TABLES = {
    'tbl_common_code_c',   # 공통코드. 카테고리·유형·상태·회원구분 전부
    'tbl_area_c',          # 지역코드
    'tbl_skill_tag_c',     # 스킬태그 마스터
    # 국가자격증 마스터(618행). 이력서 작성 화면의 자격증 검색 목록이다
    # (ResumeMapper.xml 의 selectCertificatesByName). 접미사가 _c 가 아니라 _s 라
    # PRESERVE_SUFFIX 자동 보존에 안 걸린다 — 지우면 자격증을 고를 수 없게 된다.
    # 이름이 비슷한 tbl_resume_certification_s 는 '이력서에 등록한 자격증'이라
    # 사용자 데이터다. 삭제 대상이 맞다.
    'tbl_certificate_s',
}

# 접미사가 _c 인 테이블은 관례상 코드 테이블이다. 위 목록에 없어도 보존하고 경고만 남긴다.
PRESERVE_SUFFIX = '_c'

# 남길 계정 (--purge-accounts 를 주면 무시된다)
#
#   admin(106)       = BO 관리자 로그인 계정이자 phase7/9 스크립트의 복제 템플릿.
#                      이걸 지우면 봇 생성과 BO 접속이 동시에 막힌다. 반드시 남길 것.
#   estsw_admin = 운영 기업 계정(2026-08-26 재생성, user_sq 275). 원래는 관리자(148)였다
#
# 2026-08-25 정식 오픈 준비 — 기존 봇 bot_01~25 는 일부러 남기지 않는다.
# 초기화 뒤 phase9-bot-accounts.py 로 100개를 새로 만들기 때문이다.
# (순서가 중요하다: 초기화 → 봇 생성. 반대로 하면 방금 만든 봇이 지워진다.)
KEEP_USER_IDS = ['admin', 'estsw_admin']


def fetch_tables(cur):
    cur.execute(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema=%s AND table_type='BASE TABLE'", (SCHEMA,))
    return sorted(r[0].lower() for r in cur.fetchall())


def fetch_fks(cur):
    """[(자식테이블, 자식컬럼, 부모테이블, 부모컬럼)] — 자식이 부모를 참조한다."""
    cur.execute(
        "SELECT table_name, column_name, referenced_table_name, referenced_column_name "
        "FROM information_schema.key_column_usage "
        "WHERE table_schema=%s AND referenced_table_name IS NOT NULL", (SCHEMA,))
    return [(a.lower(), b.lower(), c.lower(), d.lower()) for a, b, c, d in cur.fetchall()]


def delete_order(tables, fks):
    """자식 먼저 지우도록 위상정렬. (순서, 순환에 걸린 테이블)"""
    # edge: child -> parent  (child 를 먼저 지워야 한다)
    parents = defaultdict(set)
    children = defaultdict(set)
    for child, _, parent, _ in fks:
        if child == parent:          # 자기참조(댓글 대댓글 등)는 순서에 영향이 없다
            continue
        if child in tables and parent in tables:
            parents[child].add(parent)
            children[parent].add(child)

    order, remaining = [], set(tables)
    while remaining:
        # 자식이 남아있지 않은 테이블 = 지금 지워도 안전
        ready = sorted(t for t in remaining if not (children[t] & remaining))
        if not ready:
            break                     # 순환
        order.extend(ready)
        remaining -= set(ready)
    return order, sorted(remaining)


def row_counts(cur, tables):
    counts = {}
    for t in tables:
        cur.execute(f'SELECT COUNT(*) FROM `{t}`')
        counts[t] = cur.fetchone()[0]
    return counts


def latest_backup():
    if not os.path.isdir(BACKUP_ROOT):
        return None
    dirs = [d for d in glob.glob(os.path.join(BACKUP_ROOT, '*')) if os.path.isdir(d)]
    return max(dirs, key=os.path.getmtime) if dirs else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='실제로 삭제한다(기본은 드라이런)')
    ap.add_argument('--purge-accounts', action='store_true',
                    help='관리자·봇 계정까지 전부 지운다 (phase7 스크립트가 못 쓰게 된다)')
    ap.add_argument('--reset-autoincrement', action='store_true',
                    help='비운 테이블의 AUTO_INCREMENT 를 1로 되돌린다')
    ap.add_argument('--skip-backup-check', action='store_true')
    args = ap.parse_args()

    mode = '실행(--apply)' if args.apply else '드라이런'
    print('=' * 72)
    print(f'사용자 데이터 정리 — {mode}')
    print(f'대상: {DB["host"]}/{SCHEMA}')
    print('=' * 72)

    # ---- 백업 확인 -------------------------------------------------------
    bk = latest_backup()
    print(f'\n[백업] 최근: {bk or "없음"}')
    if args.apply and not args.skip_backup_check:
        if not bk:
            print('\n중단: 백업이 없다. 먼저 실행할 것 —')
            print('  !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"')
            print('(정말 백업 없이 진행하려면 --skip-backup-check)')
            return 1

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    tables = fetch_tables(cur)
    fks = fetch_fks(cur)

    # ---- 분류 ------------------------------------------------------------
    preserved, targets = [], []
    for t in tables:
        if t in PRESERVE_TABLES or t.endswith(PRESERVE_SUFFIX):
            preserved.append(t)
        else:
            targets.append(t)

    unexpected = [t for t in preserved if t not in PRESERVE_TABLES]
    order, cyclic = delete_order(targets, fks)
    if cyclic:
        order += cyclic

    before = row_counts(cur, tables)

    print(f'\n[보존] 코드/설정 테이블 {len(preserved)}개 — 손대지 않는다')
    for t in preserved:
        mark = '  (※ _c 접미사로 자동 보존)' if t in unexpected else ''
        print(f'    {t:44s} {before[t]:>8,}행{mark}')

    keep_sqs = []
    if not args.purge_accounts:
        placeholders = ','.join(['%s'] * len(KEEP_USER_IDS))
        cur.execute(f'SELECT user_sq, user_id FROM tbl_user_m WHERE user_id IN ({placeholders})',
                    KEEP_USER_IDS)
        rows = cur.fetchall()
        keep_sqs = [r[0] for r in rows]
        print(f'\n[보존] 계정 {len(keep_sqs)}개 (관리자·봇·템플릿)')
        for sq, uid in sorted(rows):
            print(f'    user_sq={sq:<5} {uid}')
        if not any(r[1] == 'admin' for r in rows):
            print('    ⚠️ 템플릿 계정 admin 이 없다 — phase7-accounts.py 가 동작하지 않을 수 있다')
    else:
        print('\n[보존] 계정 없음 — --purge-accounts')
        print('    ⚠️ phase7-accounts.py 는 템플릿 계정이 있어야 동작한다.')
        print('       이후 계정을 만들려면 회원가입 API 로 한 건 먼저 만들 것.')

    if cyclic:
        print(f'\n⚠️ 순환 참조 {len(cyclic)}개 — 마지막에 처리하고 FK 검사를 잠시 끈다: '
              + ', '.join(cyclic))

    print(f'\n[삭제 대상] {len(targets)}개 테이블 (자식 → 부모 순)')
    total = 0
    for t in order:
        n = before[t]
        total += n
        if t == 'tbl_user_m' and keep_sqs:
            print(f'    {t:44s} {n:>8,}행 → {len(keep_sqs)}행 남김')
        elif n:
            print(f'    {t:44s} {n:>8,}행')
    print(f'\n    삭제 예정 합계 약 {total - len(keep_sqs):,}행')

    if not args.apply:
        print('\n' + '=' * 72)
        print('드라이런이라 아무것도 지우지 않았다.')
        print('실행하려면 --apply 를 붙일 것. 그 전에 백업을 권한다:')
        print('  !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"')
        conn.close()
        return 0

    # ---- 실행 ------------------------------------------------------------
    print('\n' + '=' * 72)
    print('삭제 시작')
    try:
        conn.begin()
        cur.execute('SET FOREIGN_KEY_CHECKS=0')

        for t in order:
            if t == 'tbl_user_m' and keep_sqs:
                ph = ','.join(['%s'] * len(keep_sqs))
                cur.execute(f'DELETE FROM `{t}` WHERE user_sq NOT IN ({ph})', keep_sqs)
            else:
                cur.execute(f'DELETE FROM `{t}`')
            print(f'    {t:44s} {cur.rowcount:>8,}행 삭제')

        # 남긴 계정이 참조하는 부모 행(주소 등)은 살려야 한다.
        # 위에서 전부 지웠으므로 NULL 로 끊어준다 — 컬럼이 NOT NULL 이면 건너뛴다.
        if keep_sqs:
            print('\n  남긴 계정의 끊어진 참조 정리')
            for child, col, parent, pcol in fks:
                if child != 'tbl_user_m' or parent == 'tbl_user_m':
                    continue
                cur.execute(
                    "SELECT is_nullable FROM information_schema.columns "
                    "WHERE table_schema=%s AND table_name=%s AND column_name=%s",
                    (SCHEMA, child, col))
                row = cur.fetchone()
                nullable = row and row[0] == 'YES'
                cur.execute(f'SELECT COUNT(*) FROM `{child}` c LEFT JOIN `{parent}` p '
                            f'ON c.`{col}` = p.`{pcol}` WHERE c.`{col}` IS NOT NULL '
                            f'AND p.`{pcol}` IS NULL')
                orphan = cur.fetchone()[0]
                if not orphan:
                    continue
                if nullable:
                    cur.execute(f'UPDATE `{child}` c LEFT JOIN `{parent}` p '
                                f'ON c.`{col}` = p.`{pcol}` SET c.`{col}` = NULL '
                                f'WHERE c.`{col}` IS NOT NULL AND p.`{pcol}` IS NULL')
                    print(f'    {child}.{col} → NULL {cur.rowcount}건')
                else:
                    print(f'    ⚠️ {child}.{col} 고아 {orphan}건인데 NOT NULL 이라 정리 못 함 '
                          f'(→ {parent} 를 보존 대상에 넣거나 --purge-accounts 를 쓸 것)')

        if args.reset_autoincrement:
            print('\n  AUTO_INCREMENT 초기화')
            for t in order:
                if t == 'tbl_user_m' and keep_sqs:
                    continue          # 남긴 계정과 번호가 겹치면 안 된다
                try:
                    cur.execute(f'ALTER TABLE `{t}` AUTO_INCREMENT = 1')
                except Exception as e:
                    print(f'    {t}: 건너뜀 ({e})')

        cur.execute('SET FOREIGN_KEY_CHECKS=1')
        conn.commit()
        print('\n  커밋 완료')
    except Exception as e:
        conn.rollback()
        print(f'\n실패 — 전량 롤백했다: {e}')
        conn.close()
        return 1

    # ---- 검증 ------------------------------------------------------------
    print('\n' + '=' * 72)
    print('검증')
    after = row_counts(cur, tables)

    print('\n  보존 테이블이 그대로인지')
    ok = True
    for t in preserved:
        same = before[t] == after[t]
        ok &= same
        print(f'    {t:44s} {before[t]:>7,} → {after[t]:>7,} {"OK" if same else "🔴 변경됨"}')

    print('\n  남은 행')
    for t in order:
        if after[t]:
            print(f'    {t:44s} {after[t]:>8,}행')

    print('\n  FK 고아 행')
    orphans = 0
    for child, col, parent, pcol in fks:
        if child == parent:
            continue
        cur.execute(f'SELECT COUNT(*) FROM `{child}` c LEFT JOIN `{parent}` p '
                    f'ON c.`{col}` = p.`{pcol}` WHERE c.`{col}` IS NOT NULL AND p.`{pcol}` IS NULL')
        n = cur.fetchone()[0]
        if n:
            orphans += n
            print(f'    🔴 {child}.{col} → {parent}.{pcol}: {n}건')
    print('    없음' if not orphans else f'    합계 {orphans}건 — 확인 필요')

    conn.close()
    print('\n' + '=' * 72)
    print('완료' + ('' if ok and not orphans else ' (위 경고 확인할 것)'))
    if args.purge_accounts:
        print('\n계정을 다시 만들려면 — 템플릿 계정이 없으므로 회원가입 API 로 한 건 먼저 만들고:')
    else:
        print('\n계정은 남아 있다. 필요하면 재생성:')
    print('  !python "C:/dev/Freelancer_Service/docs/도구/phase7-accounts.py" --apply   # 관리자+봇 01~05')
    print('  !python "C:/dev/Freelancer_Service/docs/도구/phase8-bot-accounts.py" --apply  # 봇 06~25')
    return 0


if __name__ == '__main__':
    sys.exit(main())
