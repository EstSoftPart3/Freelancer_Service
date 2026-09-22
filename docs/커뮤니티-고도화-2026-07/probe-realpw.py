# -*- coding: utf-8 -*-
"""
실제 비밀번호로 로그인 원인 확정 진단.
  (1) DB에 저장된 bcrypt 해시를 읽어 실제 비밀번호와 직접 대조(checkpw)
  (2) 백엔드 /api/login 에 실제 비밀번호로 POST 하여 응답 확인
비밀번호는 아래 REAL_PW 변수에만 들어가며 외부로 전송되는 곳은 로컬 백엔드뿐.

사용법:
  1) REAL_PW 를 지금 로그인창에 입력하는 '그 비밀번호' 그대로 붙여넣기
  2) !python "C:/dev/Freelancer_Service/docs/probe-realpw.py"
"""
import os
import json
import urllib.request
import urllib.error
import pymysql

USER_ID = 'qkdnf325'
REAL_PW = ''   # ← 실제 로그인에 쓰는 비밀번호를 그대로 입력 (따옴표 사이)

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_education', charset='utf8mb4', autocommit=True,
)

print(f'입력한 비밀번호 길이: {len(REAL_PW)}  (앞뒤 공백 포함 여부 확인용)')
print(f'repr: {REAL_PW!r}\n')

# (1) 저장 해시와 직접 대조
conn = pymysql.connect(**DB)
with conn.cursor(pymysql.cursors.DictCursor) as cur:
    cur.execute("SELECT user_pw, user_type_cd FROM TBL_USER_M WHERE user_id=%s", (USER_ID,))
    row = cur.fetchone()
conn.close()

stored = row['user_pw'] if row else None
print(f'저장 해시: {stored}')
print(f'회원유형: {row["user_type_cd"] if row else "N/A"} (301=개인)\n')

try:
    import bcrypt
    if stored:
        ok = bcrypt.checkpw(REAL_PW.encode('utf-8'), stored.encode('utf-8'))
        print(f'[해시 직접 대조] 실제 비밀번호 == 저장 해시 ? => {"일치(로그인 되어야 정상)" if ok else "불일치(해시가 이 비번이 아님)"}')
except ImportError:
    print('[해시 직접 대조] bcrypt 미설치라 생략 (pip install bcrypt 하면 가능)')

# (2) 백엔드에 실제 비밀번호로 POST
def post(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='POST',
                                 headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, resp.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')
    except Exception as e:
        return 'ERR', repr(e)

for url in ('http://localhost:8080/api/login', 'http://localhost:3000/api/login'):
    status, body = post(url, {'userId': USER_ID, 'userPw': REAL_PW,
                              'userTypeCd': 301, 'autoLogin': False})
    print(f'\n[POST {url}] status={status}')
    print(f'   body={body}')
