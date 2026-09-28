# -*- coding: utf-8 -*-
"""
운영 DB(freelancer_project) 스키마로 ERD PDF 를 만든다 — 영역별로 나눠 한 장씩 읽히게.

  !python "docs/도구/erd-pdf.py" [--out 경로.pdf] [--dev]

  1. information_schema 를 읽는다(SELECT 만). --dev 면 개발 DB.
  2. 관계선: 실제 FK 는 실선, 컬럼명 규칙(xxx_sq → PK 가 xxx_sq 인 테이블)으로 추론한 것은 점선.
     *_cd 는 공통코드 참조라 선을 긋지 않고 CD 배지만 붙인다(선이 공통코드 하나로 몰려 읽을 수 없게 된다).
  3. 페이지: 표지 → 영역 개요 → 영역별 관계도(다른 영역 테이블은 흐린 참조 박스) → 테이블 명세.

새 테이블이 생기면 DOMAINS 에 넣을 것 — 어디에도 없으면 「기타」 영역으로 모인다.
"""
import argparse
import importlib.util
import os
import sys
from datetime import datetime

import fitz  # PyMuPDF

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
dbconfig = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dbconfig)

FONT_DIR = 'C:/Windows/Fonts'
FONTS = {'ko': 'malgun.ttf', 'kob': 'malgunbd.ttf', 'mono': 'consola.ttf', 'monob': 'consolab.ttf'}

# (키, 이름, 색, 테이블들)
DOMAINS = [
    ('user', '회원·기업·지역', (0.20, 0.42, 0.70), [
        'tbl_user_m', 'tbl_user_online_s', 'tbl_user_profile_image_s', 'tbl_address_s', 'tbl_area_c',
        'tbl_company_s', 'tbl_company_member_r', 'tbl_company_application_h', 'tbl_company_profile_image_s',
        'tbl_company_tag_s']),
    ('resume', '이력서', (0.15, 0.55, 0.45), [
        'tbl_resume_m', 'tbl_resume_career_s', 'tbl_resume_education_s', 'tbl_resume_certification_s',
        'tbl_certificate_s', 'tbl_resume_project_history_s', 'tbl_resume_project_history_skill_tag_s',
        'tbl_resume_skill_tag_s', 'tbl_resume_training_history_s', 'tbl_resume_attachment_s',
        'tbl_resume_profile_image_s']),
    ('project', '프로젝트 공고·지원', (0.72, 0.42, 0.13), [
        'tbl_project_m', 'tbl_project_application_h', 'tbl_project_interview_time_slot_s',
        'tbl_project_recruit_headcount_s', 'tbl_project_recruit_job_role_s', 'tbl_project_contract_type_s',
        'tbl_project_required_skill_tag_s', 'tbl_project_preferred_skill_tag_s', 'tbl_scrap_s', 'tbl_schedule_m']),
    ('board', '커뮤니티 게시판', (0.55, 0.30, 0.65), [
        'tbl_board_m', 'tbl_board_answer_s', 'tbl_board_comment_s', 'tbl_board_attachment_s',
        'tbl_board_answer_attachment_s', 'tbl_board_normal_tag_s', 'tbl_board_skill_tag_s',
        'tbl_recommendation_s', 'tbl_report_s']),
    ('phase2', 'Phase2 신규 — 투표·면접후기·연봉', (0.80, 0.25, 0.30), [
        'tbl_vote_m', 'tbl_vote_option_s', 'tbl_vote_record_s', 'tbl_interview_review_m',
        'tbl_salary_submission_m', 'tbl_salary_submission_skill_s']),
    ('common', '공통·운영', (0.40, 0.40, 0.45), [
        'tbl_common_code_c', 'tbl_common_file_s', 'tbl_skill_tag_c', 'tbl_notification_m', 'tbl_faq_m', 'tb_faq_m']),
]

PAGE_W, PAGE_H = fitz.paper_size('a3-l')
MARGIN = 36
INK = (0.13, 0.14, 0.16)
MUTED = (0.45, 0.46, 0.50)
LINE = (0.82, 0.83, 0.86)
PK_C = (0.80, 0.45, 0.15)
FK_C = (0.20, 0.45, 0.40)
CD_C = (0.45, 0.45, 0.60)


