# -*- coding: utf-8 -*-
"""
docs/도구/ 스크립트들이 공유하는 DB 접속 설정.

핵심 규칙 (2026-09-01 부터)
  **기본 대상은 개발 DB(freelancer_develop) 다.**
  운영 DB(freelancer_project) 를 건드리려면 명령줄에 `--prod` 를 반드시 적어야 한다.
  실수로 운영에 붙는 사고를 없애려고 기본값을 뒤집었다.

새 스크립트에서 쓰는 법
    import os, sys, importlib.util
    HERE = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location('dbconfig', os.path.join(HERE, 'dbconfig.py'))
    dbconfig = importlib.util.module_from_spec(spec); spec.loader.exec_module(dbconfig)

    conn, schema = dbconfig.connect()   # sys.argv 를 읽어 대상을 정한다
"""
import os
import sys

# 접속 정보. 두 스키마 모두 같은 서버(192.168.2.104 의 mariadb 컨테이너)에 있다.
SERVER = dict(
    host='db.estsw.co.kr', port=3306, user='admin', password=os.environ['FREELANCER_DB_PW'],
    charset='utf8mb4',
)

PROD = 'freelancer_project'    # 실서버가 보는 스키마
DEVELOP = 'freelancer_develop'  # 로컬 개발이 보는 스키마 (PROD 의 사본)
LEGACY = 'freelancer_education'  # 2026-07-28 이관 전 원본. 읽기 참고용으로만 남아 있다.


def target_schema(argv=None) -> str:
    """명령줄에서 대상 스키마를 정한다. --prod 가 없으면 개발 DB."""
    argv = sys.argv if argv is None else argv
    if '--prod' in argv:
        return PROD
    if '--legacy' in argv:
        return LEGACY
    return DEVELOP


def config(schema: str = None, argv=None) -> dict:
    """pymysql.connect 에 그대로 넘길 수 있는 dict."""
    cfg = dict(SERVER)
    cfg['database'] = schema or target_schema(argv)
    return cfg


def connect(schema: str = None, argv=None, autocommit=False):
    """(conn, schema) 를 돌려준다. 운영 대상이면 경고 배너를 찍는다."""
    import pymysql
    schema = schema or target_schema(argv)
    banner(schema)
    cfg = config(schema)
    cfg['autocommit'] = autocommit
    return pymysql.connect(**cfg), schema


def banner(schema: str) -> None:
    if schema == PROD:
        print('=' * 62)
        print(' 🔴 대상이 운영 DB(freelancer_project) 다.')
        print('    실서버가 지금 이 스키마를 보고 있다. 백업 없이 쓰지 말 것:')
        print('    !python "C:/dev/Freelancer_Service/docs/도구/db-backup.py"')
        print('=' * 62)
    else:
        print(f'대상 스키마: {schema}  (운영에 적용하려면 --prod)')
