# -*- coding: utf-8 -*-
"""
개발 DB(freelancer_develop) 와 운영 DB(freelancer_project) 의 **구조** 차이를 보고한다.

왜 필요한가
  개발과 운영이 다른 스키마를 쓰게 되면서, 배포 직전에 "운영에 아직 안 넘어간 DB 변경이
  무엇인가" 를 반드시 알아야 한다. 그 답을 내는 도구다.
  데이터는 비교하지 않는다 — 개발 DB 의 테스트 데이터는 운영에 가면 안 되기 때문이다.

사용법
  !python "C:/dev/Freelancer_Service/docs/도구/db-diff-schema.py"
  !python "C:/dev/Freelancer_Service/docs/도구/db-diff-schema.py" --sql   # 적용용 DDL 도 같이 출력

읽는 법
  "개발에만 있음"  = 배포 전에 운영에 적용해야 할 변경.
  "운영에만 있음"  = 개발 DB 가 낡았다는 뜻. db-clone-develop.py --apply --drop 으로 다시 뜨는 게 안전하다.

어떤 것도 변경하지 않는다. SELECT / SHOW 만 한다.
출력되는 DDL 은 **제안**이다. 그대로 돌리기 전에 눈으로 확인할 것.
"""
import os
import sys
import importlib.util

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import pymysql

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

DEV = dbconfig.DEVELOP
PROD = dbconfig.PROD
SHOW_SQL = '--sql' in sys.argv


def fetch(cur, sql, args=None):
    cur.execute(sql, args)
    return cur.fetchall()


def columns(cur, schema):
    """{table: {column: (정의문자열, ordinal, 앞컬럼명)}}"""
    rows = fetch(cur, """
        SELECT table_name, column_name, ordinal_position, column_type, is_nullable,
               column_default, extra, column_comment
          FROM information_schema.columns
         WHERE table_schema=%s
         ORDER BY table_name, ordinal_position""", (schema,))
    out = {}
    prev_tbl, prev_col = None, None
    for tbl, col, pos, ctype, nullable, default, extra, comment in rows:
        parts = [ctype, 'NULL' if nullable == 'YES' else 'NOT NULL']
        if default is not None:
            parts.append(f'DEFAULT {default}')
        if extra:
            parts.append(extra.upper())
        if comment:
            parts.append(f"COMMENT '{comment}'")
        after = prev_col if tbl == prev_tbl else None
        out.setdefault(tbl, {})[col] = (' '.join(parts), pos, after)
        prev_tbl, prev_col = tbl, col
    return out


def indexes(cur, schema):
    """{table: {index_name: 정의문자열}}"""
    rows = fetch(cur, """
        SELECT table_name, index_name, non_unique, seq_in_index, column_name
          FROM information_schema.statistics
         WHERE table_schema=%s
         ORDER BY table_name, index_name, seq_in_index""", (schema,))
    tmp = {}
    for tbl, idx, non_unique, seq, col in rows:
        e = tmp.setdefault(tbl, {}).setdefault(idx, {'unique': not non_unique, 'cols': []})
        e['cols'].append(col)
    out = {}
    for tbl, idxs in tmp.items():
        out[tbl] = {name: ('UNIQUE ' if e['unique'] else '') + '(' + ', '.join(e['cols']) + ')'
                    for name, e in idxs.items()}
    return out


def main():
    conn = pymysql.connect(**dbconfig.SERVER)
    cur = conn.cursor()

    have = {r[0] for r in fetch(cur, 'SHOW DATABASES')}
    for s in (DEV, PROD):
        if s not in have:
            sys.exit(f'스키마 {s} 가 없다. 먼저 db-clone-develop.py --apply 로 개발 DB 를 만든다.')

    print(f'개발 {DEV}  ↔  운영 {PROD}\n')

    dev_c, prod_c = columns(cur, DEV), columns(cur, PROD)
    dev_i, prod_i = indexes(cur, DEV), indexes(cur, PROD)

    dev_t, prod_t = set(dev_c), set(prod_c)
    only_dev_t = sorted(dev_t - prod_t)
    only_prod_t = sorted(prod_t - dev_t)

    ddl = []
    diffs = 0

    if only_dev_t:
        diffs += len(only_dev_t)
        print(f'▶ 개발에만 있는 테이블 {len(only_dev_t)}개 — 배포 전 운영에 만들어야 한다')
        for t in only_dev_t:
            print(f'    + {t}')
            ddl.append(fetch(cur, f'SHOW CREATE TABLE `{DEV}`.`{t}`')[0][1] + ';')
        print()

    if only_prod_t:
        diffs += len(only_prod_t)
        print(f'▶ 운영에만 있는 테이블 {len(only_prod_t)}개 — 개발 DB 가 낡았거나, 개발에서 지운 것')
        for t in only_prod_t:
            print(f'    - {t}')
        print()

    for t in sorted(dev_t & prod_t):
        dc, pc = dev_c[t], prod_c[t]
        add = [c for c in dc if c not in pc]
        drop = [c for c in pc if c not in dc]
        chg = [c for c in dc if c in pc and dc[c][0] != pc[c][0]]

        di, pi = dev_i.get(t, {}), prod_i.get(t, {})
        add_i = [i for i in di if i not in pi]
        drop_i = [i for i in pi if i not in di]
        chg_i = [i for i in di if i in pi and di[i] != pi[i]]

        if not (add or drop or chg or add_i or drop_i or chg_i):
            continue
        diffs += 1
        print(f'▶ {t}')
        for c in add:
            defn, _, after = dc[c]
            print(f'    + 컬럼 {c}  {defn}')
            pos = f' AFTER `{after}`' if after and after in pc else (' FIRST' if not after else '')
            ddl.append(f'ALTER TABLE `{PROD}`.`{t}` ADD COLUMN `{c}` {defn}{pos};')
        for c in drop:
            print(f'    - 컬럼 {c}  {pc[c][0]}   (운영에만 있음 — 지울지 직접 판단할 것)')
        for c in chg:
            print(f'    ~ 컬럼 {c}')
            print(f'        운영: {pc[c][0]}')
            print(f'        개발: {dc[c][0]}')
            ddl.append(f'ALTER TABLE `{PROD}`.`{t}` MODIFY COLUMN `{c}` {dc[c][0]};')
        for i in add_i:
            print(f'    + 인덱스 {i} {di[i]}')
            if i != 'PRIMARY':
                uniq = 'UNIQUE ' if di[i].startswith('UNIQUE') else ''
                cols = di[i].split('(', 1)[1].rstrip(')')
                cols = ', '.join(f'`{x.strip()}`' for x in cols.split(','))
                ddl.append(f'ALTER TABLE `{PROD}`.`{t}` ADD {uniq}INDEX `{i}` ({cols});')
        for i in drop_i:
            print(f'    - 인덱스 {i} {pi[i]}   (운영에만 있음)')
        for i in chg_i:
            print(f'    ~ 인덱스 {i}   운영 {pi[i]}  →  개발 {di[i]}')
        print()

    if not diffs:
        print('✓ 구조 차이 없음. DB 변경 없이 배포해도 된다.')
    else:
        print(f'차이 {diffs}건.')
        if ddl and SHOW_SQL:
            print('\n' + '-' * 62)
            print('-- 운영 적용 제안 DDL (검토 후 사용)')
            print('-' * 62)
            for s in ddl:
                print(s)
        elif ddl:
            print('--sql 을 붙이면 운영 적용용 DDL 제안을 함께 출력한다.')

    conn.close()


if __name__ == '__main__':
    main()
