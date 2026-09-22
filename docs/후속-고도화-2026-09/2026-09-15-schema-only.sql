CREATE TABLE `tbl_address_s` (
  `address_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `zonecode` bigint(20) DEFAULT NULL COMMENT 'API 반환값',
  `address` varchar(200) DEFAULT NULL COMMENT 'API 반환값',
  `detail_address` varchar(100) DEFAULT NULL COMMENT '사용자 직접 입력',
  `sigungu` varchar(50) NOT NULL COMMENT 'API 반환값',
  `latitude` decimal(10,7) NOT NULL COMMENT 'API 반환값',
  `longitude` decimal(10,7) NOT NULL COMMENT 'API 반환값',
  `address_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일시',
  `address_modified_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일시',
  `area_code_sq` bigint(20) NOT NULL COMMENT '지역 코드 순번',
  PRIMARY KEY (`address_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=667 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_area_c` (
  `area_code_sq` bigint(20) NOT NULL COMMENT '지역 코드 순번',
  `area_sigungu` varchar(30) NOT NULL COMMENT '시/군/구',
  `parent_area_code_sq` bigint(20) DEFAULT NULL COMMENT '상위 지역 코드 순번',
  PRIMARY KEY (`area_code_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_board_answer_attachment_s` (
  `board_answer_attachment_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `answer_sq` bigint(20) NOT NULL COMMENT '답변 게시판 순번',
  `file_sq` bigint(20) NOT NULL COMMENT '파일 순번',
  PRIMARY KEY (`board_answer_attachment_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_board_answer_s` (
  `answer_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `board_sq` bigint(20) NOT NULL COMMENT '게시판 순번',
  `answer_ttl` varchar(100) NOT NULL COMMENT '제목',
  `answer_description_edt` longtext NOT NULL COMMENT '내용',
  `answer_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일자',
  `answer_modified_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일자',
  `answer_view_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '조회수',
  `answer_comment_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '댓글수',
  `answer_recommend_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '추천수',
  `answer_is_adopted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '채택여부 / Y 또는 N',
  `answer_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제여부 / Y 또는 N',
  PRIMARY KEY (`answer_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=322 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_board_attachment_s` (
  `board_attachment_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `board_sq` bigint(20) NOT NULL COMMENT '게시판 순번',
  `file_sq` bigint(20) NOT NULL COMMENT '파일 순번',
  PRIMARY KEY (`board_attachment_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_board_comment_s` (
  `comment_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `parent_comment_sq` bigint(20) DEFAULT NULL COMMENT '부모 댓글 순번 (NULL이면 일반 댓글, 값이 있으면 대댓글)',
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `board_sq` bigint(20) DEFAULT NULL COMMENT '게시판 순번',
  `answer_sq` bigint(20) DEFAULT NULL COMMENT '답변 게시판 순번 (Q&A 대응)',
  `comment_description_txt` varchar(500) NOT NULL COMMENT '내용',
  `comment_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일자',
  `comment_modified_at_dtm` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일자',
  `comment_recommend_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '추천수',
  `comment_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제여부 (Y/N)',
  `comment_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 1600',
  PRIMARY KEY (`comment_sq`),
  KEY `FK_comment_parent` (`parent_comment_sq`),
  CONSTRAINT `FK_comment_parent` FOREIGN KEY (`parent_comment_sq`) REFERENCES `tbl_board_comment_s` (`comment_sq`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2335 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_board_m` (
  `board_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `board_ttl` varchar(100) NOT NULL COMMENT '제목',
  `board_description_edt` longtext NOT NULL COMMENT '내용',
  `board_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일자',
  `board_modified_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일자',
  `board_view_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '조회수',
  `board_comment_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '댓글수',
  `board_recommend_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '추천수',
  `board_adopt_status_cd` bigint(20) NOT NULL COMMENT '공통코드 / 1500',
  `board_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부/ Y 또는 N',
  `board_typ` varchar(10) NOT NULL COMMENT '게시판 구분',
  `board_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 1400',
  `board_category_cd` bigint(20) DEFAULT NULL,
  `board_is_secret_yn` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`board_sq`),
  KEY `idx_board_type_category` (`board_type_cd`,`board_category_cd`,`board_is_deleted_yn`)
) ENGINE=InnoDB AUTO_INCREMENT=727 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_board_normal_tag_s` (
  `normal_tag_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `board_sq` bigint(20) DEFAULT NULL COMMENT '게시판 순번',
  `answer_sq` bigint(20) DEFAULT NULL COMMENT '답변 게시판 순번',
  `normal_tag_nm` varchar(50) NOT NULL COMMENT '태그 이름',
  `normal_tag_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 1700',
  PRIMARY KEY (`normal_tag_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_board_skill_tag_s` (
  `board_skill_tag_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `board_sq` bigint(20) DEFAULT NULL COMMENT '게시판 순번',
  `answer_sq` bigint(20) DEFAULT NULL COMMENT '답변 게시판 순번',
  `skill_tag_sq` bigint(20) NOT NULL COMMENT '기술 태그 순번',
  `skill_tag_nm` varchar(50) NOT NULL COMMENT '기술 태그  이름',
  `skill_tag_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 1800',
  PRIMARY KEY (`board_skill_tag_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=156 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_certificate_s` (
  `certificate_cd` bigint(20) NOT NULL COMMENT '자격증 코드 (jmcd)',
  `certificate_nm` varchar(100) NOT NULL COMMENT '자격증 이름 (jmfldnm)',
  `series_cd` bigint(20) DEFAULT NULL COMMENT '계열 코드 (seriescd)',
  `series_nm` varchar(100) DEFAULT NULL COMMENT '계열 이름 (seriesnm)',
  `obligation_field_cd` bigint(20) DEFAULT NULL COMMENT '분야 코드 (obligfldcd)',
  `obligation_field_nm` varchar(100) DEFAULT NULL COMMENT '분야 이름 (obligfldnm)',
  `middle_obligation_field_cd` bigint(20) DEFAULT NULL COMMENT '중분야 코드 (mdobligfldcd)',
  `middle_obligation_field_nm` varchar(100) DEFAULT NULL COMMENT '중분야 이름 (mdobligfldnm)',
  `qualification_group_cd` bigint(20) DEFAULT NULL COMMENT '자격구분 코드 (qualgbcd)',
  `qualification_group_nm` varchar(100) DEFAULT NULL COMMENT '자격구분 이름 (qualgbnm)',
  `created_at` datetime DEFAULT NULL COMMENT '저장 일시',
  PRIMARY KEY (`certificate_cd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_common_code_c` (
  `common_code_sq` bigint(20) NOT NULL COMMENT '공통 코드 순번',
  `parent_common_code_sq` bigint(20) DEFAULT NULL COMMENT '상위 공통 코드 순번',
  `common_code_lvl` int(11) NOT NULL COMMENT '공통 코드 레벨',
  `common_code_nm` varchar(100) NOT NULL COMMENT '공통 코드  이름',
  `common_code_english_nm` varchar(50) DEFAULT NULL COMMENT '공통 코드 영문 이름',
  `common_code_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일자',
  `common_code_updated_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일자',
  `common_code_is_active_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제여부 / Y 또는 N',
  PRIMARY KEY (`common_code_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_common_file_s` (
  `file_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `file_original_nm` varchar(255) NOT NULL COMMENT '사용자가 업로드한 파일명',
  `file_save_nm` varchar(255) NOT NULL COMMENT 'S3에 저장된 파일명(UUID)',
  `file_typ` varchar(100) DEFAULT NULL COMMENT '파일 MIME 타입',
  `file_size` bigint(20) DEFAULT NULL COMMENT '파일 크기',
  `file_upload_at` datetime DEFAULT current_timestamp() COMMENT '업로드 일시',
  `file_is_deleted_yn` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`file_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_company_application_h` (
  `company_application_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `company_sq` bigint(20) NOT NULL COMMENT '기업 순번',
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `company_application_greeting_txt` text NOT NULL COMMENT '인사말',
  `company_application_status_cd` bigint(20) NOT NULL COMMENT '공통코드 / 500',
  `company_application_read_at_dtm` datetime DEFAULT NULL COMMENT '열람일자',
  `company_application_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일자',
  `company_application_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '지원 취소 여부',
  `company_application_completed_at_dtm` datetime DEFAULT NULL,
  PRIMARY KEY (`company_application_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_company_member_r` (
  `company_member_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `company_sq` bigint(20) NOT NULL COMMENT '기업 순번',
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `company_member_join_dt` date NOT NULL COMMENT '입사일자',
  `company_member_leave_dt` date DEFAULT NULL COMMENT '퇴사일자',
  `company_member_status_cd` bigint(20) NOT NULL COMMENT '공통코드 / 400',
  `active_user_sq` bigint(20) GENERATED ALWAYS AS (case when `company_member_status_cd` = 401 then `user_sq` end) VIRTUAL COMMENT '재직 중(401)일 때만 user_sq, 아니면 NULL. 유니크 인덱스로 동시 재직을 막는다',
  PRIMARY KEY (`company_member_sq`),
  UNIQUE KEY `uq_active_member_per_user` (`active_user_sq`),
  CONSTRAINT `chk_member_leave_status` CHECK (`company_member_status_cd` = 401 and `company_member_leave_dt` is null or `company_member_status_cd` <> 401 and `company_member_leave_dt` is not null)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_company_profile_image_s` (
  `profile_image_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `company_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `file_sq` bigint(20) NOT NULL COMMENT '파일 순번',
  PRIMARY KEY (`profile_image_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_company_s` (
  `company_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `address_sq` bigint(20) DEFAULT NULL COMMENT '기업 주소지',
  `company_agreed_terms_yn` char(1) NOT NULL DEFAULT 'N' COMMENT 'Y 또는 N',
  `company_nm` varchar(50) NOT NULL COMMENT '기업명',
  `company_ceo_nm` varchar(30) DEFAULT NULL COMMENT '대표자명',
  `company_open_dt` date DEFAULT NULL COMMENT '개업일자',
  `company_url` varchar(255) DEFAULT NULL COMMENT '기업URL',
  `company_biz_num` varchar(20) DEFAULT NULL COMMENT '사업자등록번호',
  `company_is_recruiting_yn` char(1) NOT NULL DEFAULT 'N' COMMENT 'Y 또는 N',
  `company_greeting_txt` text DEFAULT NULL COMMENT '인사말',
  `company_view_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '조회수',
  `company_recruit_start_dtm` datetime DEFAULT NULL COMMENT '소속 모집 공고 시작 일시',
  `company_auth_status_cd` bigint(20) NOT NULL DEFAULT 2501 COMMENT '인증 상태 (2501: 미인증, 2502: 인증완료)',
  PRIMARY KEY (`company_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_company_tag_s` (
  `tag_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `company_sq` bigint(20) NOT NULL COMMENT '기업 프로필 순번',
  `tag_nm` varchar(50) NOT NULL COMMENT '태그 이름',
  PRIMARY KEY (`tag_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_faq_m` (
  `faq_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `answer_cn` longtext NOT NULL,
  `faq_created_at_dtm` datetime(6) NOT NULL,
  `faq_is_deleted_yn` varchar(1) DEFAULT NULL,
  `faq_modified_at_dtm` datetime(6) NOT NULL,
  `faq_type_cd` bigint(20) NOT NULL,
  `question_ttl` varchar(100) NOT NULL,
  PRIMARY KEY (`faq_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_notification_m` (
  `notification_sq` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '알림 순번',
  `receiver_user_sq` bigint(20) NOT NULL COMMENT '수신자 사용자 순번',
  `sender_user_sq` bigint(20) DEFAULT NULL COMMENT '발신자 사용자 순번 (시스템일 경우 NULL)',
  `notification_type_cd` bigint(20) NOT NULL COMMENT '알림 유형 공통코드 (2600계열)',
  `notification_content_txt` varchar(500) NOT NULL COMMENT '알림 메시지 내용',
  `notification_target_url` varchar(255) DEFAULT NULL COMMENT '클릭 시 이동할 페이지 URL',
  `notification_read_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '읽음 여부 (Y/N)',
  `notification_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '알림 생성 일시',
  `notification_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '알림 삭제 여부 (Y/N)',
  PRIMARY KEY (`notification_sq`),
  KEY `FK_notification_receiver` (`receiver_user_sq`),
  CONSTRAINT `FK_notification_receiver` FOREIGN KEY (`receiver_user_sq`) REFERENCES `tbl_user_m` (`user_sq`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=507 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='알림 마스터 테이블';

CREATE TABLE `tbl_project_application_h` (
  `project_application_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_sq` bigint(20) NOT NULL COMMENT '프로젝트 순번',
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `company_sq` bigint(20) DEFAULT NULL COMMENT '프로젝트 지원자 소속 기업 순번',
  `project_application_status_cd` bigint(20) NOT NULL COMMENT '공통 코드 순번',
  `project_application_member_type_cd` bigint(20) NOT NULL COMMENT '공통 코드 순번',
  `project_application_created_at_dtm` datetime NOT NULL COMMENT '지원 등록일',
  `selected_interview_dtm` datetime DEFAULT NULL COMMENT '선택 면접 일시 / 합격 시',
  `read_application_dtm` datetime DEFAULT NULL COMMENT '지원 열람 일자',
  PRIMARY KEY (`project_application_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=321 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_project_contract_type_s` (
  `contract_type_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_sq` bigint(20) NOT NULL COMMENT '프로젝트 순번',
  `contract_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 900',
  PRIMARY KEY (`contract_type_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=408 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_project_interview_time_slot_s` (
  `interview_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_sq` bigint(20) NOT NULL COMMENT '프로젝트 순번',
  `interview_available_dtm` datetime NOT NULL COMMENT '날짜 + 시간대',
  `interview_is_selected_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '인터뷰 선택 구분 / Y 또는 N',
  PRIMARY KEY (`interview_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=1645 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_project_m` (
  `project_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `company_sq` bigint(20) NOT NULL COMMENT '기업  순번',
  `address_sq` bigint(20) DEFAULT NULL COMMENT '상세 주소 순번 (Optional)',
  `subway_address_sq` bigint(20) DEFAULT NULL COMMENT '지하철역 주소 순번 (Optional)',
  `project_ttl` varchar(50) NOT NULL COMMENT '제목',
  `project_image_url` varchar(255) DEFAULT NULL COMMENT '프로젝트 이미지 URL',
  `project_developer_grade_cd` bigint(20) NOT NULL COMMENT '공통코드 / 700',
  `project_required_education_cd` bigint(20) NOT NULL COMMENT '공통코드 / 2100',
  `project_salary` bigint(20) NOT NULL COMMENT '단가',
  `project_salary_negotiable_yn` varchar(1) DEFAULT NULL,
  `project_start_dt` date NOT NULL COMMENT '프로젝트 수행 시작일',
  `project_end_dt` date DEFAULT NULL COMMENT '프로젝트 수행 종료일. NULL 이면 미정',
  `project_recruit_start_dt` date NOT NULL COMMENT '모집 시작일',
  `project_recruit_end_dt` date NOT NULL COMMENT '모집 종료일',
  `project_preference_txt` varchar(255) DEFAULT NULL COMMENT '우대사항',
  `project_description_txt` text NOT NULL COMMENT '상세 내용',
  `project_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일자',
  `project_modified_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일자',
  `project_candidate_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '지원자 수',
  `project_scrap_cnt` int(11) NOT NULL DEFAULT 0 COMMENT '스크랩 수',
  `project_is_notification_yn` varchar(1) DEFAULT NULL,
  `project_is_deleted_yn` varchar(1) DEFAULT NULL,
  `project_view_cnt` int(11) NOT NULL COMMENT '조회수',
  `project_activate_yn` varchar(1) DEFAULT NULL,
  `address_type_cd` bigint(20) NOT NULL DEFAULT 2701 COMMENT '주소 유형(2701: 상세주소, 2702: 지하철역)',
  `project_status` int(11) DEFAULT NULL,
  PRIMARY KEY (`project_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_project_preferred_skill_tag_s` (
  `preferred_skill_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_sq` bigint(20) NOT NULL COMMENT '프로젝트 순번',
  `skill_tag_sq` bigint(20) NOT NULL COMMENT '기술 태그 순번',
  `parent_skill_tag_sq` bigint(20) DEFAULT NULL COMMENT '상위 기술 태그 순번',
  `skill_tag_lvl` int(11) NOT NULL COMMENT '기술 태그  레벨.',
  `skill_tag_nm` varchar(50) NOT NULL COMMENT '기술 태그 이름',
  PRIMARY KEY (`preferred_skill_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=342 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_project_recruit_headcount_s` (
  `recruit_headcount_sq` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '모집 인원 순번',
  `project_sq` bigint(20) NOT NULL COMMENT '프로젝트 순번',
  `developer_grade_cd` bigint(20) DEFAULT NULL COMMENT '공통코드 700. NULL 이면 총원 모드',
  `headcount` int(11) DEFAULT NULL COMMENT '모집 인원. NULL 이면 인원 미정',
  PRIMARY KEY (`recruit_headcount_sq`),
  KEY `idx_project` (`project_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='공고별 모집 인원. 등급별 여러 행 또는 등급 NULL 단일 행';

CREATE TABLE `tbl_project_recruit_job_role_s` (
  `recruit_job_role_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_sq` bigint(20) NOT NULL COMMENT '프로젝트 순번',
  `recruit_job_position_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 1000',
  `recruit_job_position_nm` varchar(100) DEFAULT NULL COMMENT '직접 입력한 직군 이름. 공통코드 직군이면 NULL',
  PRIMARY KEY (`recruit_job_role_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=434 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_project_required_skill_tag_s` (
  `required_skill_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_sq` bigint(20) NOT NULL COMMENT '프로젝트 순번',
  `skill_tag_sq` bigint(20) NOT NULL COMMENT '기술 태그 순번',
  `parent_skill_tag_sq` bigint(20) DEFAULT NULL COMMENT '상위 기술 태그 순번',
  `skill_tag_lvl` int(11) NOT NULL COMMENT '기술 태그  레벨',
  `skill_tag_nm` varchar(50) NOT NULL COMMENT '기술 태그  이름',
  PRIMARY KEY (`required_skill_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=567 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_recommendation_s` (
  `recommendation_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `board_sq` bigint(20) DEFAULT NULL COMMENT '게시판 순번',
  `answer_sq` bigint(20) DEFAULT NULL COMMENT '답변 게시판 순번',
  `comment_sq` bigint(20) DEFAULT NULL COMMENT '댓글 순번',
  `recommendation_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 1900',
  `reply_comment_sq` bigint(20) DEFAULT NULL COMMENT '대댓글 순번',
  PRIMARY KEY (`recommendation_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_report_s` (
  `report_sq` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '신고 순번',
  `report_user_sq` bigint(20) NOT NULL COMMENT '신고자 사용자 순번',
  `report_target_type_cd` bigint(20) NOT NULL COMMENT '신고 대상 유형 코드 / 2000',
  `report_target_sq` bigint(20) NOT NULL COMMENT '신고 대상 PK ',
  `report_reason_cd` bigint(20) NOT NULL COMMENT '신고 사유 코드 / 2800',
  `report_content_txt` varchar(1000) DEFAULT NULL COMMENT '상세 신고 내용',
  `report_process_status_cd` bigint(20) NOT NULL DEFAULT 2901 COMMENT '처리 상태 코드 / 2900',
  `report_process_desc_edt` text DEFAULT NULL COMMENT '관리자 처리 상세 메모',
  `report_process_user_sq` bigint(20) DEFAULT NULL COMMENT '처리를 담당한 관리자 순번',
  `report_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '신고 등록 일시',
  `report_processed_at_dtm` datetime DEFAULT NULL COMMENT '신고 처리 완료 일시',
  PRIMARY KEY (`report_sq`),
  KEY `idx_report_target` (`report_target_type_cd`,`report_target_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='신고 관리 메인 테이블';

CREATE TABLE `tbl_resume_attachment_s` (
  `resume_attachment_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `file_sq` bigint(20) NOT NULL COMMENT '파일 순번',
  PRIMARY KEY (`resume_attachment_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_career_s` (
  `career_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `career_company_nm` varchar(50) NOT NULL COMMENT '회사명',
  `career_department_nm` varchar(50) NOT NULL COMMENT '부서',
  `career_position_nm` varchar(30) NOT NULL COMMENT '직급',
  `career_start_dt` date NOT NULL COMMENT '입사일자',
  `career_end_dt` date DEFAULT NULL COMMENT '퇴사일자 / 재직중일 수 있으므로 NULL 허용',
  PRIMARY KEY (`career_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_certification_s` (
  `certification_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `certificate_cd` bigint(20) NOT NULL COMMENT '자격증 코드 (jmcd)',
  `certification_nm` varchar(50) NOT NULL COMMENT '자격증 이름',
  `certification_issuer_nm` varchar(50) DEFAULT NULL COMMENT '발행 기관',
  PRIMARY KEY (`certification_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_education_s` (
  `education_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `education_school_nm` varchar(50) NOT NULL COMMENT '학교명',
  `education_major_nm` varchar(50) NOT NULL COMMENT '전공',
  `education_admission_dt` date NOT NULL COMMENT '입학일자',
  `education_graduation_dt` date DEFAULT NULL COMMENT '졸업일자 / 졸업 예정일 수 있으므로 NULL 허용',
  `education_status_cd` bigint(20) NOT NULL COMMENT '공통코드 / 1200',
  PRIMARY KEY (`education_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_m` (
  `resume_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `address_sq` bigint(20) NOT NULL COMMENT '이력서 주소지',
  `resume_ttl` varchar(100) NOT NULL COMMENT '제목',
  `resume_nm` varchar(30) NOT NULL COMMENT '이름',
  `resume_birth_dt` date NOT NULL COMMENT '생년월일',
  `resume_phone_num` varchar(20) NOT NULL COMMENT '전화번호',
  `resume_email` varchar(50) NOT NULL COMMENT '이메일',
  `resume_greeting_txt` text NOT NULL COMMENT '인사말',
  `resume_is_notification_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '알림 발신 여부 / Y 또는 N',
  `resume_is_representative_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '대표 이력서 여부 / Y 또는 N',
  `resume_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일자',
  `resume_modified_at_dtm` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일자',
  `resume_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부 / Y 또는 N',
  PRIMARY KEY (`resume_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_profile_image_s` (
  `profile_image_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `file_sq` bigint(20) NOT NULL COMMENT '파일 순번',
  PRIMARY KEY (`profile_image_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_project_history_s` (
  `project_history_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `project_history_client` varchar(50) NOT NULL COMMENT '고객',
  `project_history_type_cd` bigint(20) NOT NULL COMMENT '공통 코드 순번',
  `project_history_job_position_type_cd` bigint(20) NOT NULL COMMENT '공통 코드 순번',
  `project_history_task` varchar(50) NOT NULL COMMENT '구분',
  `project_history_start_dt` date NOT NULL COMMENT '프로젝트 시작일',
  `project_history_end_dt` date DEFAULT NULL COMMENT '프로젝트 종료일  / 진행 중일 수 있으므로 NULL 허용',
  PRIMARY KEY (`project_history_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_project_history_skill_tag_s` (
  `project_history_skill_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `project_history_sq` bigint(20) NOT NULL COMMENT '프로젝트 이력 순번',
  `skill_tag_sq` bigint(20) DEFAULT NULL COMMENT '기술 순번',
  `parent_skill_tag_sq` bigint(20) DEFAULT NULL COMMENT '상위 기술 태그 순번',
  `skill_tag_lvl` int(11) DEFAULT NULL COMMENT '기술 태그  레벨',
  `skill_tag_nm` varchar(50) NOT NULL COMMENT '기술 태그  이름',
  PRIMARY KEY (`project_history_skill_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=596 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_skill_tag_s` (
  `resume_skill_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `skill_tag_sq` bigint(20) NOT NULL COMMENT '기술 태그  순번',
  `parent_skill_tag_sq` bigint(20) DEFAULT NULL COMMENT '상위 기술 태그 순번',
  `skill_tag_lvl` int(11) NOT NULL COMMENT '기술 태그  레벨',
  `skill_tag_nm` varchar(50) NOT NULL COMMENT '기술 태그  이름',
  PRIMARY KEY (`resume_skill_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=316 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_resume_training_history_s` (
  `training_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `resume_sq` bigint(20) NOT NULL COMMENT '이력서 순번',
  `training_institution_nm` varchar(50) NOT NULL COMMENT '교육기관명',
  `training_program_nm` varchar(100) NOT NULL COMMENT '교육과정명',
  `training_start_dt` date NOT NULL COMMENT '수료시작일',
  `training_end_dt` date DEFAULT NULL COMMENT '수료종료일 /  진행 중일 수 있으므로 NULL 허용',
  PRIMARY KEY (`training_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_schedule_m` (
  `schedule_sq` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '일정 순번',
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `schedule_ttl` varchar(200) NOT NULL COMMENT '일정 제목',
  `schedule_cnt` text DEFAULT NULL COMMENT '일정 내용',
  `schedule_start_dtm` datetime NOT NULL COMMENT '일정 시작일시',
  `schedule_end_dtm` datetime NOT NULL COMMENT '일정 종료일시',
  `schedule_all_day_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '일정 종일 여부 / Y 또는 N',
  `schedule_type_cd` bigint(20) NOT NULL COMMENT '일정 유형 코드 (2401~2403)',
  `project_sq` bigint(20) DEFAULT NULL COMMENT '연관 프로젝트 순번',
  `schedule_created_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '일정 등록일시',
  `schedule_updated_dtm` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '일정 수정일시',
  PRIMARY KEY (`schedule_sq`),
  KEY `idx_schedule_user` (`user_sq`),
  KEY `fk_schedule_type` (`schedule_type_cd`),
  CONSTRAINT `fk_schedule_type` FOREIGN KEY (`schedule_type_cd`) REFERENCES `tbl_common_code_c` (`common_code_sq`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='일정 관리 마스터 테이블';

CREATE TABLE `tbl_scrap_s` (
  `scrap_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `company_sq` bigint(20) DEFAULT NULL COMMENT '기업 순번',
  `project_sq` bigint(20) DEFAULT NULL COMMENT '프로젝트 순번',
  `scrap_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 600',
  PRIMARY KEY (`scrap_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=248 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_skill_tag_c` (
  `skill_tag_sq` bigint(20) NOT NULL COMMENT '기술 코드 순번',
  `parent_skill_tag_sq` bigint(20) DEFAULT NULL COMMENT '상위 기술 코드 순번',
  `skill_tag_lvl` int(11) NOT NULL COMMENT '기술  레벨',
  `skill_tag_nm` varchar(50) NOT NULL COMMENT '기술  이름',
  `skill_tag_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일자',
  `skill_tag_updated_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일자',
  `skill_tag_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제여부 / Y 또는 N',
  PRIMARY KEY (`skill_tag_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_user_m` (
  `user_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `address_sq` bigint(20) DEFAULT NULL COMMENT '주소 순번',
  `user_id` varchar(30) NOT NULL COMMENT '사용자 ID',
  `user_email` varchar(50) NOT NULL COMMENT '로그인 이메일 *UNIQUE',
  `user_pw` varchar(255) DEFAULT NULL COMMENT '비밀번호 (소셜 로그인은 NULL 가능)',
  `user_nm` varchar(50) NOT NULL COMMENT '이름 또는 기업 담당자 이름',
  `user_nickname` varchar(20) NOT NULL,
  `user_gender_cd` bigint(20) DEFAULT NULL COMMENT '공통코드 / 100',
  `user_phone_num` varchar(20) NOT NULL COMMENT '휴대폰 번호',
  `user_birth_dt` date DEFAULT NULL COMMENT '생년월일',
  `user_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 300',
  `user_signup_type_cd` bigint(20) NOT NULL COMMENT '공통코드 / 200',
  `user_agreed_privacy_policy_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '개인정보 이용 동의 여부 / Y 또는 N',
  `user_created_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '가입일시',
  `user_modified_at_dtm` datetime NOT NULL DEFAULT current_timestamp() COMMENT '수정일시',
  `user_is_deleted_yn` char(1) NOT NULL DEFAULT 'N' COMMENT '탈퇴 여부 / Y 또는 N',
  `user_refresh_token` varchar(255) DEFAULT NULL COMMENT '리프레쉬 토큰',
  `user_is_activate_yn` char(1) NOT NULL DEFAULT 'Y' COMMENT '계정 활성화 여부',
  `social_id` varchar(100) DEFAULT NULL COMMENT '소셜 고유 식별값',
  PRIMARY KEY (`user_sq`),
  UNIQUE KEY `uk_user_nickname` (`user_nickname`)
) ENGINE=InnoDB AUTO_INCREMENT=278 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_user_online_s` (
  `access_log_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `access_log_connected_at_dtm` datetime NOT NULL COMMENT '접속일시',
  PRIMARY KEY (`access_log_sq`),
  KEY `user_sq` (`user_sq`),
  CONSTRAINT `tbl_user_online_s_ibfk_1` FOREIGN KEY (`user_sq`) REFERENCES `tbl_user_m` (`user_sq`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_user_profile_image_s` (
  `profile_image_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_sq` bigint(20) NOT NULL COMMENT '사용자 순번',
  `file_sq` bigint(20) NOT NULL COMMENT '파일 순번',
  PRIMARY KEY (`profile_image_sq`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tb_faq_m` (
  `faq_sq` bigint(20) NOT NULL AUTO_INCREMENT,
  `answer_cn` longtext NOT NULL,
  `faq_created_at_dtm` datetime(6) NOT NULL,
  `faq_is_deleted_yn` varchar(1) DEFAULT NULL,
  `faq_modified_at_dtm` datetime(6) NOT NULL,
  `faq_type_cd` bigint(20) NOT NULL,
  `question_ttl` varchar(100) NOT NULL,
  `show_yn` varchar(1) NOT NULL,
  PRIMARY KEY (`faq_sq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

