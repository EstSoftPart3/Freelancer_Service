# -*- coding: utf-8 -*-
"""
개발용 DB(freelancer_develop) 를 운영 DB(freelancer_project) 로부터 복제한다.

배경
  2026-09-01 까지 로컬 개발과 실서버가 **같은 스키마(freelancer_project)** 를 봤다.
  개발 중 스키마 변경·테스트 데이터가 그대로 운영에 반영되는 구조라, 개발 전용 사본을 만든다.

동작
  복사는 전부 **서버 안에서** 일어난다(`CREATE TABLE ... LIKE` + `INSERT ... SELECT`).
  덤프 파일을 네트워크로 왕복시키지 않으므로 몇 초면 끝난다.
  뷰·트리거도 함께 옮긴다. FK 는 복사 중에만 잠시 끄고 원복한다.

사용법
  !python "C:/dev/Freelancer_Service/docs/도구/db-clone-develop.py"           # 조사만 (아무것도 안 바꿈)
  !python "C:/dev/Freelancer_Service/docs/도구/db-clone-develop.py" --apply   # 실제 생성/복제
  !python "C:/dev/Freelancer_Service/docs/도구/db-clone-develop.py" --apply --drop
                                                                             # 기존 개발 DB 를 버리고 다시 복제

🔴 --drop 은 freelancer_develop 만 지운다. SRC(freelancer_project) 는 어떤 경우에도 읽기만 한다.
   안전장치로 SRC 이름이 DST 와 같으면 즉시 중단한다.
"""
import os
import re
import sys
import importlib.util
from datetime import datetime

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# 접속 정보·스키마 이름은 dbconfig.py 한 곳에만 둔다(비밀번호를 여기 또 적지 않기 위해).
HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

DB = dbconfig.SERVER          # database 를 지정하지 않고 붙는다 — 두 스키마를 함께 다뤄야 해서.
SRC = dbconfig.PROD           # 운영 = 원본. 절대 쓰지 않는다.
DST = dbconfig.DEVELOP        # 개발 = 사본.

APPLY = '--apply' in sys.argv
DROP = '--drop' in sys.argv


def q(name: str) -> str:
    """식별자 인용. 백틱은 스키마/테이블명에 올 수 없으므로 검증만 한다."""
    if '`' in name:
        raise ValueError(f'식별자에 백틱이 들어있다: {name!r}')
    return f'`{name}`'


def fetch(cur, sql, args=None):
    cur.execute(sql, args)
    return cur.fetchall()


