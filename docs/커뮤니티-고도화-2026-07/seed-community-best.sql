-- ============================================================================
-- 커뮤니티 추천글/인기글 시현용 시드 데이터
-- ----------------------------------------------------------------------------
-- 대상 위젯: 커뮤니티 홈 베스트글(월간)/추천글(주간), 목록 페이지 인기글(지금/주간/월간)
-- 선정 기준(백엔드 findBestBoards): score = 조회수*1 + 댓글*2 + 추천*3,
--   지금인기=1일 / 주간인기=7일 / 월간인기=30일 이내, 삭제글 제외, score DESC.
--
-- ★ 핵심: 세 탭(지금/주간/월간)이 서로 다르게 보이도록 '작성일'을 기간대별로 분산한다.
--   - A그룹(오늘, 1일 이내)   → 지금인기/주간/월간 모두 노출
--   - B그룹(2~6일 전)         → 주간/월간에만 노출(지금인기에는 없음), 고득점으로 주간 상위 장악
--   - C그룹(12~26일 전)       → 월간에만 노출, 최고득점으로 월간 상위 장악
--   결과: 지금인기 top ≠ 주간인기 top ≠ 월간인기 top 으로 확연히 구분됨.
--
-- 식별/롤백: 제목에 '[시연]' 접두어. 정리: DELETE FROM TBL_BOARD_M WHERE board_ttl LIKE '[시연]%';
-- 반복 실행 안전: 먼저 기존 '[시연]%' 를 지운 뒤 다시 넣는다.
-- user_sq는 실제 존재하는 첫 사용자를 서브쿼리로 선택(하드코딩 금지).
-- ============================================================================

DELETE FROM TBL_BOARD_M WHERE board_ttl LIKE '[시연]%';

SET @seed_user := (SELECT user_sq FROM TBL_USER_M WHERE user_is_deleted_yn = 'N' ORDER BY user_sq LIMIT 1);

-- ----------------------------------------------------------------------------
-- A그룹: 오늘(1일 이내) — 지금인기 목록을 구성 (score = v + 2c + 3r)
-- ----------------------------------------------------------------------------
INSERT INTO TBL_BOARD_M
  (user_sq, board_ttl, board_description_edt, board_adopt_status_cd, board_typ, board_type_cd,
   board_view_cnt, board_comment_cnt, board_recommend_cnt, board_is_deleted_yn, board_created_at_dtm)
VALUES
  -- 지금인기 상위. score=630 / 580 / 498 / 398 / 306
  (@seed_user, '[시연] (오늘) 신입 개발자 포트폴리오 이렇게 준비했어요', '지금인기 시연.', 1501, 'normal', 1401,
   500, 20, 30, 'N', NOW() - INTERVAL 40 MINUTE),
  (@seed_user, '[시연] (오늘) JWT 리프레시 토큰 어디에 저장하나요?', '지금인기 시연(Q&A).', 1501, 'qna', 1402,
   460, 18, 28, 'N', NOW() - INTERVAL 80 MINUTE),
  (@seed_user, '[시연] (오늘) 코드리뷰 문화 정착시키는 현실적 방법', '지금인기 시연.', 1501, 'normal', 1401,
   400, 16, 22, 'N', NOW() - INTERVAL 3 HOUR),
  (@seed_user, '[시연] (오늘) CORS 에러 이렇게 해결하는 게 맞나요?', '지금인기 시연(Q&A).', 1501, 'qna', 1402,
   320, 12, 18, 'N', NOW() - INTERVAL 6 HOUR),
  (@seed_user, '[시연] (오늘) 재택근무 개발자의 하루 루틴 공유', '지금인기 시연.', 1501, 'normal', 1401,
   250, 10, 12, 'N', NOW() - INTERVAL 10 HOUR);

-- ----------------------------------------------------------------------------
-- B그룹: 2~6일 전 — 주간/월간에만 노출. 고득점으로 '주간인기' 상위를 장악
-- ----------------------------------------------------------------------------
INSERT INTO TBL_BOARD_M
  (user_sq, board_ttl, board_description_edt, board_adopt_status_cd, board_typ, board_type_cd,
   board_view_cnt, board_comment_cnt, board_recommend_cnt, board_is_deleted_yn, board_created_at_dtm)