# ────────────────────────────── 스키마 읽기
def load_schema(schema):
    conn = __import__('pymysql').connect(**dbconfig.config(schema))
    cur = conn.cursor()
    cur.execute("SELECT table_name, table_comment FROM information_schema.tables "
                "WHERE table_schema=%s AND table_type='BASE TABLE' ORDER BY 1", (schema,))
    tables = {t: {'comment': cm or '', 'cols': []} for t, cm in cur.fetchall()}
    cur.execute("SELECT table_name, column_name, column_type, is_nullable, column_key, column_comment "
                "FROM information_schema.columns WHERE table_schema=%s ORDER BY table_name, ordinal_position", (schema,))
    for t, cn, ct, nl, k, cm in cur.fetchall():
        if t in tables:
            tables[t]['cols'].append({'name': cn, 'type': ct, 'null': nl == 'YES', 'pk': k == 'PRI', 'comment': cm or ''})
    cur.execute("SELECT table_name, column_name, referenced_table_name FROM information_schema.key_column_usage "
                "WHERE table_schema=%s AND referenced_table_name IS NOT NULL", (schema,))
    real = {(t, c): rt for t, c, rt in cur.fetchall()}
    for t in tables:
        cur.execute(f'SELECT COUNT(*) FROM `{t}`')
        tables[t]['rows'] = cur.fetchone()[0]
    conn.close()
    return tables, real


def infer_relations(tables, real):
    """[(from_t, from_c, to_t, real?)] — to_t 는 PK 쪽."""
    pk_owner = {}
    for t, v in tables.items():
        pks = [c['name'] for c in v['cols'] if c['pk']]
        if len(pks) == 1:
            pk_owner.setdefault(pks[0], []).append(t)
    # PK 이름이 여러 테이블에서 겹치면(profile_image_sq 등) 추론 대상에서 뺀다
    unique = {k: v[0] for k, v in pk_owner.items() if len(v) == 1}
    rels = []
    for t, v in tables.items():
        for c in v['cols']:
            n = c['name']
            if (t, n) in real:
                if real[(t, n)] != 'tbl_common_code_c':
                    rels.append((t, n, real[(t, n)], True))
                continue
            if c['pk'] or not n.endswith('_sq'):
                continue
            # 가장 긴 PK 이름과 접미 일치(receiver_user_sq → user_sq, parent_area_code_sq → area_code_sq)
            best = max((k for k in unique if n == k or n.endswith('_' + k)), key=len, default=None)
            if best and not (unique[best] == t and n == best):
                rels.append((t, n, unique[best], False))
    return rels


# ────────────────────────────── 그리기 도구
class Doc:
    def __init__(self):
        self.pdf = fitz.open()
        self.fonts = {k: fitz.Font(fontfile=os.path.join(FONT_DIR, f)) for k, f in FONTS.items()}

    def page(self):
        p = self.pdf.new_page(width=PAGE_W, height=PAGE_H)
        for k, f in FONTS.items():
            p.insert_font(fontname=k, fontfile=os.path.join(FONT_DIR, f))
        return p

    def w(self, text, font, size):
        return self.fonts[font].text_length(text, fontsize=size)


def text(p, x, y, s, font='ko', size=9, color=INK):
    p.insert_text((x, y), s, fontname=font, fontsize=size, color=color)


def rrect(p, r, fill=None, stroke=None, width=0.6, radius=0.06):
    p.draw_rect(r, color=stroke, fill=fill, width=width, radius=radius)


def badge(p, doc, x, y, label, color, size=5.5):
    w = doc.w(label, 'monob', size) + 5
    rrect(p, fitz.Rect(x, y - size - 1.5, x + w, y + 2), fill=color, radius=0.25)
    text(p, x + 2.5, y, label, 'monob', size, (1, 1, 1))
    return w


def mix(c, t=0.85):
    return tuple(a + (1 - a) * t for a in c)


# ────────────────────────────── 테이블 카드(관계도용)
ROW = 11.5
HEAD = 17


def card_size(doc, v, ghost):
    cols = [c for c in v['cols'] if c['pk']] if ghost else v['cols']
    namew = max(doc.w(c['name'], 'mono', 7) for c in cols)
    typew = 0 if ghost else max(doc.w(c['type'], 'mono', 6.3) for c in cols)
    headw = doc.w(v['name'], 'monob', 8) + doc.w(f"{v['rows']:,}행", 'ko', 6) + 18
    return max(namew + typew + 58, headw), HEAD + ROW * len(cols) + 4


