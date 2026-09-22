# -*- coding: utf-8 -*-
"""
커뮤니티 시드 500건 등록 (P6-3)

  배치 1개만 미리보기 : !python "C:/dev/Freelancer_Service/docs/도구/seed-community-500.py" --batch 1 --preview
  배치 1개 등록       : !python "C:/dev/Freelancer_Service/docs/도구/seed-community-500.py" --batch 1
  나머지 전부 등록    : !python "C:/dev/Freelancer_Service/docs/도구/seed-community-500.py" --rest
  회수(등록 기록으로) : !python "C:/dev/Freelancer_Service/docs/도구/seed-community-500.py" --revoke

무엇을 하는가
  docs/오픈-준비-2026-08/seed-content/chunk-*.json 50개(합계 500건)를
  이어 붙여 50건씩 10배치로 /api/admin/seed/community 에 넣는다.
  (파일마다 건수가 10건씩 고르지 않아 파일이 아니라 건수로 자른다)

왜 스크립트인가
  BO 화면(/contents/board/seed)으로도 되지만 50건 청크를 10번 손으로 붙여넣어야 한다.
  대신 스크립트로 넣으면 BO 회수 버튼에는 안 뜬다(화면은 localStorage 를 쓴다) —
  그래서 등록된 board_sq 를 아래 파일에 남기고 --revoke 가 그 파일을 쓴다.

  기록 파일: docs/오픈-준비-2026-08/seed-committed.json

🔴 선행 조건
  P6-2 봇 계정 100개가 먼저 있어야 한다. options.authorUserSqs 를 비워두면
  서버가 user_id LIKE 'bot\\_%' 풀에서 작성자를 고른다. 봇이 없으면 등록이 실패한다.
  댓글 작성자 상한이 (계정 수 - 1) 이라 봇 100개여야 댓글 99명까지 분산된다.

🔴 balanceCategories 는 false 다
  기본값이 true 인데, true 면 콘텐츠의 categoryHintCd 를 무시하고 균등 배분한다.
  이번 500건은 자유 105 / 현장정보 105 / 정보 105 / 기능요청 35 / Q&A 150 으로
  의도해서 만든 배분이라 서버가 다시 섞으면 안 된다.

🔴 작성일시는 여기서 확정되지 않는다
  spreadMode=PAST 로 과거에 흩뿌린 뒤, P6-4(shift-seed-dates.py)가 9/1~9/28 로 옮긴다.
  시드 API 에 9월을 직접 지정해도 AdminSeedService 가 미래를 현재로 잘라내기 때문이다.

주의: 관리자 비밀번호가 평문으로 있다. git 에 올리지 말 것(docs/ 는 untracked 관행).
"""
import argparse
import glob
import json
import os
import sys
import urllib.error
import urllib.request

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # docs/
SEED_DIR = os.path.join(ROOT, '오픈-준비-2026-08', 'seed-content')
COMMIT_FILE = os.path.join(ROOT, '오픈-준비-2026-08', 'seed-committed.json')

BASE_URL = 'http://localhost:8080'
ADMIN_ID = 'admin'
ADMIN_PW = os.environ['FREELANCER_ADMIN_PW']

POSTS_PER_BATCH = 50         # 인계 문서의 "50건씩 10회"
BASE_RANDOM_SEED = 20260826  # 배치마다 +batchNo 해서 배분이 겹치지 않게 한다

# 배치 옵션. 날짜는 P6-4 가 다시 옮기므로 여기서는 "상대 순서가 자연스러운가"만 보면 된다.
OPTIONS = {
    'spreadMode': 'PAST',
    'spreadDays': 28,
    # [1일내, 7일내, 30일내, 그이전] — 어차피 9월로 옮기지만
    # 옮기기 전 목록을 육안 확인할 수 있게 최근 구간에도 남긴다.
    'hotWindowRatio': [10, 25, 45, 20],
    'commentMin': 2,
    'commentMax': 5,
    'answerMin': 1,
    'answerMax': 3,
    'viewMin': 15,
    'viewMax': 480,
    'adoptRatio': {'inProgress': 20, 'adopted': 50, 'selfSolved': 15, 'unresolved': 15},
    'balanceCategories': False,   # 🔴 콘텐츠의 categoryHintCd 를 존중한다
}


