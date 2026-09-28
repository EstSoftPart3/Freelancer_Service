# -*- coding: utf-8 -*-
"""
2026-09-28 면접후기 100건 + 투표 20건(선택지·참여 포함) 더미 등록.

  드라이런(기본) : !python "docs/도구/seed-2026-09-28-interview-vote.py" [--prod]
  등록           : !python "docs/도구/seed-2026-09-28-interview-vote.py" [--prod] --apply
  회수           : !python "docs/도구/seed-2026-09-28-interview-vote.py" [--prod] --revoke --apply

작성자는 봇 계정(user_id LIKE 'bot\\_%')에서 무작위로 고른다. 작성일은 9/1~오늘 사이.
🔴 회사명은 실제 기업명을 쓰지 않는다 — 지어낸 후기가 실존 기업의 평판처럼 읽히면 안 되므로
   "업종 + 규모 + 이니셜" 익명 표기만 쓴다.
   → 운영 100건은 이후 사용자 결정으로 실제 기업명으로 바꿨다: 2026-09-28-interview-real-names.sql
     (python docs/도구/apply-sql-prod.py docs/도구/2026-09-28-interview-real-names.sql)
면접단계 구분자는 InterviewService 와 같은 U+001F.
등록한 sq 는 seed-2026-09-28-interview-vote.<스키마>.json 에 남기고 --revoke 가 그 파일을 쓴다.
"""
import importlib.util
import json
import os
import random
import sys
from datetime import datetime, timedelta

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

APPLY = '--apply' in sys.argv
REVOKE = '--revoke' in sys.argv
N_INTERVIEW, N_VOTE = 100, 20
STAGE_SEP = '\u001f'
rnd = random.Random(20260928)

INDUSTRIES = ['핀테크', '이커머스', '게임', '모빌리티', '헬스케어', '에듀테크', '물류', '광고플랫폼', 'SaaS',
              '보안솔루션', 'SI', '금융', '통신', '미디어', '여행플랫폼', '부동산플랫폼', 'AI', '제조']
SIZES = ['스타트업', '중견기업', '대기업', '외국계', '유니콘']
INITIALS = 'ABCDEFGHJKLMNPRSTW'

JOB_QUESTIONS = {
    '백엔드/서버개발': ['트랜잭션 격리 수준별 차이와 실제로 겪은 문제', 'N+1 문제를 어떻게 발견하고 해결했는지', '캐시 무효화 전략',
                   '대용량 트래픽에서 DB 병목을 줄인 경험', 'MSA 환경에서 분산 트랜잭션 처리', 'REST API 버전 관리 방법',
                   '동시성 이슈를 재현하고 해결한 경험', '인덱스를 탔는데도 느린 쿼리의 원인'],
    '프론트엔드': ['리렌더링 최적화 경험', '상태관리 라이브러리를 고른 이유', 'SSR과 CSR 선택 기준', '웹 접근성 고려 사항',
              '번들 사이즈를 줄인 방법', '브라우저 렌더링 과정 설명', 'CORS 에러가 나는 이유와 해결', '디자인 시스템 운영 경험'],
    '웹개발': ['세션과 토큰 인증 방식 비교', '파일 업로드 보안 처리', 'XSS·CSRF 방어 방법', '레거시 코드 리팩터링 경험'],
    '앱개발': ['앱 크래시를 추적한 방법', '오프라인 동기화 설계', '푸시 알림 구조', '앱 용량 최적화'],
    'iOS개발': ['메모리 누수를 찾은 방법', 'SwiftUI 도입 여부 판단 기준', 'GCD와 async/await 비교'],
    '안드로이드개발': ['생명주기 관련 버그 경험', 'Compose 전환 경험', 'ANR 원인 분석'],
    'DevOps': ['무중단 배포 구성', '쿠버네티스 리소스 설정 기준', '장애 알림 체계', 'CI 시간을 줄인 경험', 'IaC 도입 경험'],
    '클라우드엔지니어': ['멀티 AZ 구성 이유', '비용 최적화 경험', 'VPC 설계', 'IAM 최소 권한 설계'],
    '데이터엔지니어': ['배치와 스트리밍 파이프라인 선택 기준', '데이터 품질 검증 방법', 'Spark 튜닝 경험', '스키마 변경 대응'],
    '데이터분석가': ['A/B 테스트 설계', '지표 정의 경험', 'SQL 윈도우 함수 활용', '분석 결과를 의사결정으로 연결한 사례'],
    '머신러닝': ['과적합 대응', '피처 엔지니어링 경험', '모델 서빙 구조', '불균형 데이터 처리'],
    'AI/LLM엔지니어': ['RAG 파이프라인 설계', '프롬프트 평가 방법', '할루시네이션 줄인 방법', '임베딩 모델 선택 기준'],
    'DBA': ['백업·복구 전략', '레플리케이션 지연 대응', '실행계획 분석', '파티셔닝 기준'],
    'SI개발': ['요구사항 변경이 잦을 때 대응 방식', '전자정부 프레임워크 경험', '산출물 작성 경험', '고객사 커뮤니케이션'],
    'SQA': ['테스트 케이스 설계 방법', '자동화 테스트 범위 결정', '회귀 테스트 전략', '버그 우선순위 판단'],
    '보안컨설팅': ['모의해킹 절차', 'ISMS 대응 경험', '취약점 진단 결과 보고 방식'],
    '개발PM': ['일정이 밀릴 때 대응', '우선순위 조율 경험', '개발자와 기획자 간 갈등 해결'],
    '서비스기획': ['기획한 기능의 성과 지표', '사용자 인터뷰 경험', '정책 설계 사례'],
    'UI/UX디자이너': ['포트폴리오 설명', '사용성 테스트 경험', '디자인 시스템 기여'],
    '임베디드': ['RTOS 사용 경험', '메모리 제약 환경 최적화', '펌웨어 업데이트 방식'],
    '시스템엔지니어': ['서버 장애 대응 절차', '리눅스 성능 분석 도구', '모니터링 구성'],
    '게임개발': ['게임 루프 최적화', '서버 동기화 방식', '메모리 풀 사용 경험'],
}
COMMON_Q = ['자기소개와 지원 동기', '가장 어려웠던 프로젝트와 해결 과정', '팀 내 갈등을 해결한 경험', '최근 관심 있게 본 기술',
            '이직 사유', '입사 후 하고 싶은 일', '실패했던 경험과 배운 점', '마지막으로 하고 싶은 말']
