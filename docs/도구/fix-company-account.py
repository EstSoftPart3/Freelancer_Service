# -*- coding: utf-8 -*-
"""
기업 계정 estsw_admin 의 빠진 정보를 채운다 — 주소 + 사업자정보.

  드라이런(기본): python "C:/dev/Freelancer_Service/docs/도구/fix-company-account.py"
  실제 실행     : !python "C:/dev/Freelancer_Service/docs/도구/fix-company-account.py" --apply

무엇을 왜 채우는가

  ① 주소 (TBL_ADDRESS_S + TBL_USER_M.address_sq + TBL_COMPANY_S.address_sq)
     `convert-estsw-admin-to-company.py` 가 admin 을 템플릿으로 복제하면서 address_sq 를
     NULL 그대로 물려받았다. 정상 가입 경로(UserService.signup)는 주소를 먼저 INSERT 하고
     그 키를 회원·회사 양쪽에 넣는다.
     🔴 없으면 `GET /mypage/edit/affiliation/info` 가 500 이다 —
        InformationEditService.getAffiliationInfo 가 넘긴 address 가 null 이라
        AffiliationInfoResponseDTO.of 의 address.getZonecode() 에서 NPE.
        → 소속 정보 수정 페이지 진입 불가.

  ② 사업자번호 (TBL_COMPANY_S.company_biz_num)
     company_auth_status_cd 만 2502(인증완료)로 올리고 사업자번호는 비워 둔 상태였다.
     정상 인증 플로우(verify-enterprise)는 둘을 같이 채운다.
     🔴 없으면 `ProjectService.findUserRole:749` 의
        `ownedCompanyBizNum.equals(...)` 가 NPE 다 → 로그인한 기업 계정이
        공고 상세를 열면 500. 즉 **자기가 올린 공고를 자기가 못 연다.**

🔴 여기 들어가는 값은 전부 **임시값**이다 (사용자 확정: 2026-08-26).
   오픈 전에 실제 값으로 바꿀 것. 주소는 FO 마이페이지 > 소속 정보 수정에서
   주소 검색(다음 우편번호)으로 직접 고칠 수 있다.

주의: DB 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import os
import sys

try:
    import pymysql
except ImportError:
    raise SystemExit('pymysql 미설치. 먼저 실행: pip install pymysql')

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DB = dict(host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
          database='freelancer_project', charset='utf8mb4', autocommit=False)

TARGET_USER_ID = 'estsw_admin'

# ── 임시 주소 ──────────────────────────────────────────────────────────────
# sigungu · latitude · longitude · area_code_sq 는 NOT NULL 이라 반드시 값이 있어야 한다.
# area_code_sq 11650 = 서초구 (TBL_AREA_C 실측, parent 11000 서울특별시)
ADDRESS = dict(
    zonecode=6615,                  # 🔴 컬럼이 bigint 라 앞자리 0 이 사라진다(실제는 06615)
    address='서울특별시 서초구',
    detail_address='(임시 주소 — 마이페이지 > 소속 정보 수정에서 변경할 것)',
    sigungu='서초구',
    latitude='37.4837000',          # 서초구 중심 근사
    longitude='127.0324000',
    area_code_sq=11650,
)

# ── 임시 사업자정보 ────────────────────────────────────────────────────────
# 000-00-00000 은 형식만 맞춘 명백한 자리표시자다. 실제 번호가 아니다.
COMPANY = dict(
    company_biz_num='000-00-00000',
    company_ceo_nm='(임시)',
    company_open_dt='2026-08-26',
)


def row(cur, sql, args=()):
    cur.execute(sql, args)
    return cur.fetchone()


def report(cur, label):
    r = row(cur, """
        SELECT u.user_sq, u.address_sq AS user_address_sq,
               c.company_sq, c.address_sq AS company_address_sq,
               c.company_nm, c.company_biz_num, c.company_ceo_nm,
               c.company_open_dt, c.company_auth_status_cd,
               a.zonecode, a.address, a.detail_address, a.sigungu,
               a.latitude, a.longitude, a.area_code_sq
          FROM TBL_USER_M u
          LEFT JOIN TBL_COMPANY_S c ON c.user_sq = u.user_sq
          LEFT JOIN TBL_ADDRESS_S a ON a.address_sq = c.address_sq
         WHERE u.user_id = %s
    """, (TARGET_USER_ID,))
    print()
    print(f'  ── {label}')
    if not r:
        print('     🔴 계정이 없다')
        return None
    cols = [d[0] for d in cur.description]
    for c, v in zip(cols, r):
        print(f'     {c:22s} = {v}')
    return dict(zip(cols, r))


def main():
    apply = '--apply' in sys.argv

    print('=' * 72)
    print('기업 계정 estsw_admin — 주소·사업자정보 보완')
    print(f'대상 DB: {DB["host"]}/{DB["database"]}')
    print(f'모드   : {"🔴 실제 반영(--apply)" if apply else "드라이런 — 끝에 ROLLBACK 한다"}')
    print('=' * 72)

    conn = pymysql.connect(**DB)
    cur = conn.cursor()
    try:
        print()
        print('── 현재 상태')
        before = report(cur, '보완 전')
        if not before:
            conn.rollback()
            return 1
        if before['company_sq'] is None:
            print()
            print('  🔴 TBL_COMPANY_S 행이 없다. convert-estsw-admin-to-company.py --apply 를 먼저 돌릴 것.')
            conn.rollback()
            return 1

        user_sq = before['user_sq']
        company_sq = before['company_sq']

        print()
        print('── 실행')

        # ① 주소. 이미 있으면 새로 만들지 않고 그 행을 갱신한다(중복 방지).
        addr_sq = before['company_address_sq']
        if addr_sq is None:
            cur.execute("""
                INSERT INTO TBL_ADDRESS_S
                  (zonecode, address, detail_address, sigungu, latitude, longitude, area_code_sq)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (ADDRESS['zonecode'], ADDRESS['address'], ADDRESS['detail_address'],
                  ADDRESS['sigungu'], ADDRESS['latitude'], ADDRESS['longitude'],
                  ADDRESS['area_code_sq']))
            addr_sq = cur.lastrowid
            print(f'  TBL_ADDRESS_S  생성 address_sq={addr_sq} ({ADDRESS["address"]})')
        else:
            print(f'  TBL_ADDRESS_S  이미 있다 address_sq={addr_sq} — 새로 만들지 않는다')

        # ② 회원·회사 양쪽에 연결. 정상 가입 경로가 하는 것과 같다.
        cur.execute('UPDATE TBL_USER_M SET address_sq = %s WHERE user_sq = %s', (addr_sq, user_sq))
        print(f'  TBL_USER_M     address_sq 연결 {cur.rowcount}행')

        cur.execute("""
            UPDATE TBL_COMPANY_S
               SET address_sq = %s, company_biz_num = %s,
                   company_ceo_nm = %s, company_open_dt = %s
             WHERE company_sq = %s
        """, (addr_sq, COMPANY['company_biz_num'], COMPANY['company_ceo_nm'],
              COMPANY['company_open_dt'], company_sq))
        print(f'  TBL_COMPANY_S  주소·사업자정보 갱신 {cur.rowcount}행')

        after = report(cur, '보완 후')

        problems = []
        if after['user_address_sq'] is None:
            problems.append('TBL_USER_M.address_sq 가 여전히 NULL')
        if after['company_address_sq'] is None:
            problems.append('TBL_COMPANY_S.address_sq 가 여전히 NULL')
        if after['zonecode'] is None:
            problems.append('주소 조인이 안 된다 — TBL_ADDRESS_S 행을 못 찾는다')
        if not after['company_biz_num']:
            problems.append('company_biz_num 이 비어 있다 — 공고 상세에서 NPE 가 난다')
        if after['company_auth_status_cd'] != 2502:
            problems.append('company_auth_status_cd 가 2502 가 아니다 — 공고 등록이 막힌다')

        if problems:
            print()
            for p in problems:
                print(f'  🔴 {p}')
            conn.rollback()
            print()
            print('검증 실패 — 롤백했다.')
            return 1

        print()
        if apply:
            conn.commit()
            print('✅ 커밋했다.')
            print()
            print('  다음 확인 (로그인 토큰 필요):')
            print('    GET /api/mypage/edit/affiliation/info  → 200 이어야 한다')
        else:
            conn.rollback()
            print('드라이런이라 롤백했다. 실제로 반영하려면 --apply 를 붙일 것.')
        return 0
    except Exception as e:
        conn.rollback()
        print()
        print(f'🔴 실패 — 전량 롤백했다: {e}')
        return 1
    finally:
        conn.close()
        print('=' * 72)


if __name__ == '__main__':
    raise SystemExit(main())
