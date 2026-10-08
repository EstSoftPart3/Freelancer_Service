# -*- coding: utf-8 -*-
"""2026-10-08 운영 기업·팀업 게시판 데모 글 11건(시연 준비, 사용자 승인). 실행 전 db-backup.py(20261008-1256).
  드라이런: !python "docs/도구/seed-2026-10-08-company-teamup.py"
  회수    : !python "docs/도구/seed-2026-10-08-company-teamup.py" --revoke --apply
 기본 드라이런 / --apply 등록 / --revoke 회수(소프트삭제).
봇 계정이 일반 글쓰기 API 로 작성한다. 등록한 sq 는 seed-2026-10-08-company-teamup.done.json 에 남긴다."""
import json, os, random, re, sys, html
import requests

API = 'https://job.estsw.co.kr/api'
HERE = os.path.dirname(os.path.abspath(__file__))
DONE = os.path.join(HERE, 'seed-2026-10-08-company-teamup.done.json')
SECRET = r'C:/dev/Freelancer_Service/docs/시크릿.md'
BOT_PW = os.environ.get('FREELANCER_BOT_PW') or re.search(r'setx FREELANCER_BOT_PW "([^"]*)"', open(SECRET, encoding='utf-8').read()).group(1)
posts = json.load(open(os.path.join(HERE, 'seed-2026-10-08-company-teamup.json'), encoding='utf-8'))
rnd = random.Random(20261008)
bots = rnd.sample([f'bot_{i:02d}' for i in range(1, 101)], len(posts))

def login(uid):
    r = requests.post(f'{API}/login', json={'userId': uid, 'userPw': BOT_PW, 'userTypeCd': 301, 'autoLogin': False}, timeout=20)
    r.raise_for_status(); return r.json()['output']['accessToken']

def to_html(paras):
    return ''.join('<p>' + '<br>'.join(html.escape(l) for l in p.split('\n')) + '</p>' for p in paras)

if '--revoke' in sys.argv:
    done = json.load(open(DONE, encoding='utf-8'))
    for d in done:
        print('회수', d)
        if '--apply' in sys.argv:
            t = login(d['bot'])
            r = requests.patch(f"{API}/{d['board']}/{d['sq']}", headers={'Authorization': f'Bearer {t}'}, timeout=20)
            print('  ', r.status_code, r.text[:100])
    sys.exit()

done = []
for p, bot in zip(posts, bots):
    print(f"{p['board']:8} {p.get('category','-')} {bot}  {p['title']}")
    if '--apply' not in sys.argv: continue
    t = login(bot)
    data = {'ttl': p['title'], 'description': to_html(p['body']), 'normalTags': '', 'skillTagsJson': '[]', 'attachments': ''}
    if 'category' in p: data['categoryCd'] = str(p['category'])
    r = requests.post(f"{API}/{p['board']}", data=data, files={'_': (None, '')}, headers={'Authorization': f'Bearer {t}'}, timeout=30)
    ok = r.ok and r.json().get('status') == 'CREATED'
    print('   ', r.status_code, r.text[:120])
    if not ok: break
    lst = requests.get(f"{API}/{p['board']}", params={'page': 1, 'size': 20, 'sortType': 'latest'}, timeout=20).json()['output']['boards']
    sq = next(b['sq'] for b in lst if b['ttl'] == p['title'])
    done.append({'board': p['board'], 'sq': sq, 'bot': bot, 'title': p['title']})
    json.dump(done, open(DONE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('등록', len(done), '건' if '--apply' in sys.argv else '(드라이런)')
