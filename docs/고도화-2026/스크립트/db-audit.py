# -*- coding: utf-8 -*-
"""
DB 이관 실사 스크립트 (읽기 전용).

freelancer_education → freelancer_project 이관 방식을 결정하기 위해
두 스키마의 테이블 목록·이름 충돌·컬럼 스펙 차이·FK·AUTO_INCREMENT를 비교한다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/db-audit.py"

결과는 콘솔 + docs/db-audit-result.md 에 저장된다.
SELECT만 수행하며 어떤 것도 변경하지 않는다.
"""
import os
import sys
import pymysql
from datetime import datetime

# Windows 콘솔이 cp949라 유니코드(—, ★ 등)에서 죽는 것 방지.
# 파일 출력은 utf-8 그대로 유지된다.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

SRC = 'freelancer_education'   # 원본 (보존 대상, 다른 곳에서도 사용 중)
DST = 'freelancer_project'     # 이관 대상 (기존 데이터 있음)

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor,
)

OUT = r'C:/dev/Freelancer_Service/docs/db-audit-result.md'
lines = []


def w(s=''):
    print(s)
    lines.append(s)


def main():
    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    w(f'# DB 이관 실사 결과')
    w()
    w(f'- 실행 시각: {datetime.now():%Y-%m-%d %H:%M:%S}')
    w(f'- 원본(SRC): `{SRC}`  /  대상(DST): `{DST}`')
    w()

    # 스키마 존재 확인
    cur.execute(
        "SELECT schema_name, default_character_set_name cs, default_collation_name co "
        "FROM information_schema.schemata WHERE schema_name IN (%s,%s)", (SRC, DST))
    schemas = {r['schema_name']: r for r in cur.fetchall()}
    for name in (SRC, DST):
        if name in schemas:
            r = schemas[name]
            w(f'- `{name}` 존재 — charset={r["cs"]}, collation={r["co"]}')
        else:
            w(f'- **`{name}` 없음!** 스키마명을 확인하세요.')
    w()
    if SRC not in schemas or DST not in schemas:
        w('스키마가 없어 중단합니다.')
        _flush()
        return

    # ── ① 테이블 목록 + 행수 + 크기 ────────────────────────────
    def tables(schema):
        cur.execute(
            "SELECT table_name tn, engine, table_rows est_rows, table_collation co, "
            "       ROUND((data_length+index_length)/1024/1024,2) mb, auto_increment ai "
            "FROM information_schema.tables "
            "WHERE table_schema=%s AND table_type='BASE TABLE' ORDER BY table_name", (schema,))
        return {r['tn']: r for r in cur.fetchall()}

    src_t, dst_t = tables(SRC), tables(DST)

    w('## ① 테이블 목록')
    w()
    w(f'- `{SRC}`: **{len(src_t)}개**')
    w(f'- `{DST}`: **{len(dst_t)}개**')
    w()

    # 정확한 행수 (table_rows는 InnoDB에서 추정치)
    def exact_count(schema, tn):
        try:
            cur.execute(f'SELECT COUNT(*) c FROM `{schema}`.`{tn}`')
            return cur.fetchone()['c']
        except Exception as e:
            return f'ERR({e.__class__.__name__})'

    only_src = sorted(set(src_t) - set(dst_t))
    only_dst = sorted(set(dst_t) - set(src_t))
    both = sorted(set(src_t) & set(dst_t))

    # ── ② 이름 충돌 (가장 중요) ────────────────────────────────
    w('## ② 이름 충돌 (양쪽에 다 있는 테이블)')
    w()
    if not both:
        w('**충돌 0건 → 순수 가산(additive) 이관 가능. 가장 안전한 경로.**')
    else:
        w(f'**{len(both)}건.** 대상 쪽 행수가 0이면 덮어써도 무방, 0이 아니면 개별 판단 필요.')
        w()
        w('| 테이블 | SRC 행수 | DST 행수 | SRC MB | DST MB | DST AUTO_INC | 판정 |')
        w('|---|---:|---:|---:|---:|---:|---|')
        for tn in both:
            sc, dc = exact_count(SRC, tn), exact_count(DST, tn)
            verdict = ('DST 비어있음 → 덮어쓰기 가능' if dc == 0
                       else ('행수 동일 → 이미 이관됐을 가능성' if sc == dc
                             else '**DST에 데이터 있음 → 판단 필요**'))
            w(f'| `{tn}` | {sc} | {dc} | {src_t[tn]["mb"]} | {dst_t[tn]["mb"]} | '
              f'{dst_t[tn]["ai"]} | {verdict} |')
    w()

    # ── ③ 원본에만 있는 테이블 (= 이관 대상) ──────────────────
    w(f'## ③ `{SRC}`에만 있는 테이블 (이관 대상 후보)')
    w()
    if not only_src:
        w('없음.')
    else:
        w(f'{len(only_src)}개.')
        w()
        w('| 테이블 | 행수 | MB | Engine | Collation | 비고 |')
        w('|---|---:|---:|---|---|---|')
        for tn in only_src:
            r = src_t[tn]
            note = '' if tn.upper().startswith('TBL_') else '**TBL_ 접두사 없음 → Hibernate 고아 테이블 의심**'
            w(f'| `{tn}` | {exact_count(SRC, tn)} | {r["mb"]} | {r["engine"]} | {r["co"]} | {note} |')
    w()

    # ── ④ 대상에만 있는 테이블 (건드리면 안 되는 것) ──────────
    w(f'## ④ `{DST}`에만 있는 테이블 (기존 데이터 — 보존)')
    w()
    if not only_dst:
        w('없음.')
    else:
        w(f'{len(only_dst)}개. **이관 작업이 이것들을 건드리지 않아야 한다.**')
        w()
        w('| 테이블 | 행수 | MB | Engine |')
        w('|---|---:|---:|---|')
        for tn in only_dst:
            r = dst_t[tn]
            w(f'| `{tn}` | {exact_count(DST, tn)} | {r["mb"]} | {r["engine"]} |')
    w()

    # ── ⑤ 충돌 테이블의 컬럼 스펙 차이 ────────────────────────
    w('## ⑤ 충돌 테이블 컬럼 스펙 차이')
    w()
    if not both:
        w('충돌이 없어 해당 없음.')
    else:
        def cols(schema, tn):
            cur.execute(
                "SELECT column_name cn, column_type ct, is_nullable nu, column_key ck, "
                "       column_default cd, extra ex, ordinal_position op "
                "FROM information_schema.columns WHERE table_schema=%s AND table_name=%s "
                "ORDER BY ordinal_position", (schema, tn))
            return {r['cn']: r for r in cur.fetchall()}

        diff_found = False
        for tn in both:
            sc, dc = cols(SRC, tn), cols(DST, tn)
            only_s = [c for c in sc if c not in dc]
            only_d = [c for c in dc if c not in sc]
            changed = [c for c in sc if c in dc and (
                sc[c]['ct'] != dc[c]['ct'] or sc[c]['nu'] != dc[c]['nu'])]
            if not (only_s or only_d or changed):
                continue
            diff_found = True
            w(f'### `{tn}`')
            for c in only_s:
                w(f'- SRC에만: `{c}` {sc[c]["ct"]}')
            for c in only_d:
                w(f'- DST에만: `{c}` {dc[c]["ct"]}')
            for c in changed:
                w(f'- 타입 다름: `{c}` — SRC `{sc[c]["ct"]}/{sc[c]["nu"]}` vs '
                  f'DST `{dc[c]["ct"]}/{dc[c]["nu"]}`')
            w()
        if not diff_found:
            w('충돌 테이블 전부 컬럼 스펙 동일.')
    w()

    # ── ⑥ FK ──────────────────────────────────────────────────
    w('## ⑥ 외래키')
    w()
    for schema in (SRC, DST):
        cur.execute(
            "SELECT table_name tn, constraint_name cn, column_name col, "
            "       referenced_table_name rt, referenced_column_name rc "
            "FROM information_schema.key_column_usage "
            "WHERE table_schema=%s AND referenced_table_name IS NOT NULL "
            "ORDER BY table_name", (schema,))
        fks = cur.fetchall()
        w(f'- `{schema}`: {len(fks)}건')
        for f in fks:
            w(f'  - `{f["tn"]}.{f["col"]}` → `{f["rt"]}.{f["rc"]}` ({f["cn"]})')
    w()

    # ── ⑦ 이관 후 검증용 기준값 ───────────────────────────────
    w('## ⑦ 이관 검증 기준값 (SRC 스냅샷)')
    w()
    w('이관 후 대상 DB에서 같은 값이 나와야 한다.')
    w()
    w('| 테이블 | 행수 | AUTO_INCREMENT |')
    w('|---|---:|---:|')
    for tn in sorted(src_t):
        w(f'| `{tn}` | {exact_count(SRC, tn)} | {src_t[tn]["ai"]} |')
    w()

    # ── ⑧ 공통코드 1600대 공실 확인 (Phase 1 선확인 항목) ─────
    w('## ⑧ 공통코드 부모 코드 사용 현황 (Phase 1 선확인)')
    w()
    for schema in (SRC, DST):
        try:
            cur.execute(
                f"SELECT DISTINCT parent_common_code_sq p FROM `{schema}`.TBL_COMMON_CODE_C "
                f"WHERE parent_common_code_sq IS NOT NULL ORDER BY p")
            used = [str(r['p']) for r in cur.fetchall()]
            w(f'- `{schema}` 사용 중인 부모코드: {", ".join(used) if used else "(없음)"}')
        except Exception as e:
            w(f'- `{schema}`: 조회 실패 ({e.__class__.__name__}: {e})')
    w()
    w('→ 게시판 카테고리에 쓰려는 **1600대**가 비어 있는지 확인. 쓰이고 있으면 1700대로 이동.')
    w()

    # ── ⑨ 닉네임 백필 사전 점검 (Phase 1) ─────────────────────
    w('## ⑨ 닉네임 백필 사전 점검 (Phase 1)')
    w()
    try:
        cur.execute(f"SELECT COUNT(*) c FROM `{SRC}`.TBL_USER_M")
        total = cur.fetchone()['c']
        cur.execute(f"SELECT COUNT(DISTINCT user_id) c FROM `{SRC}`.TBL_USER_M")
        uniq = cur.fetchone()['c']
        cur.execute(f"SELECT MAX(CHAR_LENGTH(user_id)) m FROM `{SRC}`.TBL_USER_M")
        maxlen = cur.fetchone()['m']
        w(f'- 전체 회원: {total}명 / user_id 고유값: {uniq}개 → '
          f'{"중복 없음, 백필 안전" if total == uniq else "**user_id 중복 존재 → 접미사 처리 필요**"}')
        w(f'- user_id 최대 길이: {maxlen}자 → 닉네임 컬럼 VARCHAR(20)로 충분한지 확인')
        cur.execute(
            f"SELECT column_name cn FROM information_schema.columns "
            f"WHERE table_schema=%s AND table_name='TBL_USER_M' AND column_name LIKE '%%nick%%'", (SRC,))
        nick = cur.fetchall()
        w(f'- 기존 닉네임 컬럼: {"없음 (신규 추가 필요)" if not nick else nick}')
    except Exception as e:
        w(f'- 조회 실패 ({e.__class__.__name__}: {e})')
    w()

    conn.close()
    _flush()


def _flush():
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f'\n=== 결과 저장: {OUT} ===')


if __name__ == '__main__':
    main()
