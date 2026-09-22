# -*- coding: utf-8 -*-
"""
지하철역만으로 공고를 등록하는 경로(address_type_cd 2702) 검증.

  드라이런(기본): !python "C:/dev/Freelancer_Service/docs/도구/verify-subway-only-project.py"
  실제 실행      : !python "C:/dev/Freelancer_Service/docs/도구/verify-subway-only-project.py" --run
  남은 찌꺼기 정리: !python "C:/dev/Freelancer_Service/docs/도구/verify-subway-only-project.py" --cleanup

왜 필요한가
  운영의 공고는 address_type_cd 가 전부 2701(상세 주소)이다. 지하철역만 넣고 등록한
  공고는 아직 0건이라, 그 경로가 실사용으로 검증된 적이 없다(2026-09-07 확인).

무엇을 하는가 (--run)
  ① estsw_admin 으로 로그인
  ② /projects/forms 에서 유효한 등급·학력·근무형태·직군·기술 값을 그대로 가져온다
  ③ 지하철역 필드만 채워 공고를 등록한다. 상세 주소는 비운다
     🔴 isNotification 은 'N' 고정 — 즐겨찾기 알림이 실제 사용자에게 나가면 안 된다
  ④ 검증
       · 등록된 공고의 address_type_cd 가 2702 인지
       · 지역 검색(중구가 속한 서울 11000)에 잡히는지
       · 목록 건수와 totalCount 가 일치하는지 (countProjectsBySearch 수정 확인)
  ⑤ 등록한 공고를 삭제하고 사라졌는지 확인한다

  실패해도 ⑤는 최대한 수행한다. 그래도 남으면 --cleanup 으로 지운다.

주의
  실서버(job.estsw.co.kr)에 실제로 공고를 만들었다 지운다. 삭제는 소프트 삭제
  (project_is_deleted_yn='Y')다. 브라우저에서 도는 카카오 좌표→시군구 변환은
  이 스크립트로 검증되지 않는다 — 그건 브라우저로만 확인할 수 있다.
"""
import os
import json
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

BASE = 'https://job.estsw.co.kr/api'
USER = {'userId': 'estsw_admin', 'userPw': os.environ['FREELANCER_CORP_PW'], 'userTypeCd': 302, 'autoLogin': False}

TITLE = '[검증용-삭제예정] 지하철역만 등록 경로 확인'
# 을지로입구역 — 서울 중구(11140). 기존 운영 데이터에 있는 좌표를 그대로 쓴다.
SUBWAY = {
    'name': '을지로입구역 2호선',
    'lat': 37.5660355,
    'lon': 126.9821953,
    'sigunguCode': '11140',
}
SEOUL = 11000

RUN = '--run' in sys.argv
CLEANUP = '--cleanup' in sys.argv


def call(method, path, token=None, body=None, params=''):
    url = f'{BASE}{path}{params}'
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Content-Type', 'application/json')
    # Cloudflare 가 파이썬 기본 User-Agent 를 막는다(error code 1010). 브라우저처럼 보내야 통과한다.
    req.add_header('User-Agent',
                   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                   '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36')
    req.add_header('Accept', 'application/json')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode() or '{}')
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {'raw': raw[:500]}


def ok(msg):
    print(f'   ✅ {msg}')


def bad(msg):
    print(f'   ❌ {msg}')


def login():
    st, r = call('POST', '/login', body=USER)
    if st != 200:
        raise SystemExit(f'로그인 실패({st}): {r}')
    return r['output']['accessToken']


def first_name(items):
    """폼 옵션에서 이름 문자열 하나를 꺼낸다. 응답 모양이 달라도 견디게 한다."""
    if not items:
        return None
    x = items[0]
    if isinstance(x, str):
        return x
    for k in ('commonCodeNm', 'name', 'areaName', 'skillTagNm', 'codeNm', 'label'):
        if isinstance(x, dict) and x.get(k):
            return x[k]
    if isinstance(x, dict):
        for v in x.values():
            if isinstance(v, str):
                return v
    return None


def pick_skill(skills):
    """실제 기술 하나를 고른다.

    skills 는 [{parentSkillTagNm: 'Language', childSkillTagNms: ['Java', ...]}, ...] 구조다.
    부모(분류 헤더)를 그대로 쓰면 안 되고 자식에서 골라야 한다.
    """
    leaves = []
    for g in (skills or []):
        if isinstance(g, dict):
            leaves += [c for c in (g.get('childSkillTagNms') or []) if isinstance(c, str)]
        elif isinstance(g, str):
            leaves.append(g)
    for want in ('Java', 'Python', 'JavaScript'):
        if want in leaves:
            return want
    return leaves[0] if leaves else None


