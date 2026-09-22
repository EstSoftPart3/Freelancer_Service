# -*- coding: utf-8 -*-
"""
Phase 1 스키마 확장 사전 점검 (읽기 전용).

DDL을 적용하기 전에 다음을 확인한다:
  - TBL_USER_M / TBL_BOARD_M 에 추가할 컬럼이 이미 있지 않은지 (재실행 안전성)
  - 닉네임 백필 소스(user_id)의 중복·길이 (UNIQUE 제약 통과 가능 여부)
  - TBL_COMMON_CODE_C 의 컬럼 구조와 3200/1404/2607 번호대 공실 여부

SELECT만 수행하며 어떤 것도 변경하지 않는다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/phase1-precheck.py"
"""
import os
import sys
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


def show(title):
    print('\n' + '=' * 70)
    print(title)
    print('=' * 70)


def columns_of(cur, table):
    cur.execute(
        "SELECT column_name, column_type, is_nullable, column_default "
        "FROM information_schema.columns WHERE table_schema=%s AND table_name=%s "
        "ORDER BY ordinal_position",
        (SCHEMA, table),
    )
    return cur.fetchall()


def main():
    conn = pymysql.connect(**DB)
    try:
        with conn.cursor() as cur:
            show('1. TBL_USER_M 컬럼 — user_nickname 존재 여부')
            cols = columns_of(cur, 'TBL_USER_M')
            names = [c['column_name'].lower() for c in cols]
            print(f"컬럼 수: {len(cols)}")
            print(f"user_nickname 존재: {'user_nickname' in names}")
            for c in cols:
                if c['column_name'].lower() in ('user_sq', 'user_id', 'user_nm', 'user_nickname'):
                    print(f"  - {c['column_name']:<20} {c['column_type']:<15} "
                          f"NULL={c['is_nullable']} DEFAULT={c['column_default']}")

            show('2. 닉네임 백필 소스(user_id) 안전성')
            cur.execute("SELECT COUNT(*) AS cnt FROM TBL_USER_M")
            print(f"회원 수: {cur.fetchone()['cnt']}")
            cur.execute("SELECT COUNT(*) AS cnt, MAX(CHAR_LENGTH(user_id)) AS maxlen FROM TBL_USER_M")
            row = cur.fetchone()
            print(f"user_id 최대 길이: {row['maxlen']} (VARCHAR(20) 수용 가능: {row['maxlen'] <= 20})")
            cur.execute(
                "SELECT user_id, COUNT(*) AS cnt FROM TBL_USER_M "
                "GROUP BY user_id HAVING COUNT(*) > 1"
            )
            dups = cur.fetchall()
            print(f"user_id 중복: {len(dups)}건 {dups if dups else '(없음 → 접미사 처리 불필요)'}")

            show('3. TBL_BOARD_M 컬럼 — board_category_cd / board_is_secret_yn 존재 여부')
            cols = columns_of(cur, 'TBL_BOARD_M')
            names = [c['column_name'].lower() for c in cols]
            print(f"컬럼 수: {len(cols)}")
            print(f"board_category_cd 존재: {'board_category_cd' in names}")
            print(f"board_is_secret_yn 존재: {'board_is_secret_yn' in names}")
            for c in cols:
                if c['column_name'].lower() in ('board_sq', 'board_type_cd', 'board_typ'):
                    print(f"  - {c['column_name']:<20} {c['column_type']:<15} NULL={c['is_nullable']}")
            cur.execute("SELECT COUNT(*) AS cnt FROM TBL_BOARD_M")
            print(f"게시글 수: {cur.fetchone()['cnt']}")

            show('4. TBL_BOARD_M 기존 인덱스')
            cur.execute("SHOW INDEX FROM TBL_BOARD_M")
            for r in cur.fetchall():
                print(f"  - {r['Key_name']:<35} seq={r['Seq_in_index']} col={r['Column_name']}")

            show('5. TBL_COMMON_CODE_C 구조')
            for c in columns_of(cur, 'TBL_COMMON_CODE_C'):
                print(f"  - {c['column_name']:<25} {c['column_type']:<15} "
                      f"NULL={c['is_nullable']} DEFAULT={c['column_default']}")

            show('6. 공통코드 부모 번호대 사용 현황 (신규 3200/1404/2607 충돌 확인)')
            cur.execute(
                "SELECT common_code_sq, common_code_nm, parent_common_code_sq "
                "FROM TBL_COMMON_CODE_C "
                "WHERE common_code_sq BETWEEN 3190 AND 3299 "
                "   OR common_code_sq IN (1400,1401,1402,1403,1404,2600,2605,2606,2607) "
                "ORDER BY common_code_sq"
            )
            rows = cur.fetchall()
            if not rows:
                print('  (해당 범위 코드 없음)')
            for r in rows:
                print(f"  - {r['common_code_sq']:<6} {str(r['common_code_nm']):<25} parent={r['parent_common_code_sq']}")

            show('7. 공통코드 최대값 / 부모코드 목록')
            cur.execute("SELECT MAX(common_code_sq) AS mx FROM TBL_COMMON_CODE_C")
            print(f"common_code_sq 최대값: {cur.fetchone()['mx']}")
            cur.execute(
                "SELECT DISTINCT parent_common_code_sq FROM TBL_COMMON_CODE_C "
                "WHERE parent_common_code_sq IS NOT NULL ORDER BY parent_common_code_sq"
            )
            print('사용 중인 parent_common_code_sq: ' + ', '.join(str(r['parent_common_code_sq']) for r in cur.fetchall()))

            show('8. 게시판 구분(1400 하위) 실제 값')
            cur.execute(
                "SELECT common_code_sq, common_code_nm FROM TBL_COMMON_CODE_C "
                "WHERE parent_common_code_sq = 1400 ORDER BY common_code_sq"
            )
            for r in cur.fetchall():
                print(f"  - {r['common_code_sq']:<6} {r['common_code_nm']}")

            show('9. 알림 유형(2600 하위) 실제 값')
            cur.execute(
                "SELECT common_code_sq, common_code_nm FROM TBL_COMMON_CODE_C "
                "WHERE parent_common_code_sq = 2600 ORDER BY common_code_sq"
            )
            for r in cur.fetchall():
                print(f"  - {r['common_code_sq']:<6} {r['common_code_nm']}")
    finally:
        conn.close()
    print('\n점검 완료 — 변경 없음(읽기 전용)')


if __name__ == '__main__':
    main()
