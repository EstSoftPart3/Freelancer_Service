# -*- coding: utf-8 -*-
"""
로그인 400 응답 본문(message) 확인용 프로브.
비밀번호 없이 더미값으로 요청 → 백엔드가 주는 정확한 사유 메시지를 출력한다.
검증 순서: 존재 → 탈퇴 → 비활성 → 회원유형 → 비밀번호 이므로,
  - "회원 유형이 일치하지 않습니다" 가 나오면 탭(유형) 문제
  - "비밀번호가 올바르지 않습니다" 가 나오면 계정/유형은 정상, 비번만 문제
  - 그 외 메시지면 별도 원인

사용법: !python "C:/dev/Freelancer_Service/docs/probe-login.py"
"""
import json
import urllib.request
import urllib.error

USER_ID = 'qkdnf325'
TARGETS = [
    ('백엔드 직접 8080', 'http://localhost:8080/api/login'),
    ('Next 프록시 3000', 'http://localhost:3000/api/login'),
]


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


for label, url in TARGETS:
    print(f'\n================ {label} : {url} ================')
    for tc in (301, 302):
        status, body = post(url, {'userId': USER_ID, 'userPw': '___probe_dummy___',
                                   'userTypeCd': tc, 'autoLogin': False})
        tc_label = {301: '개인', 302: '기업'}[tc]
        print(f'[userTypeCd={tc}({tc_label})] status={status}')
        print(f'   body={body}')