def draw_card(p, doc, x, y, v, color, fk_cols, ghost=False):
    w, h = v['w'], v['h']
    cols = [c for c in v['cols'] if c['pk']] if ghost else v['cols']
    body = fitz.Rect(x, y, x + w, y + h)
    rrect(p, body, fill=(1, 1, 1) if not ghost else (0.97, 0.97, 0.98), stroke=color if not ghost else LINE,
          width=0.9 if not ghost else 0.6, radius=0.03)
    head = fitz.Rect(x, y, x + w, y + HEAD)
    p.draw_rect(head, color=None, fill=color if not ghost else mix(color, 0.7), width=0)
    text(p, x + 5, y + 11.8, v['name'], 'monob', 8, (1, 1, 1))
    rows = f"{v['rows']:,}행"
    text(p, x + w - doc.w(rows, 'ko', 6) - 5, y + 11.5, rows, 'ko', 6, (1, 1, 1))
    rowpos = {}
    for i, c in enumerate(cols):
        ry = y + HEAD + ROW * i
        if i % 2:
            p.draw_rect(fitz.Rect(x + 0.5, ry, x + w - 0.5, ry + ROW), color=None, fill=(0.975, 0.975, 0.98), width=0)
        bx = x + 4
        if c['pk']:
            badge(p, doc, bx, ry + 8.3, 'PK', PK_C)
        elif c['name'] in fk_cols:
            badge(p, doc, bx, ry + 8.3, 'FK', FK_C)
        elif c['name'].endswith('_cd'):
            badge(p, doc, bx, ry + 8.3, 'CD', CD_C)
        text(p, x + 22, ry + 8.4, c['name'], 'mono', 7, INK if not c['null'] else MUTED)
        if not ghost:
            tw = doc.w(c['type'], 'mono', 6.3)
            text(p, x + w - tw - 5, ry + 8.2, c['type'], 'mono', 6.3, MUTED)
        rowpos[c['name']] = ry + ROW / 2
    return rowpos


