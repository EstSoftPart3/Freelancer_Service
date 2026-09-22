# -*- coding: utf-8 -*-
"""
DB 파일 백업 스크립트 (읽기 전용).

mysqldump 가 로컬에 설치돼 있지 않아 pymysql 로 직접 덤프를 만든다.
freelancer_education / freelancer_project 두 스키마를 통째로
CREATE TABLE + INSERT 문 형태의 .sql 파일로 저장한다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"

저장 위치: C:/dev/db-backup/YYYYMMDD-HHMM/
  freelancer_education.sql
  freelancer_project.sql
  MANIFEST.txt          (테이블별 행수 — 복구 후 대조용)

프로젝트 폴더 밖에 저장하므로 git 에 섞일 일이 없다.
어떤 것도 변경하지 않는다 (SELECT / SHOW CREATE TABLE 만 수행).
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

# freelancer_develop(개발 사본)은 일부러 빼 놓았다. 언제든 운영에서 다시 뜰 수 있어
# 백업 대상이 아니다:  !python "docs/도구/db-clone-develop.py" --apply --drop
SCHEMAS = ['freelancer_education', 'freelancer_project']

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    charset='utf8mb4',
)

STAMP = f'{datetime.now():%Y%m%d-%H%M}'
OUTDIR = f'C:/dev/db-backup/{STAMP}'

ROWS_PER_INSERT = 200


def main():
    os.makedirs(OUTDIR, exist_ok=True)
    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    manifest = [f'백업 시각: {datetime.now():%Y-%m-%d %H:%M:%S}',
                f'서버: {DB["host"]}:{DB["port"]}', '']
    grand_total = 0

    for schema in SCHEMAS:
        path = os.path.join(OUTDIR, f'{schema}.sql')
        cur.execute("SELECT table_name FROM information_schema.tables "
                    "WHERE table_schema=%s AND table_type='BASE TABLE' ORDER BY table_name",
                    (schema,))
        tables = [r[0] for r in cur.fetchall()]

        print(f'[{schema}] 테이블 {len(tables)}개 → {path}')
        manifest.append(f'== {schema} ({len(tables)}개 테이블) ==')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(f'-- {schema} 백업 {datetime.now():%Y-%m-%d %H:%M:%S}\n')
            f.write('-- 복구:  mysql -h db.estsw.co.kr -u admin -p <대상스키마> < 이파일\n')
            f.write('SET NAMES utf8mb4;\n')
            f.write('SET FOREIGN_KEY_CHECKS=0;\n\n')

            schema_total = 0
            for t in tables:
                # DDL
                cur.execute(f'SHOW CREATE TABLE `{schema}`.`{t}`')
                ddl = cur.fetchone()[1]
                f.write(f'-- ---------- {t} ----------\n')
                f.write(f'DROP TABLE IF EXISTS `{t}`;\n{ddl};\n')

                # 데이터
                cur.execute(f'SELECT * FROM `{schema}`.`{t}`')
                rows = cur.fetchall()
                n = len(rows)
                schema_total += n
                if n:
                    cols = [d[0] for d in cur.description]
                    collist = ', '.join(f'`{c}`' for c in cols)
                    for i in range(0, n, ROWS_PER_INSERT):
                        chunk = rows[i:i + ROWS_PER_INSERT]
                        vals = ',\n'.join(
                            '(' + ', '.join(conn.escape(v) for v in row) + ')'
                            for row in chunk)
                        f.write(f'INSERT INTO `{t}` ({collist}) VALUES\n{vals};\n')
                f.write('\n')
                print(f'    {t:48s} {n:>7,}행')
                manifest.append(f'{t}\t{n}')

            f.write('SET FOREIGN_KEY_CHECKS=1;\n')

        size_mb = os.path.getsize(path) / 1024 / 1024
        print(f'  → {schema_total:,}행, {size_mb:.1f}MB\n')
        manifest.append(f'-- 합계 {schema_total}행, {size_mb:.1f}MB\n')
        grand_total += schema_total

    with open(os.path.join(OUTDIR, 'MANIFEST.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(manifest))

    conn.close()
    print('=' * 60)
    print(f'백업 완료: {OUTDIR}')
    print(f'총 {grand_total:,}행')
    print()
    print('복구가 필요하면:')
    print(f'  mysql -h db.estsw.co.kr -u admin -p freelancer_education '
          f'< "{OUTDIR}/freelancer_education.sql"')
    print('(mysql 클라이언트가 없으면 docs/도구/db-restore.py 로도 가능)')


if __name__ == '__main__':
    main()