def post(path, body, token=None):
    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(f'{BASE_URL}{path}', data=data, method='POST')
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        detail = e.read().decode('utf-8', 'replace')
        raise SystemExit(f'HTTP {e.code} {path}\n{detail[:1500]}')


def login():
    res = post('/api/admin/login',
               {'userId': ADMIN_ID, 'userPw': ADMIN_PW, 'userTypeCd': 303, 'autoLogin': False})
    token = (res.get('output') or {}).get('token', {}).get('accessToken')
    if not token:
        raise SystemExit(f'관리자 로그인 실패: {json.dumps(res, ensure_ascii=False)[:400]}')
    return token


def _interleave(flat):
    """카테고리가 배치마다 고르게 섞이도록 순서를 다시 짠다.

    왜 필요한가 — 청크 파일이 주제별로 묶여 있어서 그냥 이어 붙이면
    배치 1 은 자유·현장정보만, 배치 10 은 전부 Q&A 가 된다.
    "첫 배치 50건만 넣고 육안 확인" 이 표본 구실을 하려면 한 배치에
    다섯 종류가 다 들어 있어야 한다.

    난수를 쓰지 않는다 — 남은 개수가 가장 많은 카테고리에서 하나씩 꺼내는
    결정적 방식이라 몇 번을 돌려도 같은 순서가 나온다(재현 가능).
    """
    groups = {}
    for name, p in flat:
        groups.setdefault(p.get('categoryHintCd'), []).append((name, p))

    nb = max(1, -(-len(flat) // POSTS_PER_BATCH))   # 올림 나눗셈
    buckets = [[] for _ in range(nb)]

    # 카테고리마다 자기 몫을 nb 개 통에 비례해서 나눠 담는다.
    # "남은 게 많은 쪽부터" 로 하면 가장 많은 Q&A(150)가 앞 배치를 먹어버린다.
    for key in sorted(groups, key=str):
        items = groups[key]
        for i, it in enumerate(items):
            buckets[i * nb // len(items)].append(it)

    return [it for bucket in buckets for it in bucket]


def load_batches():
    """청크 파일을 전부 이어 붙이고 카테고리를 섞은 뒤 POSTS_PER_BATCH 건씩 자른다.

    파일 단위로 자르지 않는 이유 — chunk-*.json 이 파일마다 10건이 아니라
    62/57/60... 처럼 들쭉날쭉해서 배치 크기가 고르지 않다. 건수로 잘라야
    "50건씩 10회"가 된다.
    """
    files = sorted(glob.glob(os.path.join(SEED_DIR, 'chunk-*.json')))
    if not files:
        raise SystemExit(f'시드 파일이 없다: {SEED_DIR}')

    flat = []   # (파일명, post)
    for f in files:
        d = json.load(open(f, encoding='utf-8'))
        for p in (d if isinstance(d, list) else d.get('posts', [])):
            flat.append((os.path.basename(f), p))
    flat = _interleave(flat)

    batches = []
    for i in range(0, len(flat), POSTS_PER_BATCH):
        group = flat[i:i + POSTS_PER_BATCH]
        seen, srcs = set(), []
        for name, _ in group:
            if name not in seen:
                seen.add(name)
                srcs.append(name)
        batches.append({'no': len(batches) + 1,
                        'files': srcs,
                        'posts': [p for _, p in group]})
    return batches


def load_record():
    if os.path.exists(COMMIT_FILE):
        return json.load(open(COMMIT_FILE, encoding='utf-8'))
    return {'batches': [], 'boardSqs': []}


def save_record(rec):
    with open(COMMIT_FILE, 'w', encoding='utf-8') as f:
        json.dump(rec, f, ensure_ascii=False, indent=1)


def run_batch(token, batch, preview_only):
    seed = BASE_RANDOM_SEED + batch['no']
    body = {'randomSeed': seed, 'options': OPTIONS, 'posts': batch['posts']}

    plan = (post('/api/admin/seed/community/preview', body, token) or {}).get('output') or {}
    s = plan.get('summary') or {}
    print(f"  [배치 {batch['no']:>2}] 미리보기  "
          f"글 {s.get('totalBoards')} / Q&A {s.get('totalQna')} / "
          f"답변 {s.get('totalAnswers')} / 댓글 {s.get('totalComments')}")
    print(f"            작성일 {s.get('createdAtMin')} ~ {s.get('createdAtMax')}")
    for w in (plan.get('warnings') or []):
        print(f"            ⚠ {w}")

    if preview_only:
        return None

    # plannedAt 을 그대로 되돌려주지 않으면 400 이다. randomSeed 만으로는 배분이 재현되지 않는다.
    commit_body = dict(body)
    commit_body['plannedAt'] = plan['plannedAt']
    out = (post('/api/admin/seed/community', commit_body, token) or {}).get('output') or {}
    sqs = list(out.get('boardSqs') or [])
    print(f"            → 등록 글 {out.get('insertedBoards')} / "
          f"답변 {out.get('insertedAnswers')} / 댓글 {out.get('insertedComments')}")
    for w in (out.get('warnings') or []):
        print(f"            ⚠ {w}")
    return {'batchNo': batch['no'], 'files': batch['files'],
            'boardSqs': sqs, 'executedAt': out.get('executedAt')}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--batch', type=int, help='이 배치 하나만 처리 (1~10)')
    ap.add_argument('--rest', action='store_true', help='아직 등록 안 한 배치를 전부 등록')
    ap.add_argument('--preview', action='store_true', help='미리보기만, 등록하지 않음')
    ap.add_argument('--revoke', action='store_true', help='기록 파일의 board_sq 를 회수')
    ap.add_argument('--base-url', default=BASE_URL)
    args = ap.parse_args()

    globals()['BASE_URL'] = args.base_url

    print('=' * 72)
    print(f'커뮤니티 시드 등록 — 대상 {BASE_URL}')
    print('=' * 72)

    token = login()
    rec = load_record()

    if args.revoke:
        sqs = rec.get('boardSqs') or []
        if not sqs:
            raise SystemExit(f'회수할 기록이 없다: {COMMIT_FILE}')
        print(f'회수 대상 {len(sqs)}건')
        out = (post('/api/admin/seed/community/revoke', {'boardSqs': sqs}, token) or {}).get('output') or {}
        print('회수 결과:', json.dumps(out, ensure_ascii=False)[:400])
        os.replace(COMMIT_FILE, COMMIT_FILE + '.done')
        print(f'기록 파일 → {COMMIT_FILE}.done')
        return

    batches = load_batches()
    total = sum(len(b['posts']) for b in batches)
    done_nos = {b['batchNo'] for b in rec['batches']}
    print(f'시드 {len(batches)}배치 / 총 {total}건 · 이미 등록된 배치: '
          f"{sorted(done_nos) if done_nos else '없음'}\n")

    if args.batch:
        targets = [b for b in batches if b['no'] == args.batch]
        if not targets:
            raise SystemExit(f'배치 {args.batch} 없음 (1~{len(batches)})')
    elif args.rest:
        targets = [b for b in batches if b['no'] not in done_nos]
        if not targets:
            print('남은 배치가 없다.')
            return
    else:
        raise SystemExit('--batch N / --rest / --revoke 중 하나를 지정할 것')

    for b in targets:
        if b['no'] in done_nos and not args.preview:
            print(f"  [배치 {b['no']:>2}] 이미 등록됨 — 건너뜀")
            continue
        result = run_batch(token, b, args.preview)
        if result:
            rec['batches'].append(result)
            rec['boardSqs'].extend(result['boardSqs'])
            save_record(rec)      # 배치마다 저장 — 중간에 끊겨도 기록이 남는다

    if not args.preview:
        print(f"\n누적 등록 {len(rec['boardSqs'])}건 · 기록 → {COMMIT_FILE}")
        print('회수하려면: --revoke')


if __name__ == '__main__':
    main()
