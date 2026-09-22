# -*- coding: utf-8 -*-
"""
DB 이관 2차 실사 (읽기 전용) — freelancer_project의 정체 파악.

1차 실사 결과 두 DB가 '원본 → 빈 대상'이 아니라 **독립적으로 데이터가 쌓인
동일 구조의 두 DB**임이 드러났다. 어느 쪽 데이터로 갈지 결정하려면
"각 DB가 언제까지 누구에게 쓰였는지"를 알아야 한다.

사용법:
  !python "C:/dev/Freelancer_Service/docs/db-audit2.py"

결과: 콘솔 + docs/db-audit2-result.md
SELECT만 수행한다.
"""
import os
import sys
import pymysql
from datetime import datetime

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

SRC = 'freelancer_education'
DST = 'freelancer_project'

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor,
)

OUT = r'C:/dev/Freelancer_Service/docs/db-audit2-result.md'
lines = []


def w(s=''):
    print(s)
    lines.append(s)


def q(cur, sql, args=None):
    try:
        cur.execute(sql, args)
        return cur.fetchall()
    except Exception as e:
        return [{'ERROR': f'{e.__class__.__name__}: {e}'}]


def main():
    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    w('# DB 이관 2차 실사 — freelancer_project의 정체')
    w()
    w(f'- 실행 시각: {datetime.now():%Y-%m-%d %H:%M:%S}')
    w()

    # ── ① 각 DB의 "마지막 활동 시각" ──────────────────────────
    w('## ① 마지막 활동 시각 (어느 DB가 최근까지 쓰였나)')
    w()
    probes = [
        ('회원 가입', 'TBL_USER_M', 'user_created_at_dtm'),
        ('게시글 작성', 'TBL_BOARD_M', 'board_created_at_dtm'),
        ('댓글 작성', 'TBL_BOARD_COMMENT_S', 'comment_created_at_dtm'),
        ('프로젝트 등록', 'TBL_PROJECT_M', 'project_created_at_dtm'),
        ('알림 발송', 'TBL_NOTIFICATION_M', 'notification_created_at_dtm'),
        ('이력서 등록', 'TBL_RESUME_M', 'resume_created_at_dtm'),
        ('프로젝트 지원', 'TBL_PROJECT_APPLICATION_H', 'project_application_created_at_dtm'),
    ]
    w('| 지표 | ' + f'{SRC} | {DST} |')
    w('|---|---|---|')
    for label, tbl, col in probes:
        vals = []
        for schema in (SRC, DST):
            r = q(cur, f'SELECT MAX(`{col}`) mx, COUNT(*) c FROM `{schema}`.`{tbl}`')
            if 'ERROR' in r[0]:
                vals.append('조회실패')
            else:
                vals.append(f'{r[0]["mx"]} ({r[0]["c"]}건)')
        w(f'| {label} | {vals[0]} | {vals[1]} |')
    w()

    # 접속 로그가 가장 확실한 "마지막 사용" 지표
    w('### 접속 이력 (TBL_USER_ONLINE_S)')
    w()
    for schema in (SRC, DST):
        r = q(cur, f'SELECT COUNT(*) c, MIN(user_online_created_at_dtm) mn, '
                   f'MAX(user_online_created_at_dtm) mx FROM `{schema}`.TBL_USER_ONLINE_S')
        if 'ERROR' in r[0]:
            # 컬럼명이 다를 수 있으니 컬럼 목록을 보여준다
            cols = q(cur, "SELECT column_name cn FROM information_schema.columns "
                          "WHERE table_schema=%s AND table_name='TBL_USER_ONLINE_S'", (schema,))
            w(f'- `{schema}`: 조회 실패. 컬럼 = {[c.get("cn") for c in cols]}')
        else:
            w(f'- `{schema}`: {r[0]["c"]}건, {r[0]["mn"]} ~ **{r[0]["mx"]}**')
    w()

    # ── ② 회원 비교 ───────────────────────────────────────────
    w('## ② 회원(TBL_USER_M) 비교')
    w()
    users = {}
    for schema in (SRC, DST):
        r = q(cur, f'SELECT user_sq, user_id, user_nm, user_type_cd, user_created_at_dtm cdt, '
                   f'user_is_deleted_yn del FROM `{schema}`.TBL_USER_M ORDER BY user_sq')
        users[schema] = {u['user_id']: u for u in r if 'ERROR' not in u}

    s_ids, d_ids = set(users[SRC]), set(users[DST])
    w(f'- `{SRC}`: {len(s_ids)}명 / `{DST}`: {len(d_ids)}명')
    w(f'- **양쪽 공통 user_id: {len(s_ids & d_ids)}개**')
    w(f'- SRC 전용: {len(s_ids - d_ids)}개 / DST 전용: {len(d_ids - s_ids)}개')
    w()
    if s_ids & d_ids:
        w('### 공통 user_id (user_sq가 같은지 확인 — 다르면 병합 시 PK 충돌)')
        w()
        w('| user_id | SRC user_sq | DST user_sq | SRC 가입일 | DST 가입일 | 일치 |')
        w('|---|---:|---:|---|---|---|')
        for uid in sorted(s_ids & d_ids):
            a, b = users[SRC][uid], users[DST][uid]
            same = '✅' if a['user_sq'] == b['user_sq'] else '❌ **다름**'
            w(f'| `{uid}` | {a["user_sq"]} | {b["user_sq"]} | {a["cdt"]} | {b["cdt"]} | {same} |')
        w()
    if d_ids - s_ids:
        w(f'### `{DST}`에만 있는 회원 (이관 시 사라지면 안 되는 대상)')
        w()
        w('| user_sq | user_id | 이름 | 유형 | 가입일 | 삭제 |')
        w('|---:|---|---|---|---|---|')
        for uid in sorted(d_ids - s_ids):
            u = users[DST][uid]
            w(f'| {u["user_sq"]} | `{uid}` | {u["user_nm"]} | {u["user_type_cd"]} '
              f'| {u["cdt"]} | {u["del"]} |')
        w()

    # ── ③ 기술태그 마스터 차이 (DST 52 vs SRC 24) ─────────────
    w('## ③ TBL_SKILL_TAG_C 차이 (코드성 데이터 — 어느 쪽이 최신인가)')
    w()
    tags = {}
    for schema in (SRC, DST):
        r = q(cur, f'SELECT * FROM `{schema}`.TBL_SKILL_TAG_C')
        if r and 'ERROR' in r[0]:
            w(f'- `{schema}` 조회 실패: {r[0]["ERROR"]}')
            tags[schema] = {}
            continue
        key = 'skill_tag_nm' if r and 'skill_tag_nm' in r[0] else list(r[0].keys())[1] if r else None
        tags[schema] = {str(x.get(key)): x for x in r}
    if tags.get(SRC) is not None and tags.get(DST) is not None:
        s_t, d_t = set(tags[SRC]), set(tags[DST])
        w(f'- SRC {len(s_t)}개 / DST {len(d_t)}개 / 공통 {len(s_t & d_t)}개')
        w(f'- SRC 전용: {sorted(s_t - d_t)}')
        w(f'- **DST 전용: {sorted(d_t - s_t)}**')
    w()

    # ── ④ 공통코드 차이 ───────────────────────────────────────
    w('## ④ TBL_COMMON_CODE_C 차이 (156 vs 149)')
    w()
    codes = {}
    for schema in (SRC, DST):
        r = q(cur, f'SELECT common_code_sq sq, common_code_nm nm, parent_common_code_sq p '
                   f'FROM `{schema}`.TBL_COMMON_CODE_C ORDER BY common_code_sq')
        codes[schema] = {c['sq']: c for c in r if 'ERROR' not in c}
    s_c, d_c = set(codes[SRC]), set(codes[DST])
    w(f'- SRC {len(s_c)}개 / DST {len(d_c)}개 / 공통 {len(s_c & d_c)}개')
    w()
    if s_c - d_c:
        w('### SRC에만 있는 코드')
        w()
        for sq in sorted(s_c - d_c):
            c = codes[SRC][sq]
            w(f'- `{sq}` {c["nm"]} (parent {c["p"]})')
        w()
    if d_c - s_c:
        w('### DST에만 있는 코드')
        w()
        for sq in sorted(d_c - s_c):
            c = codes[DST][sq]
            w(f'- `{sq}` {c["nm"]} (parent {c["p"]})')
        w()
    # 이름이 다른 코드
    diff_nm = [sq for sq in sorted(s_c & d_c)
               if codes[SRC][sq]['nm'] != codes[DST][sq]['nm']]
    if diff_nm:
        w('### 같은 코드인데 이름이 다름')
        w()
        for sq in diff_nm:
            w(f'- `{sq}`: SRC "{codes[SRC][sq]["nm"]}" vs DST "{codes[DST][sq]["nm"]}"')
        w()

    # ── ⑤ 부모코드 전체 목록 (Phase 1 카테고리 번호대 결정) ───
    w('## ⑤ 부모 코드 전체 (Phase 1에서 쓸 빈 번호대 찾기)')
    w()
    w('1600대가 이미 사용 중임이 1차 실사에서 확인됐다. 실제 무엇인지 본다.')
    w()
    for schema in (SRC, DST):
        w(f'### `{schema}`')
        w()
        r = q(cur, f'SELECT common_code_sq sq, common_code_nm nm FROM `{schema}`.TBL_COMMON_CODE_C '
                   f'WHERE parent_common_code_sq IS NULL ORDER BY common_code_sq')
        for c in r:
            if 'ERROR' in c:
                w(f'- {c["ERROR"]}')
                break
            cnt = q(cur, f'SELECT COUNT(*) c FROM `{schema}`.TBL_COMMON_CODE_C '
                         f'WHERE parent_common_code_sq=%s', (c['sq'],))
            w(f'- `{c["sq"]}` {c["nm"]} (하위 {cnt[0]["c"]}개)')
        w()
    w('→ 최대 부모코드 이후의 빈 번호대를 게시판 카테고리에 사용한다.')
    w()

    # ── ⑥ 게시판 타입 코드(1400대) 실제 내용 ──────────────────
    w('## ⑥ 게시판 타입 코드 1400대 실제 내용')
    w()
    for schema in (SRC, DST):
        r = q(cur, f'SELECT common_code_sq sq, common_code_nm nm, common_code_english_nm en '
                   f'FROM `{schema}`.TBL_COMMON_CODE_C WHERE common_code_sq BETWEEN 1400 AND 1499 '
                   f'OR parent_common_code_sq=1400 ORDER BY common_code_sq')
        w(f'- `{schema}`: ' + ', '.join(
            f'{c.get("sq")}={c.get("nm")}' for c in r if 'ERROR' not in c))
    w()

    # ── ⑦ DST 전용 테이블 tbl_faq_m 내용 ──────────────────────
    w('## ⑦ DST 전용 `tbl_faq_m` (26행) — 무엇인가')
    w()
    cols = q(cur, "SELECT column_name cn, column_type ct FROM information_schema.columns "
                  "WHERE table_schema=%s AND table_name='tbl_faq_m' ORDER BY ordinal_position",
             (DST,))
    w('컬럼: ' + ', '.join(f'`{c.get("cn")}` {c.get("ct")}' for c in cols if 'ERROR' not in c))
    w()
    r = q(cur, f'SELECT * FROM `{DST}`.tbl_faq_m LIMIT 5')
    for row in r:
        w(f'- {row}')
    w()

    # ── ⑧ 스키마 차이 총정리 (앱이 쓰는 44개 테이블 한정) ─────
    w('## ⑧ 앱 실사용 테이블의 컬럼 차이 (SRC 기준)')
    w()
    app_tables = """tbl_address_s tbl_area_c tbl_board_answer_attachment_s tbl_board_answer_s
tbl_board_attachment_s tbl_board_comment_s tbl_board_m tbl_board_normal_tag_s
tbl_board_skill_tag_s tbl_certificate_s tbl_common_code_c tbl_common_file_s
tbl_company_application_h tbl_company_member_r tbl_company_profile_image_s tbl_company_s
tbl_company_tag_s tbl_notification_m tbl_project_application_h tbl_project_contract_type_s
tbl_project_interview_time_slot_s tbl_project_m tbl_project_preferred_skill_tag_s
tbl_project_recruit_job_role_s tbl_project_required_skill_tag_s tbl_recommendation_s
tbl_report_s tbl_resume_attachment_s tbl_resume_career_s tbl_resume_certification_s
tbl_resume_education_s tbl_resume_m tbl_resume_profile_image_s tbl_resume_project_history_s
tbl_resume_project_history_skill_tag_s tbl_resume_skill_tag_s tbl_resume_training_history_s
tbl_schedule_m tbl_scrap_s tbl_skill_tag_c tbl_user_m tbl_user_online_s
tbl_user_profile_image_s""".split()

    def cols_of(schema, tn):
        r = q(cur, "SELECT column_name cn, column_type ct, is_nullable nu "
                   "FROM information_schema.columns WHERE table_schema=%s AND table_name=%s",
              (schema, tn))
        return {c['cn']: c for c in r if 'ERROR' not in c}

    found = False
    for tn in app_tables:
        a, b = cols_of(SRC, tn), cols_of(DST, tn)
        if not a or not b:
            w(f'- `{tn}`: ' + ('SRC 없음 ' if not a else '') + ('**DST 없음**' if not b else ''))
            found = True
            continue
        only_s, only_d = set(a) - set(b), set(b) - set(a)
        chg = [c for c in set(a) & set(b) if a[c]['ct'] != b[c]['ct']]
        if only_s or only_d or chg:
            found = True
            w(f'- `{tn}`: ' +
              (f'SRC에만 {sorted(only_s)} ' if only_s else '') +
              (f'DST에만 {sorted(only_d)} ' if only_d else '') +
              (f'타입다름 {chg}' if chg else ''))
    if not found:
        w('앱 실사용 테이블 전부 컬럼 구조 동일.')
    w()

    # ── ⑨ 매퍼가 참조하지만 어느 DB에도 없는 테이블 ───────────
    w('## ⑨ TBL_PROJECT_HISTORY_SKILL_S 존재 확인')
    w()
    w('`mapper/mypage/ResumeSkillMapper.xml:12`가 참조하는데 1차 실사 목록에 없었다.')
    for schema in (SRC, DST):
        r = q(cur, "SELECT COUNT(*) c FROM information_schema.tables "
                   "WHERE table_schema=%s AND table_name='TBL_PROJECT_HISTORY_SKILL_S'", (schema,))
        w(f'- `{schema}`: {"있음" if r[0].get("c") else "**없음 → 이 쿼리는 실행 시 에러**"}')
    w()

    conn.close()
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f'\n=== 결과 저장: {OUT} ===')


if __name__ == '__main__':
    main()
