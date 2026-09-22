# -*- coding: utf-8 -*-
"""
docs/seed-community-best.sql 을 원격 DB에 적용하는 실행 스크립트.

사용법(사용자 세션에서 직접 실행):
    !python "C:/dev/Freelancer_Service/docs/seed-community-best-run.py"

동작:
  1) seed-community-best.sql 을 읽어 주석/빈 줄 제거 후 문장 단위로 실행
  2) 커밋
  3) '[시연]' 게시글을 점수순으로 재조회하여 결과 검증 출력
"""
import os
import pymysql

HERE = os.path.dirname(os.path.abspath(__file__))
SQL_PATH = os.path.join(HERE, 'seed-community-best.sql')

DB = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    database='freelancer_education', charset='utf8mb4', autocommit=False,
)


def load_statements(path):
    lines = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            s = line.strip()
            if s.startswith('--') or s == '':
                continue
            lines.append(line)
    body = ''.join(lines)
    return [st.strip() for st in body.split(';') if st.strip()]


def main():
    statements = load_statements(SQL_PATH)
    conn = pymysql.connect(**DB)
    try:
        with conn.cursor() as cur:
            for st in statements:
                cur.execute(st)
                print(f'[OK] {st.splitlines()[0][:60]} ...  (rows={cur.rowcount})')
        conn.commit()
        print('\n=== 커밋 완료. 시연 게시글 점수순 검증 ===')
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            cur.execute(
                "SELECT board_sq, board_type_cd, board_ttl, "
                "(board_view_cnt + board_comment_cnt*2 + board_recommend_cnt*3) AS score, "
                "board_created_at_dtm "
                "FROM TBL_BOARD_M WHERE board_ttl LIKE '[시연]%' ORDER BY score DESC"
            )
            for r in cur.fetchall():
                print(r)
    except Exception as e:
        conn.rollback()
        print('[ROLLBACK] 오류로 롤백했습니다:', e)
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()
