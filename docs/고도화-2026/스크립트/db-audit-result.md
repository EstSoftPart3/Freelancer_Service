# DB 이관 실사 결과

- 실행 시각: 2026-07-28 16:55:31
- 원본(SRC): `freelancer_education`  /  대상(DST): `freelancer_project`

- `freelancer_education` 존재 — charset=utf8mb4, collation=utf8mb4_general_ci
- `freelancer_project` 존재 — charset=utf8mb4, collation=utf8mb4_general_ci

## ① 테이블 목록

- `freelancer_education`: **90개**
- `freelancer_project`: **61개**

## ② 이름 충돌 (양쪽에 다 있는 테이블)

**59건.** 대상 쪽 행수가 0이면 덮어써도 무방, 0이 아니면 개별 판단 필요.

| 테이블 | SRC 행수 | DST 행수 | SRC MB | DST MB | DST AUTO_INC | 판정 |
|---|---:|---:|---:|---:|---:|---|
| `address` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `answer` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `areacd` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `board` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `boardattachment` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `boardattachmentresponse` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `career` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `comment` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `commonskilltag` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `companyapplication` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `normaltag` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `recommendation` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `resumeskilltag` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `scrap` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `skilltag` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `tbl_address_s` | 193 | 33 | 0.05 | 0.02 | 392 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_area_c` | 268 | 268 | 0.02 | 0.02 | None | 행수 동일 → 이미 이관됐을 가능성 |
| `tbl_board_answer_attachment_s` | 0 | 0 | 0.02 | 0.02 | 1 | DST 비어있음 → 덮어쓰기 가능 |
| `tbl_board_answer_s` | 9 | 2 | 0.02 | 0.02 | 46 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_board_attachment_s` | 12 | 2 | 0.02 | 0.02 | 19 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_board_comment_s` | 78 | 59 | 0.03 | 0.03 | 149 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_board_m` | 75 | 10 | 0.05 | 0.02 | 121 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_board_normal_tag_s` | 42 | 10 | 0.02 | 0.02 | 127 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_board_skill_tag_s` | 16 | 20 | 0.02 | 0.02 | 164 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_certificate_s` | 618 | 618 | 0.11 | 0.11 | None | 행수 동일 → 이미 이관됐을 가능성 |
| `tbl_common_code_c` | 156 | 149 | 0.02 | 0.02 | None | **DST에 데이터 있음 → 판단 필요** |
| `tbl_common_file_s` | 103 | 26 | 0.02 | 0.02 | 101 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_company_application_h` | 54 | 3 | 0.02 | 0.02 | 96 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_company_member_r` | 19 | 1 | 0.02 | 0.02 | 61 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_company_profile_image_s` | 5 | 4 | 0.02 | 0.02 | 31 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_company_s` | 28 | 6 | 0.02 | 0.02 | 39 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_company_tag_s` | 2 | 1 | 0.02 | 0.02 | 3 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_notification_m` | 497 | 67 | 0.13 | 0.03 | 476 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_project_application_h` | 77 | 1 | 0.02 | 0.02 | 134 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_project_contract_type_s` | 81 | 5 | 0.02 | 0.02 | 303 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_project_interview_time_slot_s` | 736 | 60 | 0.05 | 0.02 | 1317 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_project_m` | 41 | 2 | 0.02 | 0.02 | 113 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_project_preferred_skill_tag_s` | 81 | 2 | 0.02 | 0.02 | 347 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_project_recruit_job_role_s` | 63 | 2 | 0.02 | 0.02 | 340 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_project_required_skill_tag_s` | 128 | 13 | 0.02 | 0.02 | 472 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_recommendation_s` | 4 | 7 | 0.02 | 0.02 | 84 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_report_s` | 13 | 0 | 0.03 | 0.03 | 13 | DST 비어있음 → 덮어쓰기 가능 |
| `tbl_resume_attachment_s` | 4 | 2 | 0.02 | 0.02 | 9 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_career_s` | 21 | 2 | 0.02 | 0.02 | 38 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_certification_s` | 22 | 7 | 0.02 | 0.02 | 30 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_education_s` | 34 | 13 | 0.02 | 0.02 | 53 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_m` | 73 | 9 | 0.02 | 0.02 | 97 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_profile_image_s` | 6 | 3 | 0.02 | 0.02 | 8 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_project_history_s` | 31 | 3 | 0.02 | 0.02 | 54 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_project_history_skill_tag_s` | 305 | 33 | 0.05 | 0.02 | 423 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_skill_tag_s` | 179 | 86 | 0.02 | 0.02 | 238 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_resume_training_history_s` | 15 | 8 | 0.02 | 0.02 | 38 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_schedule_evnt` | 0 | 0 | 0.02 | 0.02 | 33 | DST 비어있음 → 덮어쓰기 가능 |
| `tbl_schedule_m` | 6 | 4 | 0.05 | 0.05 | 15 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_scrap_s` | 25 | 8 | 0.02 | 0.02 | 238 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_skill_tag_c` | 24 | 52 | 0.02 | 0.02 | None | **DST에 데이터 있음 → 판단 필요** |
| `tbl_user_m` | 56 | 20 | 0.02 | 0.02 | 146 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_user_online_s` | 2082 | 124 | 0.19 | 0.03 | 1921 | **DST에 데이터 있음 → 판단 필요** |
| `tbl_user_profile_image_s` | 12 | 6 | 0.02 | 0.02 | 38 | **DST에 데이터 있음 → 판단 필요** |

## ③ `freelancer_education`에만 있는 테이블 (이관 대상 후보)

31개.

| 테이블 | 행수 | MB | Engine | Collation | 비고 |
|---|---:|---:|---|---|---|
| `p2_tbl_apply_h` | 0 | 0.05 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_area_code_s` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_job_code_s` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_job_posting_m` | 0 | 0.03 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_resume_attachment_s` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_resume_career_s` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_resume_certificate_s` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_resume_education_s` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_resume_m` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_resume_selfintroduction_s` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_skill_code_resume_r` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p2_tbl_skill_code_s` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p3_tbl_board` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p3_tbl_board_answer` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p3_tbl_board_comment` | 0 | 0.05 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p3_tbl_enterprise_member_m` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `p3_tbl_member_m` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `tb_board` | 0 | 0.02 | InnoDB | utf8mb4_general_ci | **TBL_ 접두사 없음 → Hibernate 고아 테이블 의심** |
| `tbl_attendance_m` | 25 | 0.03 | InnoDB | utf8mb4_general_ci |  |
| `tbl_audit_log_m` | 183 | 0.11 | InnoDB | utf8mb4_general_ci |  |
| `tbl_banner_s` | 10 | 0.05 | InnoDB | utf8mb4_general_ci |  |
| `tbl_chatmessages_s` | 183 | 0.05 | InnoDB | utf8mb4_general_ci |  |
| `tbl_chatroom_s` | 18 | 0.06 | InnoDB | utf8mb4_general_ci |  |
| `tbl_freelancer_member` | 16 | 0.02 | InnoDB | utf8mb4_general_ci |  |
| `tbl_freelancer_profile_image_s` | 11 | 0.02 | InnoDB | utf8mb4_general_ci |  |
| `tbl_interview_s` | 10 | 0.02 | InnoDB | utf8mb4_general_ci |  |
| `tbl_point_history_m` | 22 | 0.05 | InnoDB | utf8mb4_general_ci |  |
| `tbl_point_m` | 5 | 0.03 | InnoDB | utf8mb4_general_ci |  |
| `tbl_point_policy_m` | 1 | 0.02 | InnoDB | utf8mb4_general_ci |  |
| `tbl_resume_link_s` | 19 | 0.02 | InnoDB | utf8mb4_general_ci |  |
| `tbl_sample` | 0 | 0.02 | InnoDB | utf8mb4_general_ci |  |