ATMOS = {
    1: ['편한 대화 분위기였고 질문도 무난했습니다.', '면접관분들이 친절하게 설명해 주셔서 긴장이 풀렸습니다.'],
    2: ['전반적으로 편안했고 실무 경험 위주로 물어봤습니다.', '기술 질문보다 협업 방식에 관심이 많았습니다.'],
    3: ['적당한 긴장감이 있었고 꼬리 질문이 조금 있었습니다.', '이력서 기반으로 깊게 물어봐서 준비가 필요했습니다.',
        '분위기는 좋았지만 라이브 코딩이 생각보다 까다로웠습니다.'],
    4: ['꼬리 질문이 많아 준비한 내용 이상을 요구했습니다.', '시스템 설계 질문이 길게 이어져 체력 소모가 컸습니다.',
        '면접관이 말수가 적어 반응을 읽기 어려웠습니다.'],
    5: ['압박면접에 가까웠습니다. 답변마다 반박이 들어왔습니다.', '과제 난이도가 높았고 시간 내 끝내기 어려웠습니다.'],
}
CAREERS = ['신입', '1~3년', '3~5년', '5~10년', '10년+']
SALARY_BY_CAREER = {'신입': (3000, 4200), '1~3년': (3600, 5000), '3~5년': (4500, 6500), '5~10년': (5800, 8500), '10년+': (7500, 12000)}