# ────────────────────────────── 영역 관계도
def layout_domain(doc, tables, names, ghosts, ext_refs):
    """열 단위 masonry. 가장 긴 테이블부터 가장 낮은 열에 쌓는다. 참조 박스는 맨 오른쪽 열."""
    for n in names + ghosts:
        tables[n]['name'] = n
        tables[n]['w'], tables[n]['h'] = card_size(doc, tables[n], n in ghosts)
    gap_x, gap_y = 46, 18
    order = sorted(names, key=lambda n: -tables[n]['h'])
    avail_h = PAGE_H - 2 * MARGIN - 70
    total_h = sum(tables[n]['h'] + gap_y for n in names)
    ncol = max(1, min(len(names), -(-int(total_h) // int(avail_h)) + 1))
    cols = [[] for _ in range(ncol)]
    heights = [0] * ncol
    for n in order:
        i = heights.index(min(heights))
        cols[i].append(n)
        heights[i] += tables[n]['h'] + gap_y
    # 다른 영역을 많이 참조하는 열일수록 오른쪽(흐린 참조 박스 쪽)에 둔다 — 긴 선이 다른 카드를 가로지르지 않게
    cols.sort(key=lambda c: sum(ext_refs.get(n, 0) for n in c))
    pos, x = {}, 0
    for c in cols:
        y = 0
        for n in c:
            pos[n] = (x, y)
            y += tables[n]['h'] + gap_y
        x += max(tables[n]['w'] for n in c) + gap_x
    if ghosts:
        y = 0
        for n in ghosts:
            pos[n] = (x + 20, y)
            y += tables[n]['h'] + gap_y
        x += 20 + max(tables[n]['w'] for n in ghosts)
    width = x - (0 if ghosts else gap_x)
    height = max([pos[n][1] + tables[n]['h'] for n in pos])
    return pos, width, height


def draw_domain_page(doc, tables, rels, dom, page_no):
    _, title, color, names = dom
    names = [n for n in names if n in tables]
    inside = set(names)
    # 이 영역 테이블이 '참조하는' 관계만 선으로 그린다. 바깥에서 '참조받는' 관계는 그쪽 영역 쪽에 이미
    # 그려지므로 여기선 하단 목록으로만 적는다(tbl_user_m 처럼 17곳에서 참조되는 허브가 선으로 뒤덮이지 않게).
    my_rels = [r for r in rels if r[0] in inside]
    ghosts = sorted({r[2] for r in my_rels if r[2] not in inside})
    incoming = {}
    for f, _, t, _ in rels:
        if t in inside and f not in inside:
            incoming.setdefault(t, set()).add(f)
    notes = [f"{t}  ←  {', '.join(sorted(fs))}" for t, fs in sorted(incoming.items(), key=lambda x: -len(x[1]))]
    note_lines = []
    for n in notes:  # 너무 길면 줄바꿈
        while doc.w(n, 'mono', 6.5) > PAGE_W - 2 * MARGIN - 20:
            cut = len(n)
            while doc.w(n[:cut], 'mono', 6.5) > PAGE_W - 2 * MARGIN - 20:
                cut = n.rfind(', ', 0, cut - 1)
            note_lines.append(n[:cut + 1])
            n = '      ' + n[cut + 2:]
        note_lines.append(n)
    band = (16 + 10 * len(note_lines)) if note_lines else 0
    ext_refs = {}
    for f, _, t, _ in my_rels:
        if t not in inside:
            ext_refs[f] = ext_refs.get(f, 0) + 1
    pos, lw, lh = layout_domain(doc, tables, names, ghosts, ext_refs)
    top = MARGIN + 58
    S = min(1.6, (PAGE_W - 2 * MARGIN) / lw, (PAGE_H - top - MARGIN - 14 - band) / lh)

    p = doc.page()
    header(p, doc, title, f'{len(names)}개 테이블 · 이 영역에서 나가는 관계 {len(my_rels)}개 · 흐린 박스는 다른 영역 테이블(PK만 표시)',
           color, page_no)
    ox = MARGIN + (PAGE_W - 2 * MARGIN - lw * S) / 2
    if note_lines:
        y = PAGE_H - MARGIN - 14 - band + 12
        text(p, MARGIN, y, f'다른 영역에서 이 영역을 참조 ({sum(len(v) for v in incoming.values())}건)', 'kob', 8, MUTED)
        for i, ln in enumerate(note_lines):
            text(p, MARGIN, y + 12 + 10 * i, ln, 'mono', 6.5, MUTED)

    fk_cols = {}
    for f, c, t, _ in rels:
        fk_cols.setdefault(f, set()).add(c)

    # 카드를 임시 페이지에 1배로 그리고 show_pdf_page 로 축소해 붙인다
    tmp = fitz.open()
    tp = tmp.new_page(width=lw + 4, height=lh + 4)
    for k, fname in FONTS.items():
        tp.insert_font(fontname=k, fontfile=os.path.join(FONT_DIR, fname))
    rowmap = {}
    # 선을 먼저(카드 아래로)
    anchors = {}
    for n in names + ghosts:
        x, y = pos[n]
        anchors[n] = (x, y, tables[n]['w'], tables[n]['h'])
    # 행 y 위치 계산(그리기 전에 알아야 선을 먼저 그릴 수 있다)
    for n in names + ghosts:
        x, y = pos[n]
        cols = [c for c in tables[n]['cols'] if c['pk']] if n in ghosts else tables[n]['cols']
        rowmap[n] = {c['name']: y + HEAD + ROW * i + ROW / 2 for i, c in enumerate(cols)}
    for f, c, t, is_real in my_rels:
        if f not in pos or t not in pos:
            continue
        fx, fy, fw, _ = anchors[f]
        tx, ty, tw, _ = anchors[t]
        y1 = rowmap[f].get(c, fy + HEAD / 2)
        pkname = next((cc['name'] for cc in tables[t]['cols'] if cc['pk']), None)
        y2 = rowmap[t].get(pkname, ty + HEAD / 2)
        lc = color if (f in inside and t in inside) else MUTED
        if f == t:  # 자기참조 — 오른쪽으로 고리
            x0 = fx + fw
            pts = [(x0, y1), (x0 + 24, y1), (x0 + 24, y2), (x0, y2)]
            draw_path(tp, pts, lc, is_real, curve=False)
            continue
        if fx + fw < tx:
            a, b = (fx + fw, y1), (tx, y2)
        elif tx + tw < fx:
            a, b = (fx, y1), (tx + tw, y2)
        else:  # 같은 열 — 오른쪽으로 돌아간다
            xr = max(fx + fw, tx + tw)
            a, b = (fx + fw, y1), (tx + tw, y2)
            draw_path(tp, [a, (xr + 18, y1), (xr + 18, y2), b], lc, is_real, curve=False)
            end_marks(tp, a, b, lc, right_in=True)
            continue
        draw_path(tp, [a, b], lc, is_real, curve=True)
        end_marks(tp, a, b, lc)
    for n in names + ghosts:
        x, y = pos[n]
        draw_card(tp, doc, x, y, tables[n], color if n in inside else dom_color(n), fk_cols.get(n, set()), ghost=n in ghosts)
    p.show_pdf_page(fitz.Rect(ox, top, ox + (lw + 4) * S, top + (lh + 4) * S), tmp, 0)
    return len(my_rels)


def dom_color(n):
    for _, _, c, ts in DOMAINS:
        if n in ts:
            return c
    return MUTED


def draw_path(p, pts, color, solid, curve):
    dashes = None if solid else '[3 2] 0'
    if curve and len(pts) == 2:
        (x1, y1), (x2, y2) = pts
        dx = (x2 - x1) * 0.5
        p.draw_bezier((x1, y1), (x1 + dx, y1), (x2 - dx, y2), (x2, y2), color=color, width=0.8, dashes=dashes)
    else:
        p.draw_polyline(pts, color=color, width=0.8, dashes=dashes)


def end_marks(p, a, b, color, right_in=False):
    # 다(N) 쪽: FK 끝에 작은 원, 1 쪽: PK 끝에 짧은 가로막대
    p.draw_circle(a, 1.8, color=color, fill=(1, 1, 1), width=0.8)
    bx, by = b
    p.draw_line((bx, by - 3.5), (bx, by + 3.5), color=color, width=1.1)


def header(p, doc, title, sub, color, page_no):
    p.draw_rect(fitz.Rect(MARGIN, MARGIN, MARGIN + 6, MARGIN + 30), color=None, fill=color)
    text(p, MARGIN + 14, MARGIN + 21, title, 'kob', 20)
    text(p, MARGIN + 14, MARGIN + 42, sub, 'ko', 9, MUTED)
    foot = f'freelancer_project ERD · {STAMP}'
    text(p, MARGIN, PAGE_H - 18, foot, 'ko', 7, MUTED)
    text(p, PAGE_W - MARGIN - 20, PAGE_H - 18, str(page_no), 'ko', 7, MUTED)


# ────────────────────────────── 표지·개요·명세
def cover(doc, tables, rels, toc):
    p = doc.page()
    text(p, MARGIN + 20, 150, f'ERD · {STAMP} 스냅샷', 'kob', 11, PK_C)
    text(p, MARGIN + 20, 210, 'freelancer_project', 'monob', 44)
    text(p, MARGIN + 20, 262, '데이터베이스 관계도', 'kob', 34)
    text(p, MARGIN + 20, 300, '운영 DB 의 information_schema 를 직접 읽어 만들었다. 영역별로 한 장씩 나눴고,'
         ' 다른 영역 테이블은 흐린 참조 박스로만 보인다.', 'ko', 11, MUTED)
    stats = [(len(tables), '테이블'), (len(rels), '관계선'), (sum(v['rows'] for v in tables.values()), '총 행수'),
             (sum(1 for r in rels if r[3]), '실제 FK')]
    x = MARGIN + 20
    for n, label in stats:
        s = f'{n:,}'
        text(p, x, 380, s, 'monob', 30)
        text(p, x, 398, label, 'ko', 9, MUTED)
        x += doc.w(s, 'monob', 30) + 50
    # 범례
    y = 470
    text(p, MARGIN + 20, y, '범례', 'kob', 12)
    y += 22
    for lab, col, desc in [('PK', PK_C, '기본키'), ('FK', FK_C, '다른 테이블을 가리키는 컬럼(실제 FK 또는 이름 규칙으로 추론)'),
                           ('CD', CD_C, '공통코드(tbl_common_code_c) 값 — 선은 생략')]:
        badge(p, doc, MARGIN + 20, y, lab, col, 7)
        text(p, MARGIN + 44, y, desc, 'ko', 9)
        y += 18
    p.draw_line((MARGIN + 20, y), (MARGIN + 60, y), color=INK, width=0.9)
    text(p, MARGIN + 70, y + 3, '실선 = DB 에 실제 FOREIGN KEY 가 걸린 관계', 'ko', 9)
    y += 16
    p.draw_line((MARGIN + 20, y), (MARGIN + 60, y), color=INK, width=0.9, dashes='[3 2] 0')
    text(p, MARGIN + 70, y + 3, '점선 = 컬럼명(xxx_sq → PK xxx_sq)으로 추론한 논리 관계', 'ko', 9)
    y += 16
    text(p, MARGIN + 20, y + 3, '○ 쪽이 N(참조하는 쪽), | 쪽이 1(참조되는 PK). 회색 컬럼명은 NULL 허용.', 'ko', 9)
    # 목차
    x0, y = PAGE_W / 2 + 60, 470
    text(p, x0, y, '목차', 'kob', 12)
    y += 22
    for label, pg in toc:
        text(p, x0, y, label, 'ko', 10)
        s = str(pg)
        text(p, PAGE_W - MARGIN - 40 - doc.w(s, 'mono', 10), y, s, 'mono', 10, MUTED)
        p.draw_line((x0 + doc.w(label, 'ko', 10) + 6, y - 3), (PAGE_W - MARGIN - 48, y - 3), color=LINE, width=0.4,
                    dashes='[1 2] 0')
        y += 18


def overview(doc, tables, rels, page_no):
    p = doc.page()
    header(p, doc, '영역 개요', '영역 간 관계 수. 숫자는 A 영역 테이블이 B 영역 테이블을 참조하는 관계 개수다.', INK, page_no)
    dom_of = {t: d[0] for d in DOMAINS for t in d[3]}
    boxes = {}
    cols = 3
    bw, bh = 300, 190
    gx = (PAGE_W - 2 * MARGIN - cols * bw) / (cols - 1)
    for i, (k, title, color, ts) in enumerate(DOMAINS):
        r, c = divmod(i, cols)
        x = MARGIN + c * (bw + gx)
        y = MARGIN + 90 + r * (bh + 150)
        rect = fitz.Rect(x, y, x + bw, y + bh)
        boxes[k] = rect
    # 선 먼저
    cross = {}
    for f, _, t, _ in rels:
        a, b = dom_of.get(f), dom_of.get(t)
        if a and b and a != b:
            cross[(a, b)] = cross.get((a, b), 0) + 1
    done = set()
    for (a, b), cnt in sorted(cross.items(), key=lambda x: -x[1]):
        ra, rb = boxes[a], boxes[b]
        pa, pb = (ra.x0 + ra.x1) / 2, (rb.x0 + rb.x1) / 2
        ca, cb = ((ra.y0 + ra.y1) / 2), ((rb.y0 + rb.y1) / 2)
        off = 8 if (b, a) in done else -8
        done.add((a, b))
        p.draw_line((pa + off, ca + off), (pb + off, cb + off), color=mix(INK, 0.55), width=0.6 + cnt * 0.35)
        mx, my = (pa + pb) / 2 + off, (ca + cb) / 2 + off
        s = f'{cnt}'
        rrect(p, fitz.Rect(mx - 9, my - 7, mx + 9, my + 6), fill=(1, 1, 1), stroke=LINE, radius=0.4)
        text(p, mx - doc.w(s, 'monob', 7.5) / 2, my + 2.5, s, 'monob', 7.5)
    for k, title, color, ts in DOMAINS:
        rect = boxes[k]
        rrect(p, rect, fill=(1, 1, 1), stroke=color, width=1.4, radius=0.05)
        p.draw_rect(fitz.Rect(rect.x0, rect.y0, rect.x1, rect.y0 + 26), color=None, fill=color)
        text(p, rect.x0 + 10, rect.y0 + 18, title, 'kob', 11, (1, 1, 1))
        y = rect.y0 + 42
        for t in ts[:12]:
            if t in tables:
                text(p, rect.x0 + 10, y, t, 'mono', 7.5)
                s = f"{tables[t]['rows']:,}"
                text(p, rect.x1 - 10 - doc.w(s, 'mono', 7), y, s, 'mono', 7, MUTED)
                y += 12


def spec_pages(doc, tables, rels, start_no):
    """테이블 명세 — 영역 순서대로, 두 단 흐름."""
    fk_to = {}
    for f, c, t, _ in rels:
        fk_to[(f, c)] = t
    order = [(d, t) for d in DOMAINS for t in d[3] if t in tables]
    order += [(None, t) for t in tables if not any(t in d[3] for d in DOMAINS)]
    colw = (PAGE_W - 2 * MARGIN - 24) / 2
    page_no = start_no
    p, col, y = None, 0, 0
    top = MARGIN + 60

    def new_page():
        nonlocal p, col, y, page_no
        p = doc.page()
        header(p, doc, '테이블 명세', '컬럼 · 타입 · NULL · 설명. FK 는 참조 대상 테이블을 함께 적었다.', INK, page_no)
        page_no += 1
        col, y = 0, top

    new_page()
    for d, t in order:
        v = tables[t]
        h = 22 + 12 * len(v['cols']) + (12 if v['comment'] else 0) + 14
        if y + h > PAGE_H - MARGIN - 20:
            if col == 0:
                col, y = 1, top
            else:
                new_page()
        x = MARGIN + col * (colw + 24)
        color = d[2] if d else MUTED
        rrect(p, fitz.Rect(x, y, x + colw, y + h - 14), stroke=LINE, fill=(1, 1, 1), radius=0.02)
        p.draw_rect(fitz.Rect(x, y, x + colw, y + 20), color=None, fill=mix(color, 0.82))
        text(p, x + 8, y + 14, t, 'monob', 9)
        tag = f"{d[1] if d else '기타'} · {v['rows']:,}행"
        text(p, x + colw - 8 - doc.w(tag, 'ko', 7), y + 13.5, tag, 'ko', 7, MUTED)
        yy = y + 22
        if v['comment']:
            text(p, x + 8, yy + 8, v['comment'][:90], 'ko', 7, MUTED)
            yy += 12
        for c in v['cols']:
            if c['pk']:
                badge(p, doc, x + 8, yy + 8.5, 'PK', PK_C)
            elif (t, c['name']) in fk_to:
                badge(p, doc, x + 8, yy + 8.5, 'FK', FK_C)
            elif c['name'].endswith('_cd'):
                badge(p, doc, x + 8, yy + 8.5, 'CD', CD_C)
            text(p, x + 26, yy + 8.5, c['name'], 'mono', 7)
            text(p, x + 205, yy + 8.5, c['type'][:22], 'mono', 6.5, MUTED)
            text(p, x + 305, yy + 8.5, '' if c['null'] else 'NN', 'mono', 6.5, MUTED)
            desc = c['comment']
            if (t, c['name']) in fk_to:
                desc = f"→ {fk_to[(t, c['name'])]}" + (f'  {desc}' if desc else '')
            maxw = colw - 330
            while desc and doc.w(desc, 'ko', 6.8) > maxw:
                desc = desc[:-2] + '…' if not desc.endswith('…') else desc[:-2] + '…'
            text(p, x + 325, yy + 8.5, desc, 'ko', 6.8)
            yy += 12
        y += h
    return page_no


STAMP = datetime.now().strftime('%Y-%m-%d')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=None)
    ap.add_argument('--dev', action='store_true')
    a = ap.parse_args()
    schema = dbconfig.DEVELOP if a.dev else dbconfig.PROD
    tables, real = load_schema(schema)
    rels = infer_relations(tables, real)
    known = {t for d in DOMAINS for t in d[3]}
    extra = [t for t in tables if t not in known]
    if extra:
        DOMAINS.append(('etc', '기타', MUTED, extra))
    doc = Doc()
    # 목차용 쪽번호: 1 표지, 2 개요, 3~ 영역, 그 뒤 명세
    toc = [('영역 개요', 2)] + [(d[1], 3 + i) for i, d in enumerate(DOMAINS)] + [('테이블 명세', 3 + len(DOMAINS))]
    cover(doc, tables, rels, toc)
    overview(doc, tables, rels, 2)
    for i, d in enumerate(DOMAINS):
        draw_domain_page(doc, tables, rels, d, 3 + i)
    spec_pages(doc, tables, rels, 3 + len(DOMAINS))
    out = a.out or os.path.join(HERE, '..', 'Phase2_DB', f'{schema} ERD ({STAMP}).pdf')
    doc.pdf.save(out, garbage=4, deflate=True)
    print(f'{out}  — {len(doc.pdf)}쪽, 테이블 {len(tables)}, 관계 {len(rels)}(실제 FK {sum(r[3] for r in rels)})')


if __name__ == '__main__':
    main()
