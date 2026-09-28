# 사용: python docs/도구/apply-sql-prod.py <sql파일>  — 운영(freelancer_project)에 UPDATE 문을 한 트랜잭션으로 실행. FREELANCER_DB_PW 필요
import sys, importlib.util
sys.stdout.reconfigure(encoding='utf-8')
spec = importlib.util.spec_from_file_location('dbconfig', r'C:/dev/Freelancer_Service/docs/도구/dbconfig.py')
db = importlib.util.module_from_spec(spec); spec.loader.exec_module(db)
import pymysql
conn = pymysql.connect(**db.config(db.PROD)); cur = conn.cursor()
stmts = [l for l in open(sys.argv[1], encoding='utf-8').read().splitlines() if l.startswith('UPDATE')]
n = sum(cur.execute(s) for s in stmts)
conn.commit()
print(f'{len(stmts)}개 문 실행, {n}행 변경 (freelancer_project)')
