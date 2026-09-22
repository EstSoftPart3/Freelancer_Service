# -*- coding: utf-8 -*-
"""
테스트 계정 비밀번호 재설정 스크립트 (bcrypt $2a$, Spring BCryptPasswordEncoder 호환).

사용법:
  1) 아래 NEW_PW 를 원하는 비밀번호로 수정
  2) !python "C:/dev/Freelancer_Service/docs/reset-password.py"

주의: 실제 계정의 비밀번호를 변경합니다. 대상은 아래 USER_ID 한 명만.
"""
import os
import pymysql

USER_ID = 'qkdnf325'
NEW_PW = 'test1234!'   # ← 원하는 새 비밀번호로 바꾸세요

try:
    import bcrypt
except ImportError:
    raise SystemExit("bcrypt 미설치. 먼저 실행: pip install bcrypt")

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_education', charset='utf8mb4', autocommit=False,
)

# Spring Security BCryptPasswordEncoder 는 $2a$ 해시를 검증한다. prefix를 2a로 고정.
hashed = bcrypt.hashpw(NEW_PW.encode('utf-8'), bcrypt.gensalt(prefix=b'2a')).decode('utf-8')
print(f'생성된 해시: {hashed}')

conn = pymysql.connect(**DB)
try:
    with conn.cursor() as cur:
        n = cur.execute("UPDATE TBL_USER_M SET user_pw = %s WHERE user_id = %s AND user_is_deleted_yn = 'N'",
                        (hashed, USER_ID))
    conn.commit()
    print(f'UPDATE 완료: {n}건  (user_id={USER_ID})')
    print(f'이제 개인회원 탭에서  아이디: {USER_ID} / 비밀번호: {NEW_PW}  로 로그인하세요.')

    # 검증: 방금 저장한 해시가 새 비밀번호와 매칭되는지 확인
    ok = bcrypt.checkpw(NEW_PW.encode('utf-8'), hashed.encode('utf-8'))
    print(f'해시 검증: {"OK" if ok else "실패"}')
except Exception as e:
    conn.rollback()
    print('[ROLLBACK]', e)
    raise
finally:
    conn.close()