def build_payload(forms):
    # devGradeGroups 는 [{major: '초급', details: ['초초', ...]}, ...] 구조다.
    # 대분류(major)를 그대로 쓴다 — 화면 필터도 대분류만 보여준다.
    groups = forms.get('devGradeGroups') or []
    grade = (groups[0] or {}).get('major') if groups and isinstance(groups[0], dict) \
        else first_name(groups)
    today = date.today()
    return {
        'projectId': 0,
        'projectTitle': TITLE,
        'projectSalary': 0,
        'projectSalaryNegotiableYn': 'Y',
        'projectImageUrl': '',
        # 상세 주소는 비운다 — 이게 이 검증의 핵심이다
        'detailedAddressName': '',
        'detailedAddressDetail': '',
        'subwayAddressName': SUBWAY['name'],
        'subwayLat': SUBWAY['lat'],
        'subwayLon': SUBWAY['lon'],
        'subwaySigunguCode': SUBWAY['sigunguCode'],
        'devGrade': grade,
        'recruitHeadcounts': [{'grade': grade, 'count': 1}],
        'educationLvl': first_name(forms.get('educationLevels')),
        'projectStartDt': str(today + timedelta(days=7)),
        'projectEndDt': str(today + timedelta(days=60)),
        'recruitStartDt': str(today),
        'recruitEndDt': str(today + timedelta(days=14)),
        'workType': [first_name(forms.get('workTypes'))],
        'recruitJob': [first_name(forms.get('recruitJobs'))],
        'usingSkills': [pick_skill(forms.get('skills'))],
        'preferSkills': [],
        'preference': '',
        'description': '검증용 공고입니다. 자동 삭제됩니다.',
        'interviewTime': [(datetime.now() + timedelta(days=3)).strftime('%Y-%m-%dT10:00:00')],
        'isNotification': 'N',      # 🔴 절대 'Y' 로 바꾸지 말 것
    }


def find_mine(token):
    """제목으로 검증용 공고를 찾는다."""
    st, r = call('GET', '/projects', token, params='?size=100&offset=0')
    if st != 200:
        return []
    items = (r.get('output') or {}).get('projects') or []
    return [p for p in items if TITLE in (p.get('projectTtl') or '')]


def cleanup(token):
    found = find_mine(token)
    if not found:
        print('   정리할 검증용 공고가 없다.')
        return
    for p in found:
        sq = p['projectSq']
        st, r = call('DELETE', f'/projects/{sq}', token)
        print(f'   삭제 sq={sq} -> {st} {r.get("message", "")}')


def main():
    token = login()
    ok('로그인 성공')

    if CLEANUP:
        print('\n=== 정리 모드 ===')
        cleanup(token)
        return

    st, r = call('GET', '/projects/forms', token)
    if st != 200:
        raise SystemExit(f'폼 조회 실패({st}): {r}')
    payload = build_payload(r['output'])

    print('\n=== 등록할 내용 ===')
    for k in ('projectTitle', 'subwayAddressName', 'subwaySigunguCode', 'devGrade',
              'educationLvl', 'workType', 'recruitJob', 'usingSkills', 'isNotification'):
        print(f'   {k}: {payload[k]}')
    print(f'   detailedAddressName: {payload["detailedAddressName"]!r}  ← 비어 있어야 한다')

    missing = [k for k in ('devGrade', 'educationLvl') if not payload.get(k)]
    if missing or not all(payload[k][0] for k in ('workType', 'recruitJob', 'usingSkills')):
        raise SystemExit(f'폼 옵션을 못 읽었다: {missing}. 응답 구조를 확인할 것.')

    if not RUN:
        print('\n드라이런이라 아무것도 만들지 않았다. 실제로 실행하려면 --run 을 붙일 것.')
        return

    print('\n=== ③ 등록 ===')
    st, r = call('POST', '/projects', token, body=payload)
    if st not in (200, 201):
        bad(f'등록 실패({st}): {json.dumps(r, ensure_ascii=False)[:600]}')
        raise SystemExit(1)
    ok(f'등록 성공 ({st}) {r.get("message", "")}')

    found = find_mine(token)
    if not found:
        bad('등록은 됐다는데 목록에서 못 찾았다. 수동 확인이 필요하다.')
        raise SystemExit(1)
    sq = found[0]['projectSq']
    ok(f'공고 sq={sq}')

    try:
        print('\n=== ④ 검증 ===')
        st, d = call('GET', f'/projects/{sq}/details', token)
        out = (d.get('output') or {}) if st == 200 else {}
        atc = out.get('addressTypeCd') or out.get('address_type_cd')
        (ok if str(atc) == '2702' else bad)(f'address_type_cd = {atc} (2702 여야 정상)')
        print(f'      주소 표기: {out.get("address") or out.get("subwayAddress")}')

        st, s = call('GET', '/projects', token, params=f'?addressCodeSq={SEOUL}&size=100&offset=0')
        o = (s.get('output') or {})
        total, items = o.get('totalCount'), (o.get('projects') or [])
        hit = any(p.get('projectSq') == sq for p in items)
        (ok if hit else bad)(f'지역 검색(서울 {SEOUL})에서 발견: {hit}')
        (ok if total == len(items) else bad)(f'totalCount={total}, 목록={len(items)} — 일치해야 정상')
    finally:
        print('\n=== ⑤ 삭제 ===')
        st, r = call('DELETE', f'/projects/{sq}', token)
        (ok if st == 200 else bad)(f'삭제 응답 {st} {r.get("message", "")}')
        left = find_mine(token)
        (ok if not left else bad)(f'남은 검증용 공고: {len(left)}건 (0 이어야 정상)')
        if left:
            print('      --cleanup 으로 다시 지울 것.')


if __name__ == '__main__':
    main()
