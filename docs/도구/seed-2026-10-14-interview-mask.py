# -*- coding: utf-8 -*-
"""
2026-10-14 회의 피드백 3번 — 시드(봇 작성) 면접후기의 회사명 DB 값을 마스킹한다.

  드라이런(기본) : !python "docs/도구/seed-2026-10-14-interview-mask.py" [--prod]
  적용           : !python "docs/도구/seed-2026-10-14-interview-mask.py" [--prod] --apply

대상은 작성자가 봇 계정(user_id LIKE 'bot\\_%')인 행뿐이다 — 사람이 쓴 후기는 입력한 그대로 둔다.
규칙: 2글자는 뒤 글자, 3글자 이상은 가운데 한 글자(인덱스 len//2)만 '*'. 같은 자리를 다시 가리므로 여러 번 돌려도 같다.
  카카오→카*오, KT→K*, 네이버웹툰→네이*웹툰, LG CNS→LG *NS
되돌리기(운영): python docs/도구/apply-sql-prod.py docs/도구/2026-09-28-interview-real-names.sql
"""
import importlib.util
import os
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

APPLY = '--apply' in sys.argv


def mask(name: str) -> str:
    if len(name) < 2:
        return name
    i = len(name) // 2
    return name[:i] + '*' + name[i + 1:]


assert [mask(s) for s in ['카카오', 'KT', '네이버웹툰', 'LG CNS', '카*오', '가']] == \
    ['카*오', 'K*', '네이*웹툰', 'LG *NS', '카*오', '가']


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    cur.execute("SELECT r.interview_review_sq, r.company_nm FROM tbl_interview_review_m r "
                "JOIN tbl_user_m u ON u.user_sq = r.user_sq WHERE u.user_id LIKE 'bot\\_%%' ORDER BY 1")
    changes = [(sq, nm, mask(nm)) for sq, nm in cur.fetchall() if mask(nm) != nm]
    for sq, old, new in changes:
        print(f'  {sq:>4}  {old} → {new}')
    print(f'바꿀 행 {len(changes)}건 ({schema})')
    if not APPLY:
        print('\n드라이런이라 아무것도 바꾸지 않았다. 적용하려면 --apply.')
        return
    cur.executemany('UPDATE tbl_interview_review_m SET company_nm=%s WHERE interview_review_sq=%s',
                    [(new, sq) for sq, _, new in changes])
    conn.commit()
    print('적용 완료.')


if __name__ == '__main__':
    main()