VOTES = [
    ('IT', '다음 사이드 프로젝트 백엔드 언어는?', None, ['Java/Kotlin', 'Go', 'Node.js', 'Python', 'Rust']),
    ('IT', '코드리뷰 필수 승인 인원, 몇 명이 적당할까요?', '팀 규정 정하는 중이라 의견 부탁드려요.', ['1명', '2명', '3명 이상', '승인 없이 자율']),
    ('IT', '요즘 실무에서 가장 많이 쓰는 AI 코딩 도구는?', None, ['Claude Code', 'GitHub Copilot', 'Cursor', '안 씀']),
    ('IT', '프론트 상태관리, 신규 프로젝트라면?', None, ['Zustand', 'Redux Toolkit', 'Jotai', 'React Query만으로 충분']),
    ('IT', '테스트 코드 커버리지 목표치는?', None, ['50% 미만', '50~70%', '70~90%', '숫자는 의미 없다']),
    ('IT', '금요일 오후 배포, 허용하시나요?', '현장마다 다르던데 궁금합니다.', ['절대 안 됨', '긴급 건만', '자동화돼 있으면 OK']),
    ('IT', 'ORM vs SQL 직접 작성', None, ['JPA/Hibernate', 'MyBatis', 'jOOQ/QueryDSL', '상황 따라 섞어 씀']),
    ('IT', '모노레포 쓰시나요?', None, ['쓴다', '안 쓴다', '도입 검토 중']),
    ('IT', '가장 배우고 싶은 인프라 기술은?', None, ['쿠버네티스', 'Terraform', '서비스 메시', 'eBPF']),
    ('IT', 'DB 마이그레이션 도구는?', None, ['Flyway', 'Liquibase', '수작업 SQL', 'ORM 자동 생성']),
    ('일반', '재택근무 vs 사무실 출근, 어떤 게 좋아요?', None, ['풀재택', '주 2~3일 재택', '사무실 출근']),
    ('일반', '프리랜서 전향, 몇 년 차가 적당할까요?', '정규직 5년 차인데 고민입니다.', ['3년 미만', '3~5년', '5~10년', '10년 이상']),
    ('일반', '점심시간 몇 분이 적당한가요?', None, ['50분', '1시간', '1시간 30분']),
    ('일반', '이직할 때 가장 중요한 조건은?', None, ['연봉', '기술 스택', '워라밸', '사람/문화', '회사 성장성']),
    ('일반', '연봉 협상, 직접 하시나요?', None, ['직접 한다', '헤드헌터 통해서', '제시액 그대로 수락']),
    ('일반', '업무용 모니터 몇 대 쓰세요?', None, ['1대', '2대', '3대 이상', '노트북 화면만']),
    ('일반', '출근길 교통수단은?', None, ['지하철', '버스', '자가용', '도보/자전거']),
    ('일반', '회식, 얼마나 자주가 적당할까요?', None, ['월 1회', '분기 1회', '반기 1회', '없어도 됨']),
    ('일반', '개발 공부는 주로 언제 하세요?', None, ['출근 전', '퇴근 후', '주말', '업무 중에만']),
    ('일반', '키보드 축 취향은?', None, ['적축', '갈축', '청축', '무접점', '노트북 키보드']),
]
CATEGORY = {'IT': 3250, '일반': 3251}


def ledger_path(schema):
    return os.path.join(HERE, f'seed-2026-09-28-interview-vote.{schema}.json')


def rand_dt(start, end):
    return start + timedelta(seconds=rnd.randint(0, int((end - start).total_seconds())))