## ④ `freelancer_project`에만 있는 테이블 (기존 데이터 — 보존)

2개. **이관 작업이 이것들을 건드리지 않아야 한다.**

| 테이블 | 행수 | MB | Engine |
|---|---:|---:|---|
| `tb_faq_m` | 0 | 0.02 | InnoDB |
| `tbl_faq_m` | 26 | 0.03 | InnoDB |

## ⑤ 충돌 테이블 컬럼 스펙 차이

### `companyapplication`
- SRC에만: `companyApplicationCompletedAtDtm` datetime(6)

### `tbl_company_application_h`
- SRC에만: `company_application_completed_at_dtm` datetime

### `tbl_project_m`
- SRC에만: `project_status` int(11)


## ⑥ 외래키

- `freelancer_education`: 11건
  - `p2_tbl_apply_h.jbp_sq` → `p2_tbl_job_posting_m.jbp_sq` (FKdnpym3e4mwat4ij6t676dn9xj)
  - `p2_tbl_apply_h.rsm_sq` → `p2_tbl_resume_m.rsm_sq` (FKnrjig7u2bi0pln2l3qw39p30v)
  - `p2_tbl_job_posting_m.entrprs_sq` → `p3_tbl_enterprise_member_m.entrprs_sq` (FKel7cejqv4o39yp91p9se3jtws)
  - `p3_tbl_board_comment.entrprs_sq` → `p3_tbl_enterprise_member_m.entrprs_sq` (FK5fjm2p2ys73pfbnh680sbdt6r)
  - `p3_tbl_board_comment.brd_sq` → `p3_tbl_board.brd_sq` (FK1iai56rbmye8b7guuq0xy2fqb)
  - `tbl_board_comment_s.parent_comment_sq` → `tbl_board_comment_s.comment_sq` (FK_comment_parent)
  - `tbl_chatroom_s.project_sq` → `tbl_project_m.project_sq` (fk_chatroom_s_project)
  - `tbl_chatroom_s.company_sq` → `tbl_company_s.company_sq` (fk_chatroom_s_company)
  - `tbl_notification_m.receiver_user_sq` → `tbl_user_m.user_sq` (FK_notification_receiver)
  - `tbl_schedule_m.schedule_type_cd` → `tbl_common_code_c.common_code_sq` (fk_schedule_type)
  - `tbl_user_online_s.user_sq` → `tbl_user_m.user_sq` (tbl_user_online_s_ibfk_1)