VALUES
  -- score=1145 / 1023 / 874 / 698 / 532  (지금인기엔 안 뜨고 주간부터 등장)
  (@seed_user, '[시연] (이번주) N+1 문제 실무 해결법 총정리', '주간인기 상위 시연(Q&A).', 1501, 'qna', 1402,
   900, 40, 55, 'N', NOW() - INTERVAL 2 DAY),
  (@seed_user, '[시연] (이번주) 사이드 프로젝트 팀원 구합니다 (React/Spring)', '주간인기 상위 시연.', 1501, 'normal', 1401,
   820, 34, 45, 'N', NOW() - INTERVAL 3 DAY),
  (@seed_user, '[시연] (이번주) 트랜잭션 전파 옵션 선택 기준', '주간인기 시연(Q&A).', 1501, 'qna', 1402,
   700, 30, 38, 'N', NOW() - INTERVAL 4 DAY),
  (@seed_user, '[시연] (이번주) 주니어가 6개월 만에 이직 성공한 후기', '주간인기 시연.', 1501, 'normal', 1401,
   560, 24, 30, 'N', NOW() - INTERVAL 5 DAY),
  (@seed_user, '[시연] (이번주) 인덱스 설계, 복합 인덱스 순서 질문', '주간인기 시연(Q&A).', 1501, 'qna', 1402,
   430, 18, 22, 'N', NOW() - INTERVAL 6 DAY);

-- ----------------------------------------------------------------------------
-- C그룹: 12~26일 전 — 월간에만 노출. 최고득점으로 '월간인기' 상위를 장악
-- ----------------------------------------------------------------------------
INSERT INTO TBL_BOARD_M
  (user_sq, board_ttl, board_description_edt, board_adopt_status_cd, board_typ, board_type_cd,
   board_view_cnt, board_comment_cnt, board_recommend_cnt, board_is_deleted_yn, board_created_at_dtm)
VALUES
  -- score=1410 / 1248 / 950 / 754 / 568  (주간엔 안 뜨고 월간부터 등장)
  (@seed_user, '[시연] (이번달) 대규모 트래픽 대응 아키텍처 회고', '월간인기 최상위 시연.', 1501, 'normal', 1401,
   1100, 50, 70, 'N', NOW() - INTERVAL 12 DAY),
  (@seed_user, '[시연] (이번달) 배포 자동화 CI/CD 도입 전체 여정', '월간인기 상위 시연(Q&A).', 1501, 'qna', 1402,
   980, 44, 60, 'N', NOW() - INTERVAL 15 DAY),
  (@seed_user, '[시연] (이번달) 기술 블로그 1년 꾸준히 쓴 회고', '월간인기 시연.', 1501, 'normal', 1401,
   760, 32, 42, 'N', NOW() - INTERVAL 18 DAY),
  (@seed_user, '[시연] (이번달) 레거시 리팩터링 이렇게 접근했습니다', '월간인기 시연(Q&A).', 1501, 'qna', 1402,
   600, 26, 34, 'N', NOW() - INTERVAL 22 DAY),
  (@seed_user, '[시연] (이번달) 신입 때 알았으면 좋았을 것들', '월간인기 시연.', 1501, 'normal', 1401,
   450, 20, 26, 'N', NOW() - INTERVAL 26 DAY);

-- ============================================================================
-- 예상 결과(각 탭 상위):
--   지금인기(1일):  A그룹만 → top=630 (오늘 포트폴리오)
--   주간인기(7일):  A+B → top=1145 (이번주 N+1)          ← 지금인기와 다름
--   월간인기(30일): A+B+C → top=1410 (이번달 대규모 트래픽) ← 주간과 또 다름
--
-- 검증 조회:
--   SELECT board_ttl,
--          (board_view_cnt + board_comment_cnt*2 + board_recommend_cnt*3) AS score,
--          board_created_at_dtm
--   FROM TBL_BOARD_M WHERE board_ttl LIKE '[시연]%' ORDER BY board_created_at_dtm DESC;
-- ============================================================================