def main():
    if SRC == DST:
        sys.exit('SRC 와 DST 가 같다. 중단한다.')

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    print(f'서버   : {DB["host"]}:{DB["port"]}  (MariaDB {fetch(cur, "SELECT VERSION()")[0][0]})')
    print(f'원본   : {SRC}  (읽기 전용)')
    print(f'대상   : {DST}')
    print(f'모드   : {"실행" if APPLY else "조사만 (--apply 없음)"}'
          + ('  + 기존 대상 DROP' if DROP else ''))
    print()

    # ── 1. 원본 확인 ────────────────────────────────────────────────
    schemas = {r[0] for r in fetch(cur, 'SHOW DATABASES')}
    if SRC not in schemas:
        sys.exit(f'원본 스키마 {SRC} 가 없다. 중단한다.')

    charset, collation = fetch(
        cur,
        'SELECT default_character_set_name, default_collation_name '
        'FROM information_schema.schemata WHERE schema_name=%s', (SRC,))[0]

    tables = [r[0] for r in fetch(
        cur, "SELECT table_name FROM information_schema.tables "
             "WHERE table_schema=%s AND table_type='BASE TABLE' ORDER BY table_name", (SRC,))]
    views = [r[0] for r in fetch(
        cur, "SELECT table_name FROM information_schema.tables "
             "WHERE table_schema=%s AND table_type='VIEW' ORDER BY table_name", (SRC,))]
    triggers = fetch(
        cur, "SELECT trigger_name, action_timing, event_manipulation, event_object_table, "
             "action_statement FROM information_schema.triggers "
             "WHERE trigger_schema=%s ORDER BY trigger_name", (SRC,))
    size_mb = fetch(
        cur, 'SELECT ROUND(SUM(data_length+index_length)/1024/1024,1) '
             'FROM information_schema.tables WHERE table_schema=%s', (SRC,))[0][0]

    print(f'원본 구성: 테이블 {len(tables)}개 · 뷰 {len(views)}개 · 트리거 {len(triggers)}개 · 약 {size_mb}MB')
    print(f'문자셋   : {charset} / {collation}')

    exists = DST in schemas
    if exists:
        dst_tables = fetch(
            cur, 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=%s', (DST,))[0][0]
        print(f'\n⚠ 대상 {DST} 가 이미 있다 (객체 {dst_tables}개).')
        if not DROP:
            print('  --drop 없이는 건드리지 않는다. 다시 만들려면 --apply --drop 을 준다.')
            if APPLY:
                conn.close()
                return

    if not APPLY:
        print(f'\n[조사만] 실제로 만들려면 --apply 를 붙인다.')
        conn.close()
        return

    # ── 2. 복제 ────────────────────────────────────────────────────
    t0 = datetime.now()
    cur.execute('SET FOREIGN_KEY_CHECKS=0')
    cur.execute('SET UNIQUE_CHECKS=0')

    if exists and DROP:
        print(f'\nDROP DATABASE {DST} ...')
        cur.execute(f'DROP DATABASE {q(DST)}')

    cur.execute(f'CREATE DATABASE IF NOT EXISTS {q(DST)} '
                f'CHARACTER SET {charset} COLLATE {collation}')
    print(f'CREATE DATABASE {DST} · {charset}/{collation}')

    print(f'\n테이블 {len(tables)}개 복사')
    total_rows = 0
    # `CREATE TABLE ... LIKE` 를 쓰지 않는 이유: **외래키를 복사하지 않는다.**
    # SHOW CREATE TABLE 의 DDL 을 그대로 실행해야 FK·기본값·코멘트·AUTO_INCREMENT 가 전부 따라온다.
    # FK 순환/선후 문제는 위에서 FOREIGN_KEY_CHECKS=0 으로 막아 뒀다.
    for i, t in enumerate(tables, 1):
        ddl = fetch(cur, f'SHOW CREATE TABLE {q(SRC)}.{q(t)}')[0][1]
        cur.execute(f'USE {q(DST)}')          # DDL 이 테이블명을 스키마 없이 쓰므로 현재 DB 를 옮긴다
        cur.execute(ddl)
        cur.execute(f'INSERT INTO {q(DST)}.{q(t)} SELECT * FROM {q(SRC)}.{q(t)}')
        rows = cur.rowcount
        total_rows += rows
        # 데이터가 없는 테이블은 DDL 의 AUTO_INCREMENT 가 1 로 나오는 경우가 있어 한 번 더 맞춘다.
        ai = fetch(cur, 'SELECT auto_increment FROM information_schema.tables '
                        'WHERE table_schema=%s AND table_name=%s', (SRC, t))[0][0]
        if ai:
            cur.execute(f'ALTER TABLE {q(DST)}.{q(t)} AUTO_INCREMENT={int(ai)}')
        print(f'  [{i:2}/{len(tables)}] {t:<40} {rows:>7,} 행')

    if views:
        print(f'\n뷰 {len(views)}개 복사')
        for v in views:
            ddl = fetch(cur, f'SHOW CREATE VIEW {q(SRC)}.{q(v)}')[0][1]
            # DEFINER 를 지운다 — 개발 DB 를 다른 계정으로 붙을 때 접근 거부가 나지 않게.
            ddl = re.sub(r'DEFINER=`[^`]*`@`[^`]*`\s*', '', ddl, count=1)
            ddl = ddl.replace(f'`{SRC}`.', f'`{DST}`.')
            cur.execute(f'USE {q(DST)}')
            cur.execute(ddl)
            print(f'  {v}')

    if triggers:
        print(f'\n트리거 {len(triggers)}개 복사')
        cur.execute(f'USE {q(DST)}')
        for name, timing, event, tbl, body in triggers:
            cur.execute(f'CREATE TRIGGER {q(name)} {timing} {event} '
                        f'ON {q(tbl)} FOR EACH ROW {body}')
            print(f'  {name} ({timing} {event} ON {tbl})')

    cur.execute('SET FOREIGN_KEY_CHECKS=1')
    cur.execute('SET UNIQUE_CHECKS=1')
    conn.commit()

    # ── 3. 대조 ────────────────────────────────────────────────────
    print('\n행 수 대조')
    mismatch = []
    for t in tables:
        a = fetch(cur, f'SELECT COUNT(*) FROM {q(SRC)}.{q(t)}')[0][0]
        b = fetch(cur, f'SELECT COUNT(*) FROM {q(DST)}.{q(t)}')[0][0]
        if a != b:
            mismatch.append((t, a, b))
    if mismatch:
        for t, a, b in mismatch:
            print(f'  ✗ {t}: 원본 {a:,} vs 사본 {b:,}')
        sys.exit('\n행 수가 어긋난다. 복제 실패로 간주한다.')
    print(f'  ✓ 전체 {len(tables)}개 테이블 일치 (합계 {total_rows:,} 행)')

    took = (datetime.now() - t0).total_seconds()
    print(f'\n완료 · {took:.1f}초')
    print(f'\n다음 단계: backend/src/main/resources/application.yml 의 datasource.url 을')
    print(f'  .../{DST}?useUnicode=true&characterEncoding=UTF-8  로 바꾼다.')
    conn.close()


if __name__ == '__main__':
    main()