- `freelancer_project`: 4건
  - `tbl_board_comment_s.parent_comment_sq` → `tbl_board_comment_s.comment_sq` (FK_comment_parent)
  - `tbl_notification_m.receiver_user_sq` → `tbl_user_m.user_sq` (FK_notification_receiver)
  - `tbl_schedule_m.schedule_type_cd` → `tbl_common_code_c.common_code_sq` (fk_schedule_type)
  - `tbl_user_online_s.user_sq` → `tbl_user_m.user_sq` (tbl_user_online_s_ibfk_1)

## ⑦ 이관 검증 기준값 (SRC 스냅샷)

이관 후 대상 DB에서 같은 값이 나와야 한다.

| 테이블 | 행수 | AUTO_INCREMENT |
|---|---:|---:|
| `address` | 0 | 1 |
| `answer` | 0 | 1 |
| `areacd` | 0 | 1 |
| `board` | 0 | 1 |
| `boardattachment` | 0 | 1 |
| `boardattachmentresponse` | 0 | 1 |
| `career` | 0 | 1 |
| `comment` | 0 | 1 |
| `commonskilltag` | 0 | 1 |
| `companyapplication` | 0 | 1 |
| `normaltag` | 0 | 1 |
| `p2_tbl_apply_h` | 0 | 1 |
| `p2_tbl_area_code_s` | 0 | 1 |
| `p2_tbl_job_code_s` | 0 | 1 |
| `p2_tbl_job_posting_m` | 0 | 1 |
| `p2_tbl_resume_attachment_s` | 0 | 1 |
| `p2_tbl_resume_career_s` | 0 | 1 |
| `p2_tbl_resume_certificate_s` | 0 | 1 |
| `p2_tbl_resume_education_s` | 0 | 1 |
| `p2_tbl_resume_m` | 0 | 1 |
| `p2_tbl_resume_selfintroduction_s` | 0 | 1 |
| `p2_tbl_skill_code_resume_r` | 0 | None |
| `p2_tbl_skill_code_s` | 0 | 1 |
| `p3_tbl_board` | 0 | 1 |
| `p3_tbl_board_answer` | 0 | 1 |
| `p3_tbl_board_comment` | 0 | 1 |
| `p3_tbl_enterprise_member_m` | 0 | 1 |
| `p3_tbl_member_m` | 0 | 1 |
| `recommendation` | 0 | 1 |
| `resumeskilltag` | 0 | 1 |
| `scrap` | 0 | 1 |
| `skilltag` | 0 | 1 |
| `tb_board` | 0 | 1 |
| `tbl_address_s` | 193 | 465 |
| `tbl_area_c` | 268 | None |
| `tbl_attendance_m` | 25 | 38 |
| `tbl_audit_log_m` | 183 | 219 |
| `tbl_banner_s` | 10 | 11 |
| `tbl_board_answer_attachment_s` | 0 | 1 |
| `tbl_board_answer_s` | 9 | 47 |
| `tbl_board_attachment_s` | 12 | 17 |
| `tbl_board_comment_s` | 78 | 86 |
| `tbl_board_m` | 75 | 144 |
| `tbl_board_normal_tag_s` | 42 | 112 |
| `tbl_board_skill_tag_s` | 16 | 156 |
| `tbl_certificate_s` | 618 | None |
| `tbl_chatmessages_s` | 183 | 184 |
| `tbl_chatroom_s` | 18 | 32 |
| `tbl_common_code_c` | 156 | None |
| `tbl_common_file_s` | 103 | 117 |
| `tbl_company_application_h` | 54 | 99 |
| `tbl_company_member_r` | 19 | 42 |
| `tbl_company_profile_image_s` | 5 | 24 |
| `tbl_company_s` | 28 | 46 |
| `tbl_company_tag_s` | 2 | 3 |
| `tbl_freelancer_member` | 16 | 18 |
| `tbl_freelancer_profile_image_s` | 11 | 14 |
| `tbl_interview_s` | 10 | 12 |
| `tbl_notification_m` | 497 | 502 |
| `tbl_point_history_m` | 22 | 34 |
| `tbl_point_m` | 5 | 8 |
| `tbl_point_policy_m` | 1 | 2 |
| `tbl_project_application_h` | 77 | 165 |
| `tbl_project_contract_type_s` | 81 | 279 |
| `tbl_project_interview_time_slot_s` | 736 | 1320 |
| `tbl_project_m` | 41 | 120 |
| `tbl_project_preferred_skill_tag_s` | 81 | 331 |
| `tbl_project_recruit_job_role_s` | 63 | 328 |
| `tbl_project_required_skill_tag_s` | 128 | 451 |
| `tbl_recommendation_s` | 4 | 65 |
| `tbl_report_s` | 13 | 14 |
| `tbl_resume_attachment_s` | 4 | 14 |
| `tbl_resume_career_s` | 21 | 62 |
| `tbl_resume_certification_s` | 22 | 45 |
| `tbl_resume_education_s` | 34 | 78 |
| `tbl_resume_link_s` | 19 | 32 |
| `tbl_resume_m` | 73 | 146 |
| `tbl_resume_profile_image_s` | 6 | 25 |
| `tbl_resume_project_history_s` | 31 | 84 |
| `tbl_resume_project_history_skill_tag_s` | 305 | 596 |
| `tbl_resume_skill_tag_s` | 179 | 316 |
| `tbl_resume_training_history_s` | 15 | 44 |
| `tbl_sample` | 0 | 1 |
| `tbl_schedule_evnt` | 0 | 33 |
| `tbl_schedule_m` | 6 | 15 |
| `tbl_scrap_s` | 25 | 248 |
| `tbl_skill_tag_c` | 24 | None |
| `tbl_user_m` | 56 | 142 |
| `tbl_user_online_s` | 2082 | 2804 |
| `tbl_user_profile_image_s` | 12 | 26 |

## ⑧ 공통코드 부모 코드 사용 현황 (Phase 1 선확인)

- `freelancer_education` 사용 중인 부모코드: 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100
- `freelancer_project` 사용 중인 부모코드: 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2400, 2500, 2600, 2700, 2800, 2900

→ 게시판 카테고리에 쓰려는 **1600대**가 비어 있는지 확인. 쓰이고 있으면 1700대로 이동.

## ⑨ 닉네임 백필 사전 점검 (Phase 1)

- 전체 회원: 56명 / user_id 고유값: 56개 → 중복 없음, 백필 안전
- user_id 최대 길이: 15자 → 닉네임 컬럼 VARCHAR(20)로 충분한지 확인
- 기존 닉네임 컬럼: 없음 (신규 추가 필요)