def main():
    conn, schema = dbconfig.connect()
    cur = conn.cursor()
    path = ledger_path(schema)

    if REVOKE:
        if not os.path.exists(path):
            raise SystemExit(f'기록 파일이 없다: {path}')
        led = json.load(open(path, encoding='utf-8'))
        say = f"면접후기 {len(led['interviews'])} · 투표 {len(led['votes'])}"
        print(f'회수 대상: {say}')
        if APPLY:
            v = led['votes'] or [0]
            fmt = ','.join(['%s'] * len(v))
            cur.execute(f'DELETE FROM tbl_vote_record_s WHERE vote_sq IN ({fmt})', v)
            cur.execute(f'DELETE FROM tbl_vote_option_s WHERE vote_sq IN ({fmt})', v)
            cur.execute(f'DELETE FROM tbl_vote_m WHERE vote_sq IN ({fmt})', v)
            i = led['interviews'] or [0]
            cur.execute(f"DELETE FROM tbl_interview_review_m WHERE interview_review_sq IN ({','.join(['%s'] * len(i))})", i)
            conn.commit()
            os.rename(path, path + '.revoked')
            print('회수 완료.')
        return

    if os.path.exists(path):
        raise SystemExit(f'이미 등록된 기록이 있다({path}). 다시 넣으려면 먼저 --revoke.')

    cur.execute("SELECT user_sq FROM tbl_user_m WHERE user_id LIKE 'bot\\_%%' AND user_is_deleted_yn='N'")
    bots = [r[0] for r in cur.fetchall()]
    if len(bots) < 60:
        raise SystemExit(f'봇 계정이 {len(bots)}개뿐이다(60개 이상 필요).')
    now = datetime.now().replace(microsecond=0)
    start = datetime(2026, 9, 1, 9, 0)

    # ── 면접후기
    interviews = []
    jobs = list(JOB_QUESTIONS)
    for _ in range(N_INTERVIEW):
        job = rnd.choice(jobs)
        career = rnd.choices(CAREERS, weights=[2, 4, 4, 3, 1])[0]
        company = f'{rnd.choice(INDUSTRIES)} {rnd.choice(SIZES)} {rnd.choice(INITIALS)}사'
        stages = ['서류'] + sorted(rnd.sample(['코딩테스트', '1차 기술면접', '2차 기술면접', '임원면접', '최종면접'], rnd.randint(1, 4)),
                                   key=['코딩테스트', '1차 기술면접', '2차 기술면접', '임원면접', '최종면접'].index)
        qs = rnd.sample(JOB_QUESTIONS[job], min(len(JOB_QUESTIONS[job]), rnd.randint(2, 3))) + rnd.sample(COMMON_Q, rnd.randint(1, 2))
        diff = rnd.choices([1, 2, 3, 4, 5], weights=[1, 3, 5, 4, 2])[0]
        result = rnd.choices(['PASS', 'FAIL', 'PENDING'], weights=[4, 4, 2])[0]
        lo, hi = SALARY_BY_CAREER[career]
        salary = rnd.randrange(lo, hi, 100) if result == 'PASS' and rnd.random() < 0.8 else None
        created = rand_dt(start, now)
        interview_dt = (created - timedelta(days=rnd.randint(3, 60))).date()
        interviews.append((rnd.choice(bots), company, job, career, interview_dt, STAGE_SEP.join(stages),
                           '\n'.join(f'- {q}' for q in qs), diff, rnd.choice(ATMOS[diff]), result, salary,
                           rnd.randint(5, 400), created))

    # ── 투표
    votes = []
    for cat, ttl, desc, opts in VOTES:
        created = rand_dt(start, now - timedelta(days=1))
        end = created + timedelta(days=rnd.choice([7, 14, 30, 60]))
        voters = rnd.sample(bots, rnd.randint(8, 60))
        weights = [rnd.random() + 0.2 for _ in opts]
        ballots = [(u, rnd.choices(range(len(opts)), weights=weights)[0], rand_dt(created, min(end, now))) for u in voters]
        votes.append((rnd.choice(bots), ttl, desc, CATEGORY[cat], end, rnd.randint(len(voters), len(voters) * 4), created, opts, ballots))

    closed = sum(1 for v in votes if v[4] < now)
    print(f'면접후기 {len(interviews)}건, 투표 {len(votes)}건(마감 {closed}) · 선택지 {sum(len(v[7]) for v in votes)} · '
          f'참여 {sum(len(v[8]) for v in votes)} — 작성자 봇 {len(bots)}명 중 무작위')
    for r in interviews[:3]:
        print('  예시:', r[1], '|', r[2], '|', r[3], '|', r[9], '|', r[4])
    if not APPLY:
        print('\n드라이런이라 아무것도 넣지 않았다. 등록하려면 --apply.')
        return

    led = {'interviews': [], 'votes': []}
    for r in interviews:
        cur.execute('INSERT INTO tbl_interview_review_m (user_sq, company_nm, job_nm, career_level, interview_dt, interview_stages, '
                    'question_edt, difficulty_star, atmosphere_edt, result_cd, proposed_salary, interview_view_cnt, '
                    'interview_created_at_dtm) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)', r)
        led['interviews'].append(cur.lastrowid)
    for user, ttl, desc, cat, end, views, created, opts, ballots in votes:
        cur.execute('INSERT INTO tbl_vote_m (user_sq, vote_ttl, vote_description_edt, vote_category_cd, vote_end_dt, vote_view_cnt, '
                    'vote_created_at_dtm) VALUES (%s,%s,%s,%s,%s,%s,%s)', (user, ttl, desc, cat, end, views, created))
        vsq = cur.lastrowid
        led['votes'].append(vsq)
        opt_sqs = []
        for i, name in enumerate(opts, 1):
            cur.execute('INSERT INTO tbl_vote_option_s (vote_sq, vote_option_nm, vote_option_order) VALUES (%s,%s,%s)', (vsq, name, i))
            opt_sqs.append(cur.lastrowid)
        for u, oi, at in ballots:
            cur.execute('INSERT INTO tbl_vote_record_s (vote_sq, vote_option_sq, user_sq, vote_record_created_at_dtm) '
                        'VALUES (%s,%s,%s,%s)', (vsq, opt_sqs[oi], u, at))
    conn.commit()
    json.dump(led, open(path, 'w', encoding='utf-8'))
    print(f'\n등록 완료({schema}). 기록: {path}')


if __name__ == '__main__':
    main()
