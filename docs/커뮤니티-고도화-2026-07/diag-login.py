# -*- coding: utf-8 -*-
"""
로그인 실패(400) 원인 진단 스크립트.
사용법(사용자 세션에서 직접 실행):
    !python "C:/dev/Freelancer_Service/docs/diag-login.py"
"""
import os
import pymysql

USER_ID = 'qkdnf325'   # 진단 대상 아이디

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_education', charset='utf8mb4', autocommit=True,
)

conn = pymysql.connect(**DB)
with conn.cursor(pymysql.cursors.DictCursor) as cur:
    cur.execute(
        "SELECT user_sq, user_id, user_nm, user_type_cd, "
        "user_is_deleted_yn, user_is_activate_yn, "
        "CASE WHEN user_pw IS NULL OR user_pw='' THEN 'EMPTY' ELSE CONCAT('len=', CHAR_LENGTH(user_pw)) END AS pw_state, "
        "LEFT(user_pw, 4) AS pw_prefix "
        "FROM TBL_USER_M WHERE user_id = %s",
        (USER_ID,),
    )
    rows = cur.fetchall()

print(f'=== user_id = {USER_ID} 조회 결과: {len(rows)}건 ===')
if not rows:
    print('-> 존재하지 않는 사용자입니다. (아이디 오타이거나 계정 없음)')
for r in rows:
    print(r)
    tc = r['user_type_cd']
    tc_label = {301: '개인(PERSONAL)', 302: '기업(COMPANY)'}.get(tc, f'기타({tc})')
    print(f"  · 회원유형: {tc} = {tc_label}  → 로그인 시 이 탭을 선택해야 함")
    print(f"  · 탈퇴여부(user_is_deleted_yn): {r['user_is_deleted_yn']}  (Y면 '탈퇴한 사용자')")
    print(f"  · 활성여부(user_is_activate_yn): {r['user_is_activate_yn']}  (N면 '비활성화된 사용자')")
    print(f"  · 비밀번호 저장상태: {r['pw_state']} prefix={r['pw_prefix']}  ($2 로 시작하면 bcrypt 정상)")

conn.close()
