# -*- coding: utf-8 -*-
"""
서버 업로드 디렉터리의 고아 파일 판정 (P6-5 준비, 읽기 전용)

  !python "C:/dev/Freelancer_Service/docs/도구/check-orphan-uploads.py"

무엇을 하는가
  DB 가 아직 참조하고 있는 업로드 파일명을 전부 모아 판정한다.
  **DB 만 읽는다. 아무것도 지우지 않고, 서버에 접속하지도 않는다.**

  - 참조가 0건이면  → 서버 uploads 안의 파일이 **전부 고아**라는 뜻이다. 통째로 비우면 된다.
  - 참조가 있으면   → 그 파일명 목록을 `docs/오픈-준비-2026-08/keep-files.txt` 로 내보낸다.
                      서버에서 이 목록에 없는 것만 지우면 된다.

🔴 **지우기 직전에 반드시 다시 돌릴 것.**
  P6-1 초기화 직후에는 참조가 0건이지만, 그 뒤에 누군가
  프로젝트 공고(이미지 포함)나 이력서를 올리면 참조가 생긴다.
  "전에 0건이었으니 다 지워도 된다" 로 진행하면 방금 올린 파일이 날아간다.

파일이 어떻게 연결돼 있나
  실제 파일명은 `TBL_COMMON_FILE_S.file_save_nm` 하나에만 있고,
  나머지 테이블은 `file_sq` 로 그것을 가리킨다. 그래서 참조 여부는
  "common_file 에 살아 있는 행이 있는가" 로 판정된다.

주의: DB 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import os
import sys

import pymysql

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          database='freelancer_project', charset='utf8mb4')

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   '오픈-준비-2026-08', 'keep-files.txt')

UPLOAD_DIR = '/DATA/freelancer_project/uploads'
SSH = 'estsoft@192.168.2.104'

# file_sq 로 TBL_COMMON_FILE_S 를 가리키는 테이블들
REF_TABLES = [
    'TBL_BOARD_ATTACHMENT_S',
    'TBL_BOARD_ANSWER_ATTACHMENT_S',
    'TBL_RESUME_ATTACHMENT_S',
    'TBL_USER_PROFILE_IMAGE_S',
    'TBL_COMPANY_PROFILE_IMAGE_S',
    'TBL_RESUME_PROFILE_IMAGE_S',
]


def main():
    print('=' * 72)
    print('업로드 고아 파일 판정 (읽기 전용)')
    print(f"대상 DB: {DB['host']}/{DB['database']}")
    print('=' * 72)

    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    cur.execute('SELECT COUNT(*) FROM TBL_COMMON_FILE_S')
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM TBL_COMMON_FILE_S WHERE file_is_deleted_yn = 'N'")
    alive = cur.fetchone()[0]
    print(f'\n[TBL_COMMON_FILE_S] 전체 {total}행 · 살아있는 것 {alive}행')

    print('\n[참조 테이블]')
    ref_total = 0
    for t in REF_TABLES:
        cur.execute(f'SELECT COUNT(*) FROM `{t}`')
        n = cur.fetchone()[0]
        ref_total += n
        print(f'  {t:36s} {n:>6}행')

    # 실제로 보존해야 할 파일명
    cur.execute("SELECT file_save_nm FROM TBL_COMMON_FILE_S "
                "WHERE file_save_nm IS NOT NULL AND file_save_nm <> ''")
    keep = sorted({r[0] for r in cur.fetchall()})
    conn.close()

    print('\n' + '=' * 72)
    if not keep:
        print('판정 — 참조 0건. 서버 uploads 안의 파일은 **전부 고아**다.')
        print()
        print('🔴 지우기 직전에 이 스크립트를 다시 돌려 0건인지 확인할 것.')
        print('   그사이 공고·이력서가 등록되면 참조가 생긴다.')
        print()
        print('서버에서 (내부망):')
        print(f'  ssh {SSH}')
        print(f'  du -sh {UPLOAD_DIR}; ls -1 {UPLOAD_DIR} | wc -l   # 먼저 규모 확인')
        print(f'  tar czf ~/uploads-before-purge.tgz -C {UPLOAD_DIR} .   # 되돌릴 여지를 남긴다')
        print(f'  find {UPLOAD_DIR} -type f -delete')
        print(f'  ls -1 {UPLOAD_DIR} | wc -l                        # 0 이어야 정상')
        return

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(keep) + '\n')
    print(f'판정 — 보존해야 할 파일 {len(keep)}건. 목록을 내보냈다:')
    print(f'  {OUT}')
    print()
    print('서버에서 (내부망) — 목록에 없는 것만 지운다:')
    print(f'  scp "{OUT}" {SSH}:/tmp/keep-files.txt')
    print(f'  ssh {SSH}')
    print(f'  tar czf ~/uploads-before-purge.tgz -C {UPLOAD_DIR} .')
    print(f'  cd {UPLOAD_DIR}')
    print('  ls -1 > /tmp/all-files.txt')
    print('  grep -vxF -f /tmp/keep-files.txt /tmp/all-files.txt > /tmp/orphans.txt')
    print('  wc -l /tmp/orphans.txt          # 지울 개수 확인 후')
    print('  xargs -a /tmp/orphans.txt -d "\\n" rm -f --')


if __name__ == '__main__':
    main()
