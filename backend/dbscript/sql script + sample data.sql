USE freelancer_project;

DROP TABLE IF EXISTS TBL_BOARD_COMMENT_REPLY_S;
DROP TABLE IF EXISTS TBL_REPORT_H;
DROP TABLE IF EXISTS TBL_REPORT_S;
DROP TABLE IF EXISTS TBL_USER_MAP_FILTER_S;
DROP TABLE IF EXISTS TBL_BOARD_ANSWER_ATTACHMENT_S;
DROP TABLE IF EXISTS TBL_BOARD_NORMAL_TAG_S;
DROP TABLE IF EXISTS TBL_BOARD_ANSWER_S;
DROP TABLE IF EXISTS TBL_COMMON_CODE_C;
DROP TABLE IF EXISTS TBL_USER_M;
DROP TABLE IF EXISTS TBL_COMMON_FILE_S;
DROP TABLE IF EXISTS TBL_BOARD_ATTACHMENT_S;
DROP TABLE IF EXISTS TBL_RESUME_EDUCATION_S;
DROP TABLE IF EXISTS TBL_RESUME_TRAINING_HISTORY_S;
DROP TABLE IF EXISTS TBL_COMPANY_MEMBER_R;
DROP TABLE IF EXISTS TBL_SCRAP_S;
DROP TABLE IF EXISTS TBL_BOARD_M;
DROP TABLE IF EXISTS TBL_CERTIFICATE_S;
DROP TABLE IF EXISTS TBL_RESUME_PROJECT_HISTORY_S;
DROP TABLE IF EXISTS TBL_RESUME_CERTIFICATION_S;
DROP TABLE IF EXISTS TBL_PROJECT_APPLICATION_H;
DROP TABLE IF EXISTS TBL_COMPANY_TAG_S;
DROP TABLE IF EXISTS TBL_RESUME_SKILL_TAG_S;
DROP TABLE IF EXISTS TBL_PROJECT_INTERVIEW_TIME_SLOT_S;
DROP TABLE IF EXISTS TBL_AREA_C;
DROP TABLE IF EXISTS TBL_BOARD_COMMENT_S;
DROP TABLE IF EXISTS TBL_SKILL_TAG_C;
DROP TABLE IF EXISTS TBL_RESUME_PROFILE_IMAGE_S;
DROP TABLE IF EXISTS TBL_BOARD_SKILL_TAG_S;
DROP TABLE IF EXISTS TBL_PROJECT_REQUIRED_SKILL_TAG_S;
DROP TABLE IF EXISTS TBL_RESUME_ATTACHMENT_S;
DROP TABLE IF EXISTS TBL_PROJECT_M;
DROP TABLE IF EXISTS TBL_COMPANY_APPLICATION_H;
DROP TABLE IF EXISTS TBL_ADDRESS_S;
DROP TABLE IF EXISTS TBL_PROJECT_PREFERRED_SKILL_TAG_S;
DROP TABLE IF EXISTS TBL_RESUME_PROJECT_HISTORY_SKILL_TAG_S;
DROP TABLE IF EXISTS TBL_RESUME_M;
DROP TABLE IF EXISTS TBL_COMPANY_PROFILE_IMAGE_S;
DROP TABLE IF EXISTS TBL_COMPANY_S;
DROP TABLE IF EXISTS TBL_RECOMMENDATION_S;
DROP TABLE IF EXISTS TBL_USER_PROFILE_IMAGE_S;
DROP TABLE IF EXISTS TBL_PROJECT_CONTRACT_TYPE_S;
DROP TABLE IF EXISTS TBL_PROJECT_RECRUIT_JOB_ROLE_S;
DROP TABLE IF EXISTS TBL_RESUME_CAREER_S;

DROP TABLE IF EXISTS TBL_SCHEDULE_EVNT;
DROP TABLE IF EXISTS TBL_CALENDAR_POSTION_EVNT;
DROP TABLE IF EXISTS TBL_CALENDAR_INDVDI_EVNT;
DROP TABLE IF EXISTS TBL_CALENDAR_INTERVIEW_EVNT;



CREATE TABLE TBL_RESUME_CAREER_S (
	career_sq	BIGINT	NOT NULL	COMMENT '경력 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	career_company_nm	VARCHAR(50)	NOT NULL	COMMENT '회사명',
	career_department_nm	VARCHAR(50)	NOT NULL	COMMENT '부서',
	career_position_nm	VARCHAR(30)	NOT NULL	COMMENT '직급',
	career_start_dt	DATE	NOT NULL	COMMENT '입사일자',
	career_end_dt	DATE	NULL	COMMENT '퇴사일자 / 재직중일 수 있으므로 NULL 허용'
);

CREATE TABLE TBL_PROJECT_RECRUIT_JOB_ROLE_S (
	recruit_job_role_sq	BIGINT	NOT NULL	COMMENT '모집 직무 순번',
	project_sq	BIGINT	NOT NULL	COMMENT '프로젝트 순번',
	recruit_job_position_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 1000'
);

CREATE TABLE TBL_PROJECT_CONTRACT_TYPE_S (
	contract_type_sq	BIGINT	NOT NULL	COMMENT '계약 형태 순번',
	project_sq	BIGINT	NOT NULL	COMMENT '프로젝트 순번',
	contract_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 900'
);

CREATE TABLE TBL_USER_PROFILE_IMAGE_S (
	profile_image_sq	BIGINT	NOT NULL	COMMENT '프로필 사진 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	file_sq	BIGINT	NOT NULL	COMMENT '파일 순번'
);

CREATE TABLE TBL_RECOMMENDATION_S (
	recommendation_sq	BIGINT	NOT NULL	COMMENT '추천 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	board_sq	BIGINT	NULL	COMMENT '게시판 순번',
	answer_sq	BIGINT	NULL	COMMENT '답변 게시판 순번',
	comment_sq	BIGINT	NULL	COMMENT '댓글 순번',
	recommendation_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 1900',
	reply_comment_sq     BIGINT         COMMENT '대댓글 순번'
);

CREATE TABLE TBL_COMPANY_S (
	company_sq	BIGINT	NOT NULL	COMMENT '기업 프로필 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	address_sq	BIGINT	NOT NULL	COMMENT '기업 주소지',
	company_agreed_terms_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT 'Y 또는 N',
	company_nm	VARCHAR(50)	NOT NULL	COMMENT '기업명',
	company_ceo_nm	VARCHAR(30)	NOT NULL	COMMENT '대표자명',
	company_open_dt	DATE	NOT NULL	COMMENT '개업일자',
	company_url	VARCHAR(255)	NULL	COMMENT '기업URL',
	company_biz_num	VARCHAR(20)	NOT NULL	COMMENT '사업자등록번호',
	company_is_recruiting_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT 'Y 또는 N',
	company_greeting_txt	TEXT	NULL	COMMENT '인사말',
	company_view_cnt	INT	NOT NULL	COMMENT '조회수',
	company_recruit_start_dtm	DATETIME	NULL	COMMENT '소속 모집 공고 시작 일시'
);

CREATE TABLE TBL_COMPANY_PROFILE_IMAGE_S (
	profile_image_sq	BIGINT	NOT NULL	COMMENT '프로필 사진 순번',
	company_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	file_sq	BIGINT	NOT NULL    	COMMENT '파일 순번'
);

CREATE TABLE TBL_RESUME_M (
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	address_sq	BIGINT	NOT NULL	COMMENT '이력서 주소지',
	resume_ttl	VARCHAR(100)	NOT NULL	COMMENT '제목',
	resume_nm	VARCHAR(30)	NOT NULL	COMMENT '이름',
	resume_birth_dt	DATE	NOT NULL	COMMENT '생년월일',
	resume_phone_num	VARCHAR(20)	NOT NULL	COMMENT '전화번호',
	resume_email	VARCHAR(50)	NOT NULL	COMMENT '이메일',
	resume_greeting_txt	TEXT	NOT NULL	COMMENT '인사말',
	resume_is_notification_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '알림 발신 여부 / Y 또는 N',
	resume_is_representative_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '대표 이력서 여부 / Y 또는 N',
	resume_created_at_dtm	DATETIME	NOT NULL		COMMENT '등록일자',
	resume_modified_at_dtm	DATETIME	NOT NULL	COMMENT '수정일자',
	resume_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '삭제 여부 / Y 또는 N'
);

CREATE TABLE TBL_RESUME_PROJECT_HISTORY_SKILL_TAG_S (
	project_history_skill_sq	BIGINT	NOT NULL	COMMENT '프로젝트 이력 사용 기술',
	project_history_sq	BIGINT	NOT NULL	COMMENT '프로젝트 이력 순번',
	skill_tag_sq	BIGINT	NULL	COMMENT '기술 순번',
	parent_skill_tag_sq	BIGINT	NULL	DEFAULT NULL	COMMENT '상위 기술 태그 순번',
	skill_tag_lvl	INT	NULL	COMMENT '기술 태그  레벨',
	skill_tag_nm	VARCHAR(50)	NOT NULL	COMMENT '기술 태그  이름'
);

CREATE TABLE TBL_PROJECT_PREFERRED_SKILL_TAG_S (
	preferred_skill_sq	BIGINT	NOT NULL	COMMENT '우대 기술 순번',
	project_sq	BIGINT	NOT NULL	COMMENT '프로젝트 순번',
	skill_tag_sq	BIGINT	NOT NULL	COMMENT '기술 태그 순번',
	parent_skill_tag_sq	BIGINT	NULL	DEFAULT NULL	COMMENT '상위 기술 태그 순번',
	skill_tag_lvl	INT	NOT NULL	COMMENT '기술 태그  레벨.',
	skill_tag_nm	VARCHAR(50)	NOT NULL	COMMENT '기술 태그 이름'
);

CREATE TABLE TBL_ADDRESS_S (
	address_sq	BIGINT	NOT NULL	COMMENT '주소 순번',
	zonecode	BIGINT	NOT NULL	COMMENT 'API 반환값',
	address	VARCHAR(30)	NULL	COMMENT 'API 반환값',
	detail_address	VARCHAR(30)	NULL	COMMENT '사용자 직접 입력',
	sigungu	VARCHAR(30)	NOT NULL	COMMENT 'API 반환값',
	latitude	DECIMAL(10,7)	NOT NULL	COMMENT 'API 반환값',
	longitude	DECIMAL(10,7)	NOT NULL	COMMENT 'API 반환값',
	address_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '등록일시',
	address_modified_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '수정일시',
	area_code_sq	BIGINT	NOT NULL	COMMENT '지역 코드 순번'
);

CREATE TABLE TBL_COMPANY_APPLICATION_H (
	company_application_sq	BIGINT	NOT NULL	COMMENT '기업 지원 순번',
	company_sq	BIGINT	NOT NULL	COMMENT '기업 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	company_application_greeting_txt	TEXT	NOT NULL	COMMENT '인사말',
	company_application_status_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 500',
	company_application_read_at_dtm	DATETIME	NULL	COMMENT '열람일자',
	company_application_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '등록일자',
	company_application_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '지원 취소 여부'
);

CREATE TABLE TBL_PROJECT_M (
	project_sq	BIGINT	NOT NULL	COMMENT '프로젝트 순번',
	company_sq	BIGINT	NOT NULL	COMMENT '기업  순번',
	address_sq	BIGINT	NOT NULL	COMMENT '주소 순번',
	project_ttl	VARCHAR(50)	NOT NULL	COMMENT '제목',
	project_image_url	VARCHAR(255)	NULL	COMMENT '프로젝트 이미지 URL',
	project_developer_grade_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 700',
	project_required_education_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 2100',
	project_salary	BIGINT	NOT NULL	COMMENT '단가',
	project_start_dt	DATE	NOT NULL	COMMENT '프로젝트 수행 시작일',
	project_end_dt	DATE	NOT NULL	COMMENT '프로젝트 수행 종료일',
	project_recruit_start_dt	DATE	NOT NULL	COMMENT '모집 시작일',
	project_recruit_end_dt	DATE	NOT NULL	COMMENT '모집 종료일',
	project_preference_txt	VARCHAR(255)	NULL	COMMENT '우대사항',
	project_description_txt	TEXT	NOT NULL	COMMENT '상세 내용',
	project_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '등록일자',
	project_modified_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '수정일자',
	project_candidate_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '지원자 수',
	project_scrap_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '스크랩 수',
	project_is_notification_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '알림 발신 여부/ Y 또는 N',
	project_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '삭제 여부/ Y 또는 N',
	project_view_cnt	INT	NOT NULL	COMMENT '조회수',
	project_activate_yn  CHAR(1) NOT NULL    DEFAULT 'Y'     COMMENT '프로젝트 활성화 여부'
);

CREATE TABLE TBL_RESUME_ATTACHMENT_S (
	resume_attachment_sq	BIGINT	NOT NULL	COMMENT '이력서 첨부파일 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	file_sq	BIGINT	NOT NULL	COMMENT '파일 순번'
);

CREATE TABLE TBL_PROJECT_REQUIRED_SKILL_TAG_S (
	required_skill_sq	BIGINT	NOT NULL	COMMENT '필수 기술 순번',
	project_sq	BIGINT	NOT NULL	COMMENT '프로젝트 순번',
	skill_tag_sq	BIGINT	NOT NULL	COMMENT '기술 태그 순번',
	parent_skill_tag_sq	BIGINT	NULL	DEFAULT NULL	COMMENT '상위 기술 태그 순번',
	skill_tag_lvl	INT	NOT NULL	COMMENT '기술 태그  레벨',
	skill_tag_nm	VARCHAR(50)	NOT NULL	COMMENT '기술 태그  이름'
);

CREATE TABLE TBL_BOARD_SKILL_TAG_S (
	board_skill_tag_sq	BIGINT	NOT NULL	COMMENT '게시판 기술 태그 순번',
	board_sq	BIGINT	NULL	COMMENT '게시판 순번',
	answer_sq	BIGINT	NULL	COMMENT '답변 게시판 순번',
	skill_tag_sq	BIGINT	NOT NULL	COMMENT '기술 태그 순번',
	skill_tag_nm	VARCHAR(50)	NOT NULL	COMMENT '기술 태그  이름',
	skill_tag_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 1800'
);

CREATE TABLE TBL_RESUME_PROFILE_IMAGE_S (
	profile_image_sq	BIGINT	NOT NULL	COMMENT '프로필 사진 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	file_sq	BIGINT	NOT NULL	COMMENT '파일 순번'
);

CREATE TABLE TBL_SKILL_TAG_C (
	skill_tag_sq	BIGINT	NOT NULL	COMMENT '기술 코드 순번',
	parent_skill_tag_sq	BIGINT	NULL	DEFAULT NULL	COMMENT '상위 기술 코드 순번',
	skill_tag_lvl	INT	NOT NULL	COMMENT '기술  레벨',
	skill_tag_nm	VARCHAR(50)	NOT NULL	COMMENT '기술  이름',
	skill_tag_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '등록일자',
	skill_tag_updated_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '수정일자',
	skill_tag_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '삭제여부 / Y 또는 N'
);

CREATE TABLE TBL_BOARD_COMMENT_S (
	comment_sq	BIGINT	NOT NULL	COMMENT '댓글 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	board_sq	BIGINT	NULL	COMMENT '게시판 순번',
	answer_sq	BIGINT	NULL	COMMENT '답변 게시판 순번',
	comment_description_txt	VARCHAR(255)	NOT NULL	COMMENT '내용',
	comment_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '등록일자',
	comment_modified_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '수정일자',
	comment_recommend_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '추천수',
	comment_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '삭제여부 / Y 또는 N',
	comment_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 1600'
);

CREATE TABLE TBL_AREA_C (
	area_code_sq	BIGINT	NOT NULL	COMMENT '지역 코드 순번',
	area_sigungu	VARCHAR(30)	NOT NULL	COMMENT '시/군/구',
	parent_area_code_sq	BIGINT	NULL	COMMENT '상위 지역 코드 순번'
);

CREATE TABLE TBL_PROJECT_INTERVIEW_TIME_SLOT_S (
	interview_sq	BIGINT	NOT NULL	COMMENT '인터뷰 가능 시간대 순번',
	project_sq	BIGINT	NOT NULL	COMMENT '프로젝트 순번',
	interview_available_dtm	DATETIME	NOT NULL	COMMENT '날짜 + 시간대',
	interview_is_selected_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '인터뷰 선택 구분 / Y 또는 N'
);

CREATE TABLE TBL_RESUME_SKILL_TAG_S (
	resume_skill_sq	BIGINT	NOT NULL	COMMENT '보유 기술 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	skill_tag_sq	BIGINT	NOT NULL	COMMENT '기술 태그  순번',
	parent_skill_tag_sq	BIGINT	NULL	DEFAULT NULL	COMMENT '상위 기술 태그 순번',
	skill_tag_lvl	INT	NOT NULL	COMMENT '기술 태그  레벨',
	skill_tag_nm	VARCHAR(50)	NOT NULL	COMMENT '기술 태그  이름'
);

CREATE TABLE TBL_COMPANY_TAG_S (
	tag_sq	BIGINT	NOT NULL	COMMENT '태그 순번',
	company_sq	BIGINT	NOT NULL	COMMENT '기업 프로필 순번',
	tag_nm	VARCHAR(50)	NOT NULL	COMMENT '태그 이름'
);

CREATE TABLE TBL_PROJECT_APPLICATION_H (
	project_application_sq	BIGINT	NOT NULL	COMMENT '프로젝트 지원 순번',
	project_sq	BIGINT	NOT NULL	COMMENT '프로젝트 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	company_sq	BIGINT	NULL	COMMENT '프로젝트 지원자 소속 기업 순번',
	project_application_status_cd	BIGINT	NOT NULL	COMMENT '공통 코드 순번',
	project_application_member_type_cd	BIGINT	NOT NULL	COMMENT '공통 코드 순번',
	project_application_created_at_dtm	DATETIME	NOT NULL	COMMENT '지원 등록일',
	selected_interview_dtm	DATETIME	NULL	COMMENT '선택 면접 일시 / 합격 시',
	read_application_dtm	DATETIME	NULL	COMMENT '지원 열람 일자'
);

CREATE TABLE TBL_RESUME_CERTIFICATION_S (
	certification_sq	BIGINT	NOT NULL	COMMENT '자격증 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	certificate_cd	BIGINT	NOT NULL	COMMENT '자격증 코드 (jmcd)',
	certification_nm	VARCHAR(50)	NOT NULL	COMMENT '자격증 이름',
	certification_issuer_nm	VARCHAR(50)	NULL	COMMENT '발행 기관'
);

CREATE TABLE TBL_RESUME_PROJECT_HISTORY_S (
	project_history_sq	BIGINT	NOT NULL	COMMENT '프로젝트 이력 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	project_history_client	VARCHAR(50)	NOT NULL	COMMENT '고객',
	project_history_type_cd	BIGINT	NOT NULL	COMMENT '공통 코드 순번',
	project_history_job_position_type_cd	BIGINT	NOT NULL	COMMENT '공통 코드 순번',
	project_history_task	VARCHAR(50)	NOT NULL	COMMENT '구분',
	project_history_start_dt	DATE	NOT NULL	COMMENT '프로젝트 시작일',
	project_history_end_dt	DATE	NULL	COMMENT '프로젝트 종료일  / 진행 중일 수 있으므로 NULL 허용'
);

CREATE TABLE TBL_CERTIFICATE_S (
	certificate_cd	BIGINT	NOT NULL	COMMENT '자격증 코드 (jmcd)',
	certificate_nm	VARCHAR(100)	NOT NULL	COMMENT '자격증 이름 (jmfldnm)',
	series_cd	BIGINT	NULL	COMMENT '계열 코드 (seriescd)',
	series_nm	VARCHAR(100)	NULL	COMMENT '계열 이름 (seriesnm)',
	obligation_field_cd	BIGINT	NULL	COMMENT '분야 코드 (obligfldcd)',
	obligation_field_nm	VARCHAR(100)	NULL	COMMENT '분야 이름 (obligfldnm)',
	middle_obligation_field_cd	BIGINT	NULL	COMMENT '중분야 코드 (mdobligfldcd)',
	middle_obligation_field_nm	VARCHAR(100)	NULL	COMMENT '중분야 이름 (mdobligfldnm)',
	qualification_group_cd	BIGINT	NULL	COMMENT '자격구분 코드 (qualgbcd)',
	qualification_group_nm	VARCHAR(100)	NULL	COMMENT '자격구분 이름 (qualgbnm)',
	created_at	DATETIME	NULL	COMMENT '저장 일시'
);

CREATE TABLE TBL_REPORT_S (
	report_sq	BIGINT	NOT NULL	COMMENT '신고 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	board_sq	BIGINT	NULL	COMMENT '게시판 순번',
	answer_sq	BIGINT	NULL	COMMENT '답변 게시판 순번',
	comment_sq	BIGINT	NULL	COMMENT '댓글 순번',
	report_reason_txt	VARCHAR(20)	NOT NULL	COMMENT '신고 사유',
	report_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 2000',
	reply_comment_sq  BIGINT                COMMENT '대댓글 순번',
	created_at_dtm    DATETIME     NOT NULL COMMENT '작성일자(신고 등록 시각)'
);

CREATE TABLE TBL_BOARD_M (
	board_sq	BIGINT	NOT NULL	COMMENT '게시판 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	board_ttl	VARCHAR(100)	NOT NULL	COMMENT '제목',
	board_description_edt	LONGTEXT	NOT NULL	COMMENT '내용',
	board_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '등록일자',
	board_modified_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '수정일자',
	board_view_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '조회수',
	board_comment_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '댓글수',
	board_recommend_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '추천수',
	board_adopt_status_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 1500',
	board_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '삭제 여부/ Y 또는 N',
	board_typ	VARCHAR(10)	NOT NULL	COMMENT '게시판 구분',
	board_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 1400'
);

CREATE TABLE TBL_SCRAP_S (
	scrap_sq	BIGINT	NOT NULL	COMMENT '스크랩_순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	company_sq	BIGINT	NULL	COMMENT '기업 순번',
	project_sq	BIGINT	NULL	COMMENT '프로젝트 순번',
	scrap_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 600'
);

CREATE TABLE TBL_COMPANY_MEMBER_R (
	company_member_sq	BIGINT	NOT NULL	COMMENT '기업 회원 순번',
	company_sq	BIGINT	NOT NULL	COMMENT '기업 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	company_member_join_dt	DATE	NOT NULL	COMMENT '입사일자',
	company_member_leave_dt	DATE	NULL	COMMENT '퇴사일자',
	company_member_status_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 400'
);

CREATE TABLE TBL_RESUME_TRAINING_HISTORY_S (
	training_sq	BIGINT	NOT NULL	COMMENT '학력 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	training_institution_nm	VARCHAR(50)	NOT NULL	COMMENT '교육기관명',
	training_program_nm	VARCHAR(100)	NOT NULL	COMMENT '교육과정명',
	training_start_dt	DATE	NOT NULL	COMMENT '수료시작일',
	training_end_dt	DATE	NULL	COMMENT '수료종료일 /  진행 중일 수 있으므로 NULL 허용'
);

CREATE TABLE TBL_RESUME_EDUCATION_S (
	education_sq	BIGINT	NOT NULL	COMMENT '학력 순번',
	resume_sq	BIGINT	NOT NULL	COMMENT '이력서 순번',
	education_school_nm	VARCHAR(50)	NOT NULL	COMMENT '학교명',
	education_major_nm	VARCHAR(50)	NOT NULL	COMMENT '전공',
	education_admission_dt	DATE	NOT NULL	COMMENT '입학일자',
	education_graduation_dt	DATE	NULL	COMMENT '졸업일자 / 졸업 예정일 수 있으므로 NULL 허용',
	education_status_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 1200'
);

CREATE TABLE TBL_BOARD_ATTACHMENT_S (
	board_attachment_sq	BIGINT	NOT NULL	COMMENT '게시판 첨부파일 순번',
	board_sq	BIGINT	NOT NULL	COMMENT '게시판 순번',
	file_sq	BIGINT	NOT NULL	COMMENT '파일 순번'
);

CREATE TABLE TBL_COMMON_FILE_S (
	file_sq	BIGINT	NOT NULL	COMMENT '파일 순번',
	file_original_nm	VARCHAR(255)	NOT NULL	COMMENT '사용자가 업로드한 파일명',
	file_save_nm	VARCHAR(255)	NOT NULL	COMMENT 'S3에 저장된 파일명(UUID)',
	file_typ	VARCHAR(100)	NULL	COMMENT '파일 MIME 타입',
	file_size	BIGINT	NULL	COMMENT '파일 크기',
	file_upload_at	DATETIME	NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '업로드 일시',
	file_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'
);

CREATE TABLE TBL_USER_M (
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	address_sq	BIGINT	NULL	COMMENT '주소 순번',
	user_id	VARCHAR(30)	NOT NULL	COMMENT '사용자 ID',
	user_email	VARCHAR(50)	NOT NULL	COMMENT '로그인 이메일 *UNIQUE',
	user_pw	VARCHAR(255)	NULL	COMMENT '비밀번호 (소셜 로그인은 NULL 가능)',
	user_nm	VARCHAR(50)	NOT NULL	COMMENT '이름 또는 기업 담당자 이름',
	user_gender_cd	BIGINT	NULL	COMMENT '공통코드 / 100',
	user_phone_num	VARCHAR(20)	NOT NULL	COMMENT '휴대폰 번호',
	user_birth_dt	DATE	NULL	COMMENT '생년월일',
	user_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 300',
	user_signup_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 200',
	user_agreed_privacy_policy_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '개인정보 이용 동의 여부 / Y 또는 N',
	user_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '가입일시',
	user_modified_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '수정일시',
	user_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '탈퇴 여부 / Y 또는 N',
	user_refresh_token	VARCHAR(255)	NULL	COMMENT '리프레쉬 토큰',
    user_is_activate_yn    CHAR(1) NOT NULL    DEFAULT 'Y'    COMMENT '계정 활성화 여부'
);

CREATE TABLE TBL_COMMON_CODE_C (
	common_code_sq	BIGINT	NOT NULL	COMMENT '공통 코드 순번',
	parent_common_code_sq	BIGINT	NULL	DEFAULT NULL	COMMENT '상위 공통 코드 순번',
	common_code_lvl	INT	NOT NULL	COMMENT '공통 코드 레벨',
	common_code_nm	VARCHAR(100)	NOT NULL	COMMENT '공통 코드  이름',
	common_code_english_nm	VARCHAR(50)	NULL	COMMENT '공통 코드 영문 이름',
	common_code_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '등록일자',
	common_code_updated_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '수정일자',
	common_code_is_active_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '삭제여부 / Y 또는 N'
);

CREATE TABLE TBL_BOARD_ANSWER_S (
	answer_sq	BIGINT	NOT NULL	COMMENT '답변 게시판 순번',
	user_sq	BIGINT	NOT NULL	COMMENT '사용자 순번',
	board_sq	BIGINT	NOT NULL	COMMENT '게시판 순번',
	answer_ttl	VARCHAR(100)	NOT NULL	COMMENT '제목',
	answer_description_edt	LONGTEXT	NOT NULL	COMMENT '내용',
	answer_created_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '등록일자',
	answer_modified_at_dtm	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP	COMMENT '수정일자',
	answer_view_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '조회수',
	answer_comment_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '댓글수',
	answer_recommend_cnt	INT	NOT NULL	DEFAULT 0	COMMENT '추천수',
	answer_is_adopted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '채택여부 / Y 또는 N',
	answer_is_deleted_yn	CHAR(1)	NOT NULL	DEFAULT 'N'	COMMENT '삭제여부 / Y 또는 N'
);

CREATE TABLE TBL_BOARD_NORMAL_TAG_S (
	normal_tag_sq	BIGINT	NOT NULL	COMMENT '일반 태그 순번',
	board_sq	BIGINT	NULL	COMMENT '게시판 순번',
	answer_sq	BIGINT	NULL	COMMENT '답변 게시판 순번',
	normal_tag_nm	VARCHAR(50)	NOT NULL	COMMENT '태그 이름',
	normal_tag_type_cd	BIGINT	NOT NULL	COMMENT '공통코드 / 1700'
);

CREATE TABLE TBL_BOARD_ANSWER_ATTACHMENT_S (
	board_answer_attachment_sq	BIGINT	NOT NULL	COMMENT '답변 게시판 첨부파일 순번',
	answer_sq	BIGINT	NOT NULL	COMMENT '답변 게시판 순번',
	file_sq	BIGINT	NOT NULL	COMMENT '파일 순번'
);

-- ================================
-- 캘린더 관련 (인턴)
-- ================================

-- 1) 일정 (공통)
CREATE TABLE TBL_SCHEDULE_EVNT (
  schedule_sq              BIGINT NOT NULL AUTO_INCREMENT COMMENT '일정 순번',
  schedule_user_sq         BIGINT NOT NULL COMMENT '일정 사용자 순번',
  title                    VARCHAR(255) NULL COMMENT '일정 제목',
  start_dt                 DATETIME NOT NULL COMMENT '시작일시',
  end_dt                   DATETIME NULL COMMENT '마감일시',
  calendar_created_at_dtm  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  calendar_modified_at_dtm DATETIME NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  schedule_is_deleted_yn   CHAR(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부(Y/N)',
  source_type              ENUM('PERSONAL','PROJECT','INTERVIEW') NOT NULL COMMENT '소스 유형',
  schedule_all_day_yn      CHAR(1) NOT NULL DEFAULT 'N' COMMENT '종일 여부(Y/N)',
  PRIMARY KEY (schedule_sq)
);

-- 2) 캘린더- 개인일정
CREATE TABLE TBL_CALENDAR_INDVDI_EVNT(
 indvdi_evnt_sq BIGINT NOT NULL AUTO_INCREMENT COMMENT '개인 일정 순번',
 schedule_sq BIGINT NOT NULL COMMENT '일정 순번',
 memo VARCHAR(255) NULL COMMENT '메모',
 PRIMARY KEY(indvdi_evnt_sq)
);

-- 3) 캘린더 공고일정
CREATE TABLE TBL_CALENDAR_POSTION_EVNT(
 postion_evnt_sq BIGINT NOT NULL AUTO_INCREMENT COMMENT '공고 이벤트 순번',
 schedule_sq BIGINT NOT NULL COMMENT '일정 순번',
 project_sq BIGINT NOT NULL COMMENT '프로젝트 순번', 
 company_sq BIGINT NOT NULL COMMENT '기업 순번', 
 PRIMARY KEY(postion_evnt_sq)
);

-- 4) 캘린더 인터뷰일정
CREATE TABLE TBL_CALENDAR_INTERVIEW_EVNT(
 interview_evnt_sq BIGINT NOT NULL AUTO_INCREMENT COMMENT '인터뷰 이벤트 순번',
 company_sq BIGINT NOT NULL COMMENT '기업 순번',
 project_sq BIGINT NOT NULL COMMENT '프로젝트 순번',
 project_application_sq BIGINT NOT NULL COMMENT '프로젝트 지원 순번',
 schedule_sq BIGINT NOT NULL COMMENT '일정 순번',
 address_sq BIGINT NOT NULL COMMENT '주소 순번',
 company_nm_snapshot VARCHAR(255) NOT NULL COMMENT '회사이름',
 PRIMARY KEY(interview_evnt_sq)
);

-- =========================================
-- 신고/추천 (인턴)
-- =========================================

CREATE TABLE TBL_REPORT_H (
  report_history_sq BIGINT        NOT NULL COMMENT '신고 이력 순번',
  report_sq         BIGINT        NOT NULL COMMENT '신고 순번',
  created_at_dtm    DATETIME      NOT NULL COMMENT '작성일자(이력 기록 시각)',
  report_status     CHAR(1)       NOT NULL COMMENT '상태(예: R=접수, P=처리중, C=완료 등)',
  report_result     VARCHAR(255)           COMMENT '신고 처리 결과/메모'
);

-- =========================================
-- 게시판 댓글/대댓글 (인턴)
-- =========================================

CREATE TABLE TBL_BOARD_COMMENT_REPLY_S (
  reply_comment_sq              BIGINT        NOT NULL COMMENT '대댓글 순번',
  comment_sq                    BIGINT        NOT NULL COMMENT '부모 댓글 순번',
  board_sq                      BIGINT        NOT NULL COMMENT '게시판 순번',
  user_sq                       BIGINT        NOT NULL COMMENT '작성자',
  reply_comment_description_txt VARCHAR(255)  NOT NULL COMMENT '내용',
  reply_comment_created_at_dtm  DATETIME      NOT NULL COMMENT '등록일자',
  reply_comment_modified_at_dtm DATETIME               COMMENT '수정일자',
  reply_comment_recommend_cnt   INT                   COMMENT '추천수',
  reply_comment_is_deleted_yn   CHAR(1)       NOT NULL COMMENT '삭제여부(Y/N)'
);

-- ================================
-- 지도 관련 (인턴)
-- ================================

CREATE TABLE TBL_USER_MAP_FILTER_S (
  map_filter_sq       BIGINT      NOT NULL COMMENT '지도 필터 순번',
  user_sq             BIGINT      NOT NULL COMMENT '사용자 순번',
  recruit_job_role_sq BIGINT               COMMENT '직무(채용 직무 역할 순번)',
  transport_mode_cd   BIGINT               COMMENT '이동수단 코드(선택값)',
  radius_km           DECIMAL(6,2)         COMMENT '반경(KM)',
  commute_min         INT                  COMMENT '출퇴근 시간(분)',
  created_at_dtm      DATETIME    NOT NULL COMMENT '생성 시각',
  modified_at_dtm     DATETIME             COMMENT '변경 시각'
);

-- ==========================================
-- PRIMARY KEY 설정
-- ==========================================

ALTER TABLE TBL_RESUME_CAREER_S ADD CONSTRAINT PK_TBL_RESUME_CAREER_S PRIMARY KEY (
	career_sq
);

ALTER TABLE TBL_PROJECT_RECRUIT_JOB_ROLE_S ADD CONSTRAINT PK_TBL_PROJECT_RECRUIT_JOB_ROLE_S PRIMARY KEY (
	recruit_job_role_sq
);

ALTER TABLE TBL_PROJECT_CONTRACT_TYPE_S ADD CONSTRAINT PK_TBL_PROJECT_CONTRACT_TYPE_S PRIMARY KEY (
	contract_type_sq
);

ALTER TABLE TBL_USER_PROFILE_IMAGE_S ADD CONSTRAINT PK_TBL_USER_PROFILE_IMAGE_S PRIMARY KEY (
	profile_image_sq
);

ALTER TABLE TBL_RECOMMENDATION_S ADD CONSTRAINT PK_TBL_RECOMMENDATION_S PRIMARY KEY (
	recommendation_sq
);

ALTER TABLE TBL_COMPANY_S ADD CONSTRAINT PK_TBL_COMPANY_S PRIMARY KEY (
	company_sq
);

ALTER TABLE TBL_COMPANY_PROFILE_IMAGE_S ADD CONSTRAINT PK_TBL_COMPANY_PROFILE_IMAGE_S PRIMARY KEY (
	profile_image_sq
);

ALTER TABLE TBL_RESUME_M ADD CONSTRAINT PK_TBL_RESUME_M PRIMARY KEY (
	resume_sq
);

ALTER TABLE TBL_RESUME_PROJECT_HISTORY_SKILL_TAG_S ADD CONSTRAINT PK_TBL_RESUME_PROJECT_HISTORY_SKILL_TAG_S PRIMARY KEY (
	project_history_skill_sq
);

ALTER TABLE TBL_PROJECT_PREFERRED_SKILL_TAG_S ADD CONSTRAINT PK_TBL_PROJECT_PREFERRED_SKILL_TAG_S PRIMARY KEY (
	preferred_skill_sq
);

ALTER TABLE TBL_ADDRESS_S ADD CONSTRAINT PK_TBL_ADDRESS_S PRIMARY KEY (
	address_sq
);

ALTER TABLE TBL_COMPANY_APPLICATION_H ADD CONSTRAINT PK_TBL_COMPANY_APPLICATION_H PRIMARY KEY (
	company_application_sq
);

ALTER TABLE TBL_PROJECT_M ADD CONSTRAINT PK_TBL_PROJECT_M PRIMARY KEY (
	project_sq
);

ALTER TABLE TBL_RESUME_ATTACHMENT_S ADD CONSTRAINT PK_TBL_RESUME_ATTACHMENT_S PRIMARY KEY (
	resume_attachment_sq
);

ALTER TABLE TBL_PROJECT_REQUIRED_SKILL_TAG_S ADD CONSTRAINT PK_TBL_PROJECT_REQUIRED_SKILL_TAG_S PRIMARY KEY (
	required_skill_sq
);

ALTER TABLE TBL_BOARD_SKILL_TAG_S ADD CONSTRAINT PK_TBL_BOARD_SKILL_TAG_S PRIMARY KEY (
	board_skill_tag_sq
);

ALTER TABLE TBL_RESUME_PROFILE_IMAGE_S ADD CONSTRAINT PK_TBL_RESUME_PROFILE_IMAGE_S PRIMARY KEY (
	profile_image_sq
);

ALTER TABLE TBL_SKILL_TAG_C ADD CONSTRAINT PK_TBL_SKILL_TAG_C PRIMARY KEY (
	skill_tag_sq
);

ALTER TABLE TBL_BOARD_COMMENT_S ADD CONSTRAINT PK_TBL_BOARD_COMMENT_S PRIMARY KEY (
	comment_sq
);

ALTER TABLE TBL_AREA_C ADD CONSTRAINT PK_TBL_AREA_C PRIMARY KEY (
	area_code_sq
);

ALTER TABLE TBL_PROJECT_INTERVIEW_TIME_SLOT_S ADD CONSTRAINT PK_TBL_PROJECT_INTERVIEW_TIME_SLOT_S PRIMARY KEY (
	interview_sq
);

ALTER TABLE TBL_RESUME_SKILL_TAG_S ADD CONSTRAINT PK_TBL_RESUME_SKILL_TAG_S PRIMARY KEY (
	resume_skill_sq
);

ALTER TABLE TBL_COMPANY_TAG_S ADD CONSTRAINT PK_TBL_COMPANY_TAG_S PRIMARY KEY (
	tag_sq
);

ALTER TABLE TBL_PROJECT_APPLICATION_H ADD CONSTRAINT PK_TBL_PROJECT_APPLICATION_H PRIMARY KEY (
	project_application_sq
);

ALTER TABLE TBL_RESUME_CERTIFICATION_S ADD CONSTRAINT PK_TBL_RESUME_CERTIFICATION_S PRIMARY KEY (
	certification_sq
);

ALTER TABLE TBL_RESUME_PROJECT_HISTORY_S ADD CONSTRAINT PK_TBL_RESUME_PROJECT_HISTORY_S PRIMARY KEY (
	project_history_sq
);

ALTER TABLE TBL_CERTIFICATE_S ADD CONSTRAINT PK_TBL_CERTIFICATE_S PRIMARY KEY (
	certificate_cd
);

ALTER TABLE TBL_REPORT_S ADD CONSTRAINT PK_TBL_REPORT_S PRIMARY KEY (
	report_sq
);

ALTER TABLE TBL_BOARD_M ADD CONSTRAINT PK_TBL_BOARD_M PRIMARY KEY (
	board_sq
);

ALTER TABLE TBL_SCRAP_S ADD CONSTRAINT PK_TBL_SCRAP_S PRIMARY KEY (
	scrap_sq
);

ALTER TABLE TBL_COMPANY_MEMBER_R ADD CONSTRAINT PK_TBL_COMPANY_MEMBER_R PRIMARY KEY (
	company_member_sq
);

ALTER TABLE TBL_RESUME_TRAINING_HISTORY_S ADD CONSTRAINT PK_TBL_RESUME_TRAINING_HISTORY_S PRIMARY KEY (
	training_sq
);

ALTER TABLE TBL_RESUME_EDUCATION_S ADD CONSTRAINT PK_TBL_RESUME_EDUCATION_S PRIMARY KEY (
	education_sq
);

ALTER TABLE TBL_BOARD_ATTACHMENT_S ADD CONSTRAINT PK_TBL_BOARD_ATTACHMENT_S PRIMARY KEY (
	board_attachment_sq
);

ALTER TABLE TBL_COMMON_FILE_S ADD CONSTRAINT PK_TBL_COMMON_FILE_S PRIMARY KEY (
	file_sq
);

ALTER TABLE TBL_USER_M ADD CONSTRAINT PK_TBL_USER_M PRIMARY KEY (
	user_sq
);

ALTER TABLE TBL_COMMON_CODE_C ADD CONSTRAINT PK_TBL_COMMON_CODE_C PRIMARY KEY (
	common_code_sq
);

ALTER TABLE TBL_BOARD_ANSWER_S ADD CONSTRAINT PK_TBL_BOARD_ANSWER_S PRIMARY KEY (
	answer_sq
);

ALTER TABLE TBL_BOARD_NORMAL_TAG_S ADD CONSTRAINT PK_TBL_BOARD_NORMAL_TAG_S PRIMARY KEY (
	normal_tag_sq
);

ALTER TABLE TBL_BOARD_ANSWER_ATTACHMENT_S ADD CONSTRAINT PK_TBL_BOARD_ANSWER_ATTACHMENT_S PRIMARY KEY (
	board_answer_attachment_sq
);

-- ==========================================
-- AUTO_INCREMENT 설정 (순번 필드들)
-- ==========================================

-- 스크랩
ALTER TABLE TBL_SCRAP_S MODIFY scrap_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 게시판
ALTER TABLE TBL_BOARD_M MODIFY board_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 답변 게시판
ALTER TABLE TBL_BOARD_ANSWER_S MODIFY answer_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 댓글
ALTER TABLE TBL_BOARD_COMMENT_S MODIFY comment_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 대댓글
-- 한 번에 처리
ALTER TABLE TBL_BOARD_COMMENT_REPLY_S 
MODIFY reply_comment_sq BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;

-- 추천
ALTER TABLE TBL_RECOMMENDATION_S MODIFY recommendation_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 신고
ALTER TABLE TBL_REPORT_S MODIFY report_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 신고 이력
ALTER TABLE TBL_REPORT_H 
MODIFY report_history_sq BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;

-- 프로젝트
ALTER TABLE TBL_PROJECT_M MODIFY project_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서
ALTER TABLE TBL_RESUME_M MODIFY resume_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 경력
ALTER TABLE TBL_RESUME_CAREER_S MODIFY career_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 프로젝트 이력
ALTER TABLE TBL_RESUME_PROJECT_HISTORY_S MODIFY project_history_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 프로젝트 이력 기술
ALTER TABLE TBL_RESUME_PROJECT_HISTORY_SKILL_TAG_S MODIFY project_history_skill_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 보유 기술
ALTER TABLE TBL_RESUME_SKILL_TAG_S MODIFY resume_skill_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 학력
ALTER TABLE TBL_RESUME_EDUCATION_S MODIFY education_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 교육 이수
ALTER TABLE TBL_RESUME_TRAINING_HISTORY_S MODIFY training_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 자격증
ALTER TABLE TBL_RESUME_CERTIFICATION_S MODIFY certification_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 첨부파일
ALTER TABLE TBL_RESUME_ATTACHMENT_S MODIFY resume_attachment_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 이력서 프로필 이미지
ALTER TABLE TBL_RESUME_PROFILE_IMAGE_S MODIFY profile_image_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 프로젝트 지원
ALTER TABLE TBL_PROJECT_APPLICATION_H MODIFY project_application_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 프로젝트 모집 직무
ALTER TABLE TBL_PROJECT_RECRUIT_JOB_ROLE_S MODIFY recruit_job_role_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 프로젝트 계약 형태
ALTER TABLE TBL_PROJECT_CONTRACT_TYPE_S MODIFY contract_type_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 프로젝트 필수 기술
ALTER TABLE TBL_PROJECT_REQUIRED_SKILL_TAG_S MODIFY required_skill_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 프로젝트 우대 기술
ALTER TABLE TBL_PROJECT_PREFERRED_SKILL_TAG_S MODIFY preferred_skill_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 프로젝트 인터뷰 시간
ALTER TABLE TBL_PROJECT_INTERVIEW_TIME_SLOT_S MODIFY interview_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 게시판 기술 태그
ALTER TABLE TBL_BOARD_SKILL_TAG_S MODIFY board_skill_tag_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 게시판 일반 태그
ALTER TABLE TBL_BOARD_NORMAL_TAG_S MODIFY normal_tag_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 게시판 첨부파일
ALTER TABLE TBL_BOARD_ATTACHMENT_S MODIFY board_attachment_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 답변 게시판 첨부파일
ALTER TABLE TBL_BOARD_ANSWER_ATTACHMENT_S MODIFY board_answer_attachment_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 파일
ALTER TABLE TBL_COMMON_FILE_S MODIFY file_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 사용자 프로필 이미지
ALTER TABLE TBL_USER_PROFILE_IMAGE_S MODIFY profile_image_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 회사 프로필 이미지
ALTER TABLE TBL_COMPANY_PROFILE_IMAGE_S MODIFY profile_image_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 기업 태그
ALTER TABLE TBL_COMPANY_TAG_S MODIFY tag_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 기업 소속 회원
ALTER TABLE TBL_COMPANY_MEMBER_R MODIFY company_member_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 기업 지원
ALTER TABLE TBL_COMPANY_APPLICATION_H MODIFY company_application_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 지도 필터
ALTER TABLE TBL_USER_MAP_FILTER_S MODIFY map_filter_sq BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;

-- 주소
ALTER TABLE TBL_ADDRESS_S MODIFY address_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 사용자
ALTER TABLE TBL_USER_M MODIFY user_sq BIGINT NOT NULL AUTO_INCREMENT;

-- 기업
ALTER TABLE TBL_COMPANY_S MODIFY company_sq BIGINT NOT NULL AUTO_INCREMENT;





-- ===========================================
-- 샘플데이터
-- ===========================================

-- ==========================================
-- STEP 1: 테스트 사용자 주소 데이터 추가
-- ==========================================

INSERT INTO TBL_ADDRESS_S (address_sq, zonecode, address, detail_address, sigungu, latitude, longitude, address_created_at_dtm, address_modified_at_dtm, area_code_sq) VALUES 
(8001, 07200, '서울특별시 영등포구 여의도동', '여의대로 108', '영등포구', 37.5219, 126.9243, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1));

-- 프로젝트 주소들 (실제 존재하는 주소들 - 테스트 사용자 주소 기준 반경 내)
INSERT INTO TBL_ADDRESS_S (address_sq, zonecode, address, detail_address, sigungu, latitude, longitude, address_created_at_dtm, address_modified_at_dtm, area_code_sq) VALUES 
-- 1km 내 (5개) - 실제 여의도 지역 주소들 (영등포구)
(9001, 07200, '서울특별시 영등포구 여의도동', '국제금융로 10', '영등포구', 37.5252, 126.9281, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),
(9002, 07200, '서울특별시 영등포구 여의도동', '여의공원로 68', '영등포구', 37.5189, 126.9201, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),
(9003, 07200, '서울특별시 영등포구 여의도동', '여의대로 112', '영등포구', 37.5223, 126.9254, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),
(9004, 07200, '서울특별시 영등포구 여의도동', '여의나루로 76', '영등포구', 37.5278, 126.9321, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),
(9005, 07327, '서울특별시 영등포구 당산동', '당산로 123', '영등포구', 37.5344, 126.8956, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),

-- 3km 내 (8개) - 실제 존재하는 주소들
(9006, 07995, '서울특별시 양천구 목동', '목동로 213', '양천구', 37.5412, 126.8754, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '양천구' LIMIT 1), 1)),
(9007, 07995, '서울특별시 양천구 신정동', '신정로 123', '양천구', 37.5189, 126.8567, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '양천구' LIMIT 1), 1)),
(9008, 08209, '서울특별시 구로구 구로동', '구로중앙로 182', '구로구', 37.4850, 126.9012, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '구로구' LIMIT 1), 1)),
(9009, 07327, '서울특별시 영등포구 당산동', '당산로 123', '영등포구', 37.5344, 126.8956, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),
(9010, 07327, '서울특별시 영등포구 영등포동', '영등포로 150', '영등포구', 37.5156, 126.9078, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),
(9011, 07995, '서울특별시 양천구 목동', '신월로 379', '양천구', 37.5323, 126.8345, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '양천구' LIMIT 1), 1)),
(9012, 08209, '서울특별시 구로구 신도림동', '신도림로 123', '구로구', 37.5089, 126.8789, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '구로구' LIMIT 1), 1)),
(9013, 07327, '서울특별시 영등포구 여의도동', '여의나루로 115', '영등포구', 37.5187, 126.9134, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),

-- 5km 내 (7개) - 실제 존재하는 주소들
(9014, 08209, '서울특별시 구로구 가리봉동', '가리봉로 123', '구로구', 37.4750, 126.8750, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '구로구' LIMIT 1), 1)),
(9015, 07995, '서울특별시 양천구 신월동', '신월로 379', '양천구', 37.5550, 126.8350, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '양천구' LIMIT 1), 1)),
(9016, 07200, '서울특별시 영등포구 신길동', '신길로 123', '영등포구', 37.5150, 126.8450, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),
(9017, 08209, '서울특별시 구로구 신도림동', '신도림로 123', '구로구', 37.4950, 126.8550, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '구로구' LIMIT 1), 1)),
(9018, 07995, '서울특별시 양천구 신정동', '신정로 123', '양천구', 37.5450, 126.8150, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '양천구' LIMIT 1), 1)),
(9019, 07200, '서울특별시 영등포구 대림동', '대림로 123', '영등포구', 37.5050, 126.8450, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '영등포구' LIMIT 1), 1)),
(9020, 08209, '서울특별시 구로구 오류동', '오류로 123', '구로구', 37.4850, 126.8350, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '구로구' LIMIT 1), 1)),

-- 10km 내 (5개) - 실제 존재하는 주소들 (강남, 서초 지역)
(9021, 06292, '서울특별시 강남구 역삼동', '테헤란로 123', '강남구', 37.5013, 127.0396, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '강남구' LIMIT 1), 1)),
(9022, 06611, '서울특별시 서초구 서초동', '서초대로 456', '서초구', 37.4919, 127.0079, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '서초구' LIMIT 1), 1)),
(9023, 06551, '서울특별시 서초구 반포동', '반포대로 789', '서초구', 37.5081, 126.9956, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '서초구' LIMIT 1), 1)),
(9024, 06292, '서울특별시 강남구 논현동', '논현로 101', '강남구', 37.5075, 127.0271, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '강남구' LIMIT 1), 1)),
(9025, 06611, '서울특별시 서초구 잠원동', '잠원로 202', '서초구', 37.5156, 126.0123, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '서초구' LIMIT 1), 1)),

-- 20km 내 (5개) - 실제 존재하는 주소들 (송파, 강동 지역)
(9026, 05675, '서울특별시 송파구 잠실동', '올림픽로 303', '송파구', 37.5153, 127.1033, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '송파구' LIMIT 1), 1)),
(9027, 05675, '서울특별시 송파구 문정동', '문정로 404', '송파구', 37.4851, 127.1225, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '송파구' LIMIT 1), 1)),
(9028, 05246, '서울특별시 강동구 천호동', '천호대로 505', '강동구', 37.5385, 127.1234, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '강동구' LIMIT 1), 1)),
(9029, 05675, '서울특별시 송파구 가락동', '가락로 606', '송파구', 37.4989, 127.1102, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '송파구' LIMIT 1), 1)),
(9030, 05246, '서울특별시 강동구 성내동', '성내로 707', '강동구', 37.5345, 127.1345, NOW(), NOW(), 
    COALESCE((SELECT area_code_sq FROM TBL_AREA_C WHERE area_sigungu = '강동구' LIMIT 1), 1));

-- ==========================================
-- STEP 2: 테스트 사용자 데이터 추가
-- ==========================================
-- 테스트 사용자 (프리랜서 - 지도 검색을 할 사용자)
INSERT INTO TBL_USER_M (user_sq, address_sq, user_id, user_email, user_pw, user_nm, user_gender_cd, user_phone_num, user_birth_dt, user_type_cd, user_signup_type_cd, user_agreed_privacy_policy_yn, user_created_at_dtm, user_modified_at_dtm, user_is_deleted_yn, user_refresh_token, user_is_activate_yn) VALUES 
(8001, 8001, 'test_freelancer', 'test@freelancer.com', '$2a$10$test1234567890', '테스트프리랜서', NULL, '010-1234-5678', '1990-01-01', 301, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y');

-- 회사 계정들 (프로젝트 등록하는 회사들)
INSERT INTO TBL_USER_M (user_sq, address_sq, user_id, user_email, user_pw, user_nm, user_gender_cd, user_phone_num, user_birth_dt, user_type_cd, user_signup_type_cd, user_agreed_privacy_policy_yn, user_created_at_dtm, user_modified_at_dtm, user_is_deleted_yn, user_refresh_token, user_is_activate_yn) VALUES 
(9001, 9001, 'test_company1', 'test1@company.com', '$2a$10$test1234567890', '테스트담당자1', NULL, '010-1111-1111', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9002, 9002, 'test_company2', 'test2@company.com', '$2a$10$test1234567890', '테스트담당자2', NULL, '010-2222-2222', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9003, 9003, 'test_company3', 'test3@company.com', '$2a$10$test1234567890', '테스트담당자3', NULL, '010-3333-3333', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9004, 9004, 'test_company4', 'test4@company.com', '$2a$10$test1234567890', '테스트담당자4', NULL, '010-4444-4444', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9005, 9005, 'test_company5', 'test5@company.com', '$2a$10$test1234567890', '테스트담당자5', NULL, '010-5555-5555', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9006, 9006, 'test_company6', 'test6@company.com', '$2a$10$test1234567890', '테스트담당자6', NULL, '010-6666-6666', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9007, 9007, 'test_company7', 'test7@company.com', '$2a$10$test1234567890', '테스트담당자7', NULL, '010-7777-7777', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9008, 9008, 'test_company8', 'test8@company.com', '$2a$10$test1234567890', '테스트담당자8', NULL, '010-8888-8888', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9009, 9009, 'test_company9', 'test9@company.com', '$2a$10$test1234567890', '테스트담당자9', NULL, '010-9999-9999', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9010, 9010, 'test_company10', 'test10@company.com', '$2a$10$test1234567890', '테스트담당자10', NULL, '010-1010-1010', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9011, 9011, 'test_company11', 'test11@company.com', '$2a$10$test1234567890', '테스트담당자11', NULL, '010-1111-2222', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9012, 9012, 'test_company12', 'test12@company.com', '$2a$10$test1234567890', '테스트담당자12', NULL, '010-2222-3333', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9013, 9013, 'test_company13', 'test13@company.com', '$2a$10$test1234567890', '테스트담당자13', NULL, '010-3333-4444', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9014, 9014, 'test_company14', 'test14@company.com', '$2a$10$test1234567890', '테스트담당자14', NULL, '010-4444-5555', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9015, 9015, 'test_company15', 'test15@company.com', '$2a$10$test1234567890', '테스트담당자15', NULL, '010-5555-6666', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9016, 9016, 'test_company16', 'test16@company.com', '$2a$10$test1234567890', '테스트담당자16', NULL, '010-6666-7777', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9017, 9017, 'test_company17', 'test17@company.com', '$2a$10$test1234567890', '테스트담당자17', NULL, '010-7777-8888', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9018, 9018, 'test_company18', 'test18@company.com', '$2a$10$test1234567890', '테스트담당자18', NULL, '010-8888-9999', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9019, 9019, 'test_company19', 'test19@company.com', '$2a$10$test1234567890', '테스트담당자19', NULL, '010-9999-1010', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9020, 9020, 'test_company20', 'test20@company.com', '$2a$10$test1234567890', '테스트담당자20', NULL, '010-1010-1111', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9021, 9021, 'test_company21', 'test21@company.com', '$2a$10$test1234567890', '테스트담당자21', NULL, '010-1111-1212', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9022, 9022, 'test_company22', 'test22@company.com', '$2a$10$test1234567890', '테스트담당자22', NULL, '010-2222-1313', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9023, 9023, 'test_company23', 'test23@company.com', '$2a$10$test1234567890', '테스트담당자23', NULL, '010-3333-1414', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9024, 9024, 'test_company24', 'test24@company.com', '$2a$10$test1234567890', '테스트담당자24', NULL, '010-4444-1515', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9025, 9025, 'test_company25', 'test25@company.com', '$2a$10$test1234567890', '테스트담당자25', NULL, '010-5555-1616', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9026, 9026, 'test_company26', 'test26@company.com', '$2a$10$test1234567890', '테스트담당자26', NULL, '010-6666-1717', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9027, 9027, 'test_company27', 'test27@company.com', '$2a$10$test1234567890', '테스트담당자27', NULL, '010-7777-1818', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9028, 9028, 'test_company28', 'test28@company.com', '$2a$10$test1234567890', '테스트담당자28', NULL, '010-8888-1919', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9029, 9029, 'test_company29', 'test29@company.com', '$2a$10$test1234567890', '테스트담당자29', NULL, '010-9999-2020', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y'),
(9030, 9030, 'test_company30', 'test30@company.com', '$2a$10$test1234567890', '테스트담당자30', NULL, '010-1010-2121', NULL, 302, 201, 'Y', NOW(), NOW(), 'N', NULL, 'Y');

-- ==========================================
-- STEP 3: 회사 데이터 추가
-- ==========================================
INSERT INTO TBL_COMPANY_S (company_sq, user_sq, address_sq, company_agreed_terms_yn, company_nm, company_ceo_nm, company_open_dt, company_url, company_biz_num, company_is_recruiting_yn, company_greeting_txt, company_view_cnt, company_recruit_start_dtm) VALUES 
(9001, 9001, 9001, 'Y', 'ABC 테크놀로지', '홍길동', '2020-01-15', 'http://abc-tech.com', '123-45-67890', 'Y', '혁신적인 IT 기업입니다', 0, NULL),
(9002, 9002, 9002, 'Y', 'XYZ 스타트업', '김철수', '2021-03-20', 'http://xyz-startup.com', '234-56-78901', 'Y', '빠르게 성장하는 스타트업', 0, NULL),
(9003, 9003, 9003, 'Y', 'DEF 솔루션', '이영희', '2019-05-10', 'http://def-solution.com', '345-67-89012', 'Y', '믿을 수 있는 파트너', 0, NULL),
(9004, 9004, 9004, 'Y', 'GHI 플랫폼', '박민수', '2022-07-01', 'http://ghi-platform.com', '456-78-90123', 'Y', '최고의 개발 환경', 0, NULL),
(9005, 9005, 9005, 'Y', 'JKL 시스템즈', '최지현', '2018-11-25', 'http://jkl-systems.com', '567-89-01234', 'Y', '안정적인 기업', 0, NULL),
(9006, 9006, 9006, 'Y', 'MNO 소프트웨어', '정수진', '2020-06-10', 'http://mno-soft.com', '678-90-12345', 'Y', '창의적인 소프트웨어 개발', 0, NULL),
(9007, 9007, 9007, 'Y', 'PQR 디지털', '한민호', '2021-09-05', 'http://pqr-digital.com', '789-01-23456', 'Y', '디지털 혁신의 선도기업', 0, NULL),
(9008, 9008, 9008, 'Y', 'STU 인텔리전스', '서지영', '2019-12-15', 'http://stu-intel.com', '890-12-34567', 'Y', 'AI와 데이터 분석 전문', 0, NULL),
(9009, 9009, 9009, 'Y', 'VWX 네트워크', '윤태호', '2022-02-20', 'http://vwx-network.com', '901-23-45678', 'Y', '네트워크 보안 전문기업', 0, NULL),
(9010, 9010, 9010, 'Y', 'YZA 클라우드', '임소영', '2020-08-30', 'http://yza-cloud.com', '012-34-56789', 'Y', '클라우드 솔루션 전문', 0, NULL),
(9011, 9011, 9011, 'Y', 'BCD 모바일', '강동훈', '2021-04-12', 'http://bcd-mobile.com', '123-45-67890', 'Y', '모바일 앱 개발 전문', 0, NULL),
(9012, 9012, 9012, 'Y', 'EFG 웹솔루션', '송미래', '2019-07-25', 'http://efg-web.com', '234-56-78901', 'Y', '웹 개발의 새로운 패러다임', 0, NULL),
(9013, 9013, 9013, 'Y', 'HIJ 게임즈', '오준석', '2020-11-08', 'http://hij-games.com', '345-67-89012', 'Y', '게임 개발의 혁신', 0, NULL),
(9014, 9014, 9014, 'Y', 'KLM 블록체인', '신유나', '2021-01-18', 'http://klm-blockchain.com', '456-78-90123', 'Y', '블록체인 기술 선도', 0, NULL),
(9015, 9015, 9015, 'Y', 'NOP 머신러닝', '조현우', '2022-05-03', 'http://nop-ml.com', '567-89-01234', 'Y', '머신러닝 AI 전문', 0, NULL),
(9016, 9016, 9016, 'Y', 'QRS 데브옵스', '황서연', '2020-03-22', 'http://qrs-devops.com', '678-90-12345', 'Y', 'DevOps 자동화 전문', 0, NULL),
(9017, 9017, 9017, 'Y', 'TUV 프론트엔드', '배준호', '2021-08-14', 'http://tuv-frontend.com', '789-01-23456', 'Y', '프론트엔드 개발 전문', 0, NULL),
(9018, 9018, 9018, 'Y', 'WXY 백엔드', '김나영', '2019-10-07', 'http://wxy-backend.com', '890-12-34567', 'Y', '백엔드 시스템 전문', 0, NULL),
(9019, 9019, 9019, 'Y', 'ZAB 풀스택', '이상민', '2022-01-29', 'http://zab-fullstack.com', '901-23-45678', 'Y', '풀스택 개발 전문', 0, NULL),
(9020, 9020, 9020, 'Y', 'CDE 데이터', '박지은', '2020-12-11', 'http://cde-data.com', '012-34-56789', 'Y', '빅데이터 분석 전문', 0, NULL),
(9021, 9021, 9021, 'Y', 'FGH 사이버', '최동규', '2021-06-26', 'http://fgh-cyber.com', '123-45-67890', 'Y', '사이버 보안 전문', 0, NULL),
(9022, 9022, 9022, 'Y', 'IJK 인프라', '정소라', '2019-09-13', 'http://ijk-infra.com', '234-56-78901', 'Y', 'IT 인프라 전문', 0, NULL),
(9023, 9023, 9023, 'Y', 'LMN 아키텍처', '한승우', '2020-04-17', 'http://lmn-arch.com', '345-67-89012', 'Y', '시스템 아키텍처 전문', 0, NULL),
(9024, 9024, 9024, 'Y', 'OPQ 테스팅', '윤하늘', '2022-03-09', 'http://opq-testing.com', '456-78-90123', 'Y', '소프트웨어 테스팅 전문', 0, NULL),
(9025, 9025, 9025, 'Y', 'RST 컨설팅', '임태준', '2021-11-21', 'http://rst-consulting.com', '567-89-01234', 'Y', 'IT 컨설팅 전문', 0, NULL),
(9026, 9026, 9026, 'Y', 'UVW 아웃소싱', '강미주', '2020-07-04', 'http://uvw-outsourcing.com', '678-90-12345', 'Y', 'IT 아웃소싱 전문', 0, NULL),
(9027, 9027, 9027, 'Y', 'XYZ 스타트업2', '송지훈', '2021-12-16', 'http://xyz-startup2.com', '789-01-23456', 'Y', '혁신적인 스타트업', 0, NULL),
(9028, 9028, 9028, 'Y', 'ABC 글로벌', '오서영', '2019-05-28', 'http://abc-global.com', '890-12-34567', 'Y', '글로벌 IT 솔루션', 0, NULL),
(9029, 9029, 9029, 'Y', 'DEF 혁신', '신동현', '2022-08-02', 'http://def-innovation.com', '901-23-45678', 'Y', '기술 혁신 전문', 0, NULL),
(9030, 9030, 9030, 'Y', 'GHI 퓨처', '조예린', '2020-10-19', 'http://ghi-future.com', '012-34-56789', 'Y', '미래 기술 전문', 0, NULL);

-- ==========================================
-- STEP 4: 프로젝트 데이터 추가 (반경 테스트용 확장)
-- 사용자 위치 기준으로 다양한 거리에 배치
-- ==========================================

-- 1km 내 프로젝트 (5개)
INSERT INTO TBL_PROJECT_M (project_sq, company_sq, address_sq, project_ttl, project_image_url, project_developer_grade_cd, project_required_education_cd, project_salary, project_start_dt, project_end_dt, project_recruit_start_dt, project_recruit_end_dt, project_preference_txt, project_description_txt, project_created_at_dtm, project_modified_at_dtm, project_candidate_cnt, project_scrap_cnt, project_is_notification_yn, project_is_deleted_yn, project_view_cnt, project_activate_yn) VALUES 
(9001, 9001, 9001, '웹 개발 프로젝트', NULL, 701, 2101, 5000000, '2025-02-01', '2025-08-01', '2025-01-01', '2025-12-31', '리액트 경험자 우대', '여의도에서 진행되는 웹 개발 프로젝트입니다. 프론트엔드 개발자를 모집합니다.', '2024-10-15 09:30:00', '2024-10-16 14:20:00', 8, 42, 'Y', 'N', 285, 'Y'),
(9002, 9002, 9002, '모바일 앱 개발', NULL, 701, 2101, 6000000, '2025-03-01', '2025-09-01', '2025-01-01', '2025-12-31', 'Flutter 경험자 우대', '목동에서 진행되는 모바일 앱 개발 프로젝트입니다. 백엔드 개발자를 모집합니다.', '2024-10-18 11:15:00', '2024-10-19 10:05:00', 12, 28, 'Y', 'N', 456, 'Y'),
(9003, 9003, 9003, '데이터베이스 관리', NULL, 701, 2101, 7000000, '2025-02-15', '2025-08-15', '2025-01-01', '2025-12-31', 'Oracle 경험자 우대', '구로디지털단지 데이터베이스 관리 프로젝트입니다. DBA를 모집합니다.', '2024-10-22 14:45:00', '2024-10-23 09:30:00', 15, 65, 'Y', 'N', 178, 'Y'),
(9004, 9004, 9004, 'AI 서비스 개발', NULL, 701, 2101, 8000000, '2025-04-01', '2025-10-01', '2025-01-01', '2025-12-31', 'Python 경험자 우대', '당산동 AI 서비스 개발 프로젝트입니다. 백엔드 개발자를 모집합니다.', '2024-10-25 16:20:00', '2024-10-26 11:40:00', 18, 73, 'Y', 'N', 523, 'Y');
-- (9005, 9005, 9005, '클라우드 인프라 구축', NULL, 701, 2101, 9000000, '2025-05-01', '2025-11-01', '2025-01-01', '2025-12-31', 'AWS 경험자 우대', '신정동 클라우드 인프라 구축 프로젝트입니다. DevOps 엔지니어를 모집합니다.', NOW(), NOW(), 0, 0, 'Y', 'N', 0, 'N');

-- 3km 내 프로젝트 (8개)
INSERT INTO TBL_PROJECT_M (project_sq, company_sq, address_sq, project_ttl, project_image_url, project_developer_grade_cd, project_required_education_cd, project_salary, project_start_dt, project_end_dt, project_recruit_start_dt, project_recruit_end_dt, project_preference_txt, project_description_txt, project_created_at_dtm, project_modified_at_dtm, project_candidate_cnt, project_scrap_cnt, project_is_notification_yn, project_is_deleted_yn, project_view_cnt, project_activate_yn) VALUES 
(9006, 9006, 9006, 'Vue.js 프론트엔드 개발', NULL, 701, 2101, 5500000, '2025-02-10', '2025-08-10', '2025-01-01', '2025-12-31', 'Vue.js 경험자 우대', '여의도 Vue.js 프론트엔드 개발 프로젝트입니다.', '2024-10-28 10:15:00', '2024-10-28 10:15:00', 5, 18, 'Y', 'N', 134, 'Y'),
(9007, 9007, 9007, 'Spring Boot 백엔드 개발', NULL, 701, 2101, 6500000, '2025-03-10', '2025-09-10', '2025-01-01', '2025-12-31', 'Spring Boot 경험자 우대', '목동 Spring Boot 백엔드 개발 프로젝트입니다.', '2024-10-30 13:45:00', '2024-10-31 09:20:00', 22, 56, 'Y', 'N', 412, 'Y'),
(9008, 9008, 9008, 'React Native 앱 개발', NULL, 701, 2101, 7500000, '2025-02-20', '2025-08-20', '2025-01-01', '2025-12-31', 'React Native 경험자 우대', '구로 React Native 앱 개발 프로젝트입니다.', '2024-11-01 08:30:00', '2024-11-02 14:10:00', 11, 34, 'Y', 'N', 267, 'Y'),
(9009, 9009, 9009, 'Node.js 서버 개발', NULL, 701, 2101, 6000000, '2025-04-10', '2025-10-10', '2025-01-01', '2025-12-31', 'Node.js 경험자 우대', '당산 Node.js 서버 개발 프로젝트입니다.', '2024-11-03 15:20:00', '2024-11-03 15:20:00', 7, 23, 'Y', 'N', 195, 'Y'),
(9010, 9010, 9010, 'Docker 컨테이너화', NULL, 701, 2101, 7000000, '2025-05-10', '2025-11-10', '2025-01-01', '2025-12-31', 'Docker 경험자 우대', '신정 Docker 컨테이너화 프로젝트입니다.', '2024-10-20 12:00:00', '2024-10-21 10:30:00', 14, 47, 'Y', 'N', 328, 'Y'),
(9011, 9011, 9011, 'TypeScript 개발', NULL, 701, 2101, 5800000, '2025-02-15', '2025-08-15', '2025-01-01', '2025-12-31', 'TypeScript 경험자 우대', '여의도 TypeScript 개발 프로젝트입니다.', '2024-10-17 09:45:00', '2024-10-17 16:25:00', 3, 12, 'Y', 'N', 89, 'Y'),
(9012, 9012, 9012, 'GraphQL API 개발', NULL, 701, 2101, 6800000, '2025-03-15', '2025-09-15', '2025-01-01', '2025-12-31', 'GraphQL 경험자 우대', '목동 GraphQL API 개발 프로젝트입니다.', '2024-10-24 11:30:00', '2024-10-25 08:50:00', 19, 61, 'Y', 'N', 378, 'Y'),
(9013, 9013, 9013, 'MongoDB 데이터베이스', NULL, 701, 2101, 6200000, '2025-02-25', '2025-08-25', '2025-01-01', '2025-12-31', 'MongoDB 경험자 우대', '구로 MongoDB 데이터베이스 프로젝트입니다.', '2024-10-27 14:20:00', '2024-10-28 11:15:00', 9, 29, 'Y', 'N', 221, 'Y');

-- 5km 내 프로젝트 (7개)
INSERT INTO TBL_PROJECT_M (project_sq, company_sq, address_sq, project_ttl, project_image_url, project_developer_grade_cd, project_required_education_cd, project_salary, project_start_dt, project_end_dt, project_recruit_start_dt, project_recruit_end_dt, project_preference_txt, project_description_txt, project_created_at_dtm, project_modified_at_dtm, project_candidate_cnt, project_scrap_cnt, project_is_notification_yn, project_is_deleted_yn, project_view_cnt, project_activate_yn) VALUES 
(9014, 9014, 9014, 'Python Django 개발', NULL, 701, 2101, 7200000, '2025-03-01', '2025-09-01', '2025-01-01', '2025-12-31', 'Django 경험자 우대', '가리봉 Python Django 개발 프로젝트입니다.', '2024-10-16 13:00:00', '2024-10-17 10:45:00', 16, 52, 'Y', 'N', 298, 'Y'),
(9015, 9015, 9015, 'Angular 프론트엔드', NULL, 701, 2101, 6300000, '2025-04-01', '2025-10-01', '2025-01-01', '2025-12-31', 'Angular 경험자 우대', '신월 Angular 프론트엔드 프로젝트입니다.', '2024-10-19 08:25:00', '2024-10-19 08:25:00', 6, 20, 'Y', 'N', 152, 'Y'),
(9016, 9016, 9016, 'Laravel PHP 개발', NULL, 701, 2101, 5900000, '2025-02-20', '2025-08-20', '2025-01-01', '2025-12-31', 'Laravel 경험자 우대', '신길 Laravel PHP 개발 프로젝트입니다.', '2024-10-21 15:50:00', '2024-10-22 12:30:00', 10, 38, 'Y', 'N', 243, 'Y'),
(9017, 9017, 9017, 'Redis 캐시 시스템', NULL, 701, 2101, 6100000, '2025-03-20', '2025-09-20', '2025-01-01', '2025-12-31', 'Redis 경험자 우대', '신도림 Redis 캐시 시스템 프로젝트입니다.', '2024-10-23 11:10:00', '2024-10-24 09:05:00', 13, 44, 'Y', 'N', 315, 'Y'),
(9018, 9018, 9018, 'Kubernetes 오케스트레이션', NULL, 701, 2101, 7800000, '2025-05-01', '2025-11-01', '2025-01-01', '2025-12-31', 'Kubernetes 경험자 우대', '신정 Kubernetes 오케스트레이션 프로젝트입니다.', '2024-10-26 09:40:00', '2024-10-27 14:15:00', 21, 68, 'Y', 'N', 489, 'Y'),
(9019, 9019, 9019, 'Elasticsearch 검색엔진', NULL, 701, 2101, 6700000, '2025-04-15', '2025-10-15', '2025-01-01', '2025-12-31', 'Elasticsearch 경험자 우대', '대림 Elasticsearch 검색엔진 프로젝트입니다.', '2024-10-29 12:55:00', '2024-10-30 08:40:00', 17, 55, 'Y', 'N', 367, 'Y'),
(9020, 9020, 9020, 'Apache Kafka 스트리밍', NULL, 701, 2101, 7300000, '2025-03-05', '2025-09-05', '2025-01-01', '2025-12-31', 'Kafka 경험자 우대', '오류 Apache Kafka 스트리밍 프로젝트입니다.', '2024-11-02 10:20:00', '2024-11-02 16:50:00', 20, 59, 'Y', 'N', 401, 'Y');

-- 10km 내 프로젝트 (5개)
INSERT INTO TBL_PROJECT_M (project_sq, company_sq, address_sq, project_ttl, project_image_url, project_developer_grade_cd, project_required_education_cd, project_salary, project_start_dt, project_end_dt, project_recruit_start_dt, project_recruit_end_dt, project_preference_txt, project_description_txt, project_created_at_dtm, project_modified_at_dtm, project_candidate_cnt, project_scrap_cnt, project_is_notification_yn, project_is_deleted_yn, project_view_cnt, project_activate_yn) VALUES 
(9021, 9021, 9021, 'TensorFlow AI 개발', NULL, 701, 2101, 8500000, '2025-04-01', '2025-10-01', '2025-01-01', '2025-12-31', 'TensorFlow 경험자 우대', '개봉 TensorFlow AI 개발 프로젝트입니다.', '2024-10-14 10:05:00', '2024-10-15 09:20:00', 25, 78, 'Y', 'N', 502, 'Y'),
(9022, 9022, 9022, 'Blockchain DApp 개발', NULL, 701, 2101, 9200000, '2025-05-01', '2025-11-01', '2025-01-01', '2025-12-31', 'Blockchain 경험자 우대', '신월 Blockchain DApp 개발 프로젝트입니다.', '2024-10-12 14:30:00', '2024-10-13 11:15:00', 23, 71, 'Y', 'N', 467, 'Y'),
(9023, 9023, 9023, 'Microservices 아키텍처', NULL, 701, 2101, 8800000, '2025-03-15', '2025-09-15', '2025-01-01', '2025-12-31', 'Microservices 경험자 우대', '신길 Microservices 아키텍처 프로젝트입니다.', '2024-10-31 16:40:00', '2024-11-01 13:25:00', 4, 15, 'Y', 'N', 103, 'Y'),
(9024, 9024, 9024, 'WebRTC 실시간 통신', NULL, 701, 2101, 7600000, '2025-04-15', '2025-10-15', '2025-01-01', '2025-12-31', 'WebRTC 경험자 우대', '신도림 WebRTC 실시간 통신 프로젝트입니다.', '2024-10-11 09:15:00', '2024-10-11 15:45:00', 2, 9, 'Y', 'N', 67, 'Y'),
(9025, 9025, 9025, 'OpenCV 컴퓨터 비전', NULL, 701, 2101, 8100000, '2025-02-28', '2025-08-28', '2025-01-01', '2025-12-31', 'OpenCV 경험자 우대', '신정 OpenCV 컴퓨터 비전 프로젝트입니다.', '2024-10-13 11:50:00', '2024-10-14 10:30:00', 1, 7, 'Y', 'N', 54, 'Y');

-- 20km 내 프로젝트 (5개)
INSERT INTO TBL_PROJECT_M (project_sq, company_sq, address_sq, project_ttl, project_image_url, project_developer_grade_cd, project_required_education_cd, project_salary, project_start_dt, project_end_dt, project_recruit_start_dt, project_recruit_end_dt, project_preference_txt, project_description_txt, project_created_at_dtm, project_modified_at_dtm, project_candidate_cnt, project_scrap_cnt, project_is_notification_yn, project_is_deleted_yn, project_view_cnt, project_activate_yn) VALUES 
(9026, 9026, 9026, 'Hadoop 빅데이터 처리', NULL, 701, 2101, 9500000, '2025-06-01', '2025-12-01', '2025-01-01', '2025-12-31', 'Hadoop 경험자 우대', '개봉 Hadoop 빅데이터 처리 프로젝트입니다.', '2024-10-10 08:20:00', '2024-10-10 08:20:00', 0, 5, 'Y', 'N', 42, 'Y'),
(9027, 9027, 9027, 'Spark 실시간 분석', NULL, 701, 2101, 9800000, '2025-07-01', '2026-01-01', '2025-01-01', '2025-12-31', 'Spark 경험자 우대', '신월 Spark 실시간 분석 프로젝트입니다.', '2024-10-09 13:45:00', '2024-10-09 17:30:00', 0, 8, 'Y', 'N', 61, 'Y'),
(9028, 9028, 9028, 'Neural Network 딥러닝', NULL, 701, 2101, 10200000, '2025-08-01', '2026-02-01', '2025-01-01', '2025-12-31', '딥러닝 경험자 우대', '신길 Neural Network 딥러닝 프로젝트입니다.', '2024-10-08 10:10:00', '2024-10-08 15:25:00', 24, 80, 'Y', 'N', 534, 'Y'),
(9029, 9029, 9029, 'Quantum Computing 연구', NULL, 701, 2101, 12000000, '2025-09-01', '2026-03-01', '2025-01-01', '2025-12-31', '양자컴퓨팅 연구자 우대', '신도림 Quantum Computing 연구 프로젝트입니다.', '2024-10-07 14:55:00', '2024-10-08 09:40:00', 0, 11, 'Y', 'N', 76, 'Y'),
(9030, 9030, 9030, 'Edge Computing IoT', NULL, 701, 2101, 8900000, '2025-10-01', '2026-04-01', '2025-01-01', '2025-12-31', 'IoT 경험자 우대', '신정 Edge Computing IoT 프로젝트입니다.', '2024-10-06 11:30:00', '2024-10-07 08:15:00', 0, 6, 'Y', 'N', 48, 'Y');

-- ==========================================
-- STEP 5: 프로젝트 모집 직무 데이터 추가
-- ==========================================
-- 각 프로젝트별로 직무 배정 (프론트엔드, 백엔드, DBA)

INSERT INTO TBL_PROJECT_RECRUIT_JOB_ROLE_S (recruit_job_role_sq, project_sq, recruit_job_position_type_cd) VALUES 
-- 1km 내 프로젝트들 (5개)
(80001, 9001, 1001), -- 웹 개발 프로젝트 → 프론트엔드
(80002, 9002, 1002), -- 모바일 앱 개발 → 백엔드
(80003, 9003, 1003), -- 데이터베이스 관리 → DBA
(80004, 9004, 1002), -- AI 서비스 개발 → 백엔드
(80005, 9005, 1002), -- 클라우드 인프라 구축 → 백엔드

-- 3km 내 프로젝트들 (8개)
(80006, 9006, 1001), -- Vue.js 프론트엔드 개발 → 프론트엔드
(80007, 9007, 1002), -- Spring Boot 백엔드 개발 → 백엔드
(80008, 9008, 1001), -- React Native 앱 개발 → 프론트엔드
(80009, 9009, 1002), -- Node.js 서버 개발 → 백엔드
(80010, 9010, 1002), -- Docker 컨테이너화 → 백엔드
(80011, 9011, 1001), -- TypeScript 개발 → 프론트엔드
(80012, 9012, 1002), -- GraphQL API 개발 → 백엔드
(80013, 9013, 1003), -- MongoDB 데이터베이스 → DBA

-- 5km 내 프로젝트들 (7개)
(80014, 9014, 1002), -- Python Django 개발 → 백엔드
(80015, 9015, 1001), -- Angular 프론트엔드 → 프론트엔드
(80016, 9016, 1002), -- Laravel PHP 개발 → 백엔드
(80017, 9017, 1002), -- Redis 캐시 시스템 → 백엔드
(80018, 9018, 1002), -- Kubernetes 오케스트레이션 → 백엔드
(80019, 9019, 1003), -- Elasticsearch 검색엔진 → DBA
(80020, 9020, 1002), -- Apache Kafka 스트리밍 → 백엔드

-- 10km 내 프로젝트들 (5개)
(80021, 9021, 1002), -- TensorFlow AI 개발 → 백엔드
(80022, 9022, 1001), -- Blockchain DApp 개발 → 프론트엔드
(80023, 9023, 1002), -- Microservices 아키텍처 → 백엔드
(80024, 9024, 1002), -- WebRTC 실시간 통신 → 백엔드
(80025, 9025, 1002), -- OpenCV 컴퓨터 비전 → 백엔드

-- 20km 내 프로젝트들 (5개)
(80026, 9026, 1003), -- Hadoop 빅데이터 처리 → DBA
(80027, 9027, 1003), -- Spark 실시간 분석 → DBA
(80028, 9028, 1002), -- Neural Network 딥러닝 → 백엔드
(80029, 9029, 1002), -- Quantum Computing 연구 → 백엔드
(80030, 9030, 1002); -- Edge Computing IoT → 백엔드

-- 일부 프로젝트는 복수 직무 모집 (풀스택 프로젝트)
INSERT INTO TBL_PROJECT_RECRUIT_JOB_ROLE_S (recruit_job_role_sq, project_sq, recruit_job_position_type_cd) VALUES 
(80031, 9001, 1002), -- 웹 개발 프로젝트 → 프론트엔드 + 백엔드 (풀스택)
(80032, 9008, 1002), -- React Native 앱 개발 → 프론트엔드 + 백엔드 (풀스택)
(80033, 9022, 1002); -- Blockchain DApp 개발 → 프론트엔드 + 백엔드 (풀스택)


-- ==========================================
-- 기존 샘플데이터
-- ==========================================

INSERT INTO TBL_COMMON_CODE_C 
(common_code_sq, parent_common_code_sq, common_code_lvl, common_code_nm, common_code_english_nm) 
VALUES 
-- 대분류 코드
(100, NULL, 1, '성별_카테고리', 'gender_category'),
(200, NULL, 1, '소셜_카테고리', 'social_login_category'),
(300, NULL, 1, '회원_타입', 'member_type'),
(400, NULL, 1, '재직_상태', 'employment_status'),
(500, NULL, 1, '기업_지원_상태', 'company_application_status'),
(600, NULL, 1, '스크랩_구분', 'scrap_type'),
(700, NULL, 1, '개발자_등급', 'developer_grade'),
(800, NULL, 1, '프로젝트_지원_상태', 'project_application_status'),
(900, NULL, 1, '계약_형태', 'contract_type'),
(1000, NULL, 1, '직무_구분', 'job_position'),
(1100, NULL, 1, '프로젝트_이력_구분', 'project_history_type'),
(1200, NULL, 1, '졸업_상태', 'graduation_status'),
(1300, NULL, 1, '첨부파일_구분', 'attachment_type'),
(1400, NULL, 1, '게시판_구분', 'board_type'),
(1500, NULL, 1, 'QNA_채택_상태', 'qna_status'),
(1600, NULL, 1, '댓글_구분', 'comment_type'),
(1700, NULL, 1, '일반_태그_구분', 'general_tag_type'),
(1800, NULL, 1, '기술_태그_구분', 'tech_tag_type'),
(1900, NULL, 1, '추천_구분', 'recommend_type'),
(2000, NULL, 1, '신고_구분', 'report_type'),
(2100, NULL, 1, '요구_학력', 'require_education'),

-- 성별 코드
(101, 100, 2, '남성', 'MALE'),
(102, 100, 2, '여성', 'FEMALE'),

-- 소셜 로그인 코드
(201, 200, 2, '카카오', 'KAKAO'),
(202, 200, 2, '네이버', 'NAVER'),
(203, 200, 2, '구글', 'GOOGLE'),
(204, 200, 2, '이메일', 'EMAIL'),

-- 회원_타입 코드
(301, 300, 2, '개인', 'PERSONAL'),
(302, 300, 2, '기업', 'COMPANY'),
(303, 300, 2, '관리자', 'ADMIN'),

-- 재직_상태 코드
(401, 400, 2, '소속중', 'EMPLOYED'),
(402, 400, 2, '퇴사', 'RESIGNED'),

-- 기업_지원_상태 코드
(501, 500, 2, '지원중', 'APPLIED'),
(502, 500, 2, '합격', 'PASSED'),
(503, 500, 2, '불합격', 'FAILED'),

-- 스크랩_구분 코드
(601, 600, 2, '프로젝트', 'PROJECT'),
(602, 600, 2, '기업', 'COMPANY'),

-- 개발자_등급
(701, 700, 2, '초초', 'LOW_LOW'),
(702, 700, 2, '초중', 'LOW_MID'),
(703, 700, 2, '초상', 'LOW_HIGH'),
(704, 700, 2, '중초', 'MID_LOW'),
(705, 700, 2, '중중', 'MID_MID'),
(706, 700, 2, '중상', 'MID_HIGH'),
(707, 700, 2, '상초', 'HIGH_LOW'),
(708, 700, 2, '상중', 'HIGH_MID'),
(709, 700, 2, '상상', 'HIGH_HIGH'),

-- 프로젝트_지원_상태
(801, 800, 2, '지원중', 'APPLIED'),
(802, 800, 2, '불합격', 'FAILED'),
(803, 800, 2, '합격', 'PASSED'),
(804, 800, 2, '인터뷰요청중', 'INTERVIEW_REQUESTED'),
(805, 800, 2, '인터뷰확정', 'INTERVIEW_CONFIRMED'),

-- 계약_형태
(901, 900, 2, '정규직', 'FULL_TIME'),
(902, 900, 2, '계약직', 'CONTRACT'),
(903, 900, 2, '프리랜서', 'FREELANCER'),

-- 직무_구분
(1001, 1000, 2, '개발PM', 'DEVELOPMENT_PM'),
(1004, 1000, 2, '게임개발', 'GAME_DEVELOPMENT'),
(1003, 1000, 2, '데이터분석가', 'DATA_ANALYST'),
(1008, 1000, 2, '데이터엔지니어', 'DATA_ENGINEER'),
(1005, 1000, 2, '백엔드/서버개발', 'BACKEND_SERVER_DEVELOPMENT'),
(1006, 1000, 2, '보안컨설팅', 'SECURITY_CONSULTING'),
(1007, 1000, 2, '앱개발', 'APP_DEVELOPMENT'),
(1010, 1000, 2, '웹개발', 'WEB_DEVELOPMENT'),
(1009, 1000, 2, '웹마스터', 'WEBMASTER'),
(1014, 1000, 2, '퍼블리셔', 'PUBLISHER'),
(1011, 1000, 2, '프론트엔드', 'FRONTEND'),
(1012, 1000, 2, 'BI 엔지니어', 'BI_ENGINEER'),
(1013, 1000, 2, '시스템엔지니어', 'SYSTEM_ENGINEER'),
(1016, 1000, 2, 'SI개발', 'SI_DEVELOPMENT'),
(1015, 1000, 2, 'SQA', 'SQA'),
(1020, 1000, 2, '전문분야', 'SPECIALIZED_FIELD'),
(1017, 1000, 2, '검색엔진', 'SEARCH_ENGINE'),
(1018, 1000, 2, '네트워크', 'NETWORK'),
(1019, 1000, 2, '딥러닝', 'DEEP_LEARNING'),
(1021, 1000, 2, '머신러닝', 'MACHINE_LEARNING'),

-- 프로젝트_이력_구분 코드
(1101, 1100, 2, '운영', 'OPERATION'),
(1102, 1100, 2, '개발', 'DEVELOPMENT'),
(1103, 1100, 2, '운영/개발', 'OPERATION_DEVELOPMENT'),

-- 졸업_상태 코드
(1201, 1200, 2, '졸업', 'GRADUATED'),
(1202, 1200, 2, '졸업예정', 'EXPECTED_TO_GRADUATE'),

-- 첨부파일_구분 코드
(1301, 1300, 2, '일반게시판', 'BOARD'),
(1302, 1300, 2, '답변게시판', 'ANSWER'),
(1303, 1300, 2, '이력서', 'RESUME'),

-- 게시판_구분 코드
(1401, 1400, 2, '일반게시판', 'BOARD'),
(1402, 1400, 2, '답변게시판', 'ANSWER'),

-- QNA_채택_상태 코드
(1501, 1500, 2, '진행중', 'IN_PROGRESS'),
(1502, 1500, 2, '채택완료', 'COMPLETED'),
(1503, 1500, 2, '자체해결', 'SELF_SOLVED'),
(1504, 1500, 2, '미해결', 'UNSOLVED'),

-- 댓글_구분 코드
(1601, 1600, 2, '일반게시판', 'BOARD'),
(1602, 1600, 2, '답변게시판', 'ANSWER'),

-- 일반_태그_구분 코드
(1701, 1700, 2, '일반게시판', 'BOARD'),
(1702, 1700, 2, '답변게시판', 'ANSWER'),

-- 기술_태그_구분 코드
(1801, 1800, 2, 'QNA게시판', 'QNA'),
(1802, 1800, 2, '답변게시판', 'ANSWER'),

-- 추천_구분 코드
(1901, 1900, 2, '일반게시판', 'BOARD'),
(1902, 1900, 2, '답변게시판', 'ANSWER'),
(1903, 1900, 2, '댓글', 'COMMENT'),
(1904, 1900, 2, '대댓글', 'REPLY'),

-- 신고_구분 코드
(2001, 2000, 2, '일반게시판', 'BOARD'),
(2002, 2000, 2, '답변게시판', 'ANSWER'),
(2003, 2000, 2, '댓글', 'COMMENT'),
(2004, 2000, 2, '대댓글', 'REPLY'),

-- 요구_학력 코드
(2101, 2100, 2, '학력 무관', 'NO_EDUCATION_REQUIREMENT'),
(2102, 2100, 2, '고졸 이하', 'HIGH_SCHOOL_OR_BELOW'),
(2103, 2100, 2, '고졸 이상', 'HIGH_SCHOOL_OR_ABOVE'),
(2104, 2100, 2, '대학(2,3년제)', 'COLLEGE_2_3'),
(2105, 2100, 2, '대졸 이상', 'BACHELOR_OR_ABOVE'),
(2106, 2100, 2, '석사 이상', 'MASTER_OR_ABOVE'),
(2107, 2100, 2, '박사 이상', 'DOCTORAL_OR_ABOVE');

INSERT INTO TBL_SKILL_TAG_C (skill_tag_sq, skill_tag_lvl, skill_tag_nm, parent_skill_tag_sq) VALUES
(100, 1, '언어', NULL),
(200, 1, '프레임워크', NULL),
(300, 1, '툴', NULL),
(400, 1, '기종', NULL),
(500, 1, '운영체제', NULL),
(600, 1, 'DBMS', NULL),

(101, 2, 'Java', 100),
(102, 2, 'Python', 100),

(201, 2, 'Spring Boot', 200),
(202, 2, 'Django', 200),
(203, 2, 'React', 200),
(204, 2, 'Vue.js', 200),

(301, 2, 'Docker', 300),
(302, 2, 'Git', 300),

(401, 2, 'PC', 400),
(402, 2, '노트북', 400),

(501, 2, 'Windows', 500),
(502, 2, 'MacOS', 500),
(503, 2, 'Linux', 500),

(601, 2, 'MySQL', 600),
(602, 2, 'OracleDB', 600),
(603, 2, 'MongoDB', 600),
(604, 2, 'MariaDB', 600),
(605, 2, 'Redis', 600);

INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11000', '서울특별시', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11110', '종로구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11140', '중구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11170', '용산구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11200', '성동구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11215', '광진구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11230', '동대문구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11260', '중랑구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11290', '성북구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11305', '강북구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11320', '도봉구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11350', '노원구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11380', '은평구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11410', '서대문구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11440', '마포구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11470', '양천구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11500', '강서구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11530', '구로구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11545', '금천구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11560', '영등포구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11590', '동작구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11620', '관악구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11650', '서초구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11680', '강남구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11710', '송파구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('11740', '강동구', '11000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26000', '부산광역시', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26110', '중구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26140', '서구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26170', '동구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26200', '영도구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26230', '부산진구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26260', '동래구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26290', '남구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26320', '북구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26350', '해운대구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26380', '사하구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26410', '금정구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26440', '강서구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26470', '연제구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26500', '수영구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26530', '사상구', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('26710', '기장군', '26000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27000', '대구광역시', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27110', '중구', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27140', '동구', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27170', '서구', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27200', '남구', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27230', '북구', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27260', '수성구', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27290', '달서구', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27710', '달성군', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('27720', '군위군', '27000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28000', '인천광역시', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28110', '중구', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28140', '동구', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28177', '미추홀구', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28185', '연수구', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28200', '남동구', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28237', '부평구', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28245', '계양구', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28260', '서구', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28710', '강화군', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('28720', '옹진군', '28000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('29000', '광주광역시', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('29110', '광주 동구', '29000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('29140', '광주 서구', '29000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('29155', '광주 남구', '29000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('29170', '광주 북구', '29000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('29200', '광주 광산구', '29000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('30000', '대전광역시', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('30110', '동구', '30000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('30140', '중구', '30000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('30170', '서구', '30000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('30200', '유성구', '30000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('30230', '대덕구', '30000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('31000', '울산광역시', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('31110', '중구', '31000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('31140', '남구', '31000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('31170', '동구', '31000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('31200', '북구', '31000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('31710', '울주군', '31000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('36110', '세종특별자치시', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41000', '경기도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41111', '수원시 장안구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41113', '수원시 권선구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41115', '수원시 팔달구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41117', '수원시 영통구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41131', '성남시 수정구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41133', '성남시 중원구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41135', '성남시 분당구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41150', '의정부시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41171', '안양시 만안구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41173', '안양시 동안구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41192', '부천시 원미구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41194', '부천시 소사구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41196', '부천시 오정구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41210', '광명시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41220', '평택시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41250', '동두천시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41271', '안산시 상록구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41273', '안산시 단원구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41281', '고양시 덕양구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41285', '고양시 일산동구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41287', '고양시 일산서구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41290', '과천시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41310', '구리시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41360', '남양주시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41370', '오산시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41390', '시흥시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41410', '군포시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41430', '의왕시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41450', '하남시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41461', '용인시 처인구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41463', '용인시 기흥구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41465', '용인시 수지구', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41480', '파주시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41500', '이천시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41550', '안성시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41570', '김포시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41590', '화성시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41610', '광주시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41630', '양주시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41650', '포천시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41670', '여주시', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41800', '연천군', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41820', '가평군', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('41830', '양평군', '41000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43000', '충청북도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43111', '청주시 상당구', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43112', '청주시 서원구', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43113', '청주시 흥덕구', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43114', '청주시 청원구', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43130', '충주시', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43150', '제천시', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43720', '보은군', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43730', '옥천군', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43740', '영동군', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43745', '증평군', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43750', '진천군', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43760', '괴산군', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43770', '음성군', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('43800', '단양군', '43000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44000', '충청남도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44131', '천안시 동남구', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44133', '천안시 서북구', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44150', '공주시', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44180', '보령시', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44200', '아산시', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44210', '서산시', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44230', '논산시', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44250', '계룡시', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44270', '당진시', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44710', '금산군', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44760', '부여군', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44770', '서천군', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44790', '청양군', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44800', '홍성군', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44810', '예산군', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('44825', '태안군', '44000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46000', '전라남도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46110', '목포시', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46130', '여수시', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46150', '순천시', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46170', '나주시', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46230', '광양시', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46710', '담양군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46720', '곡성군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46730', '구례군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46770', '고흥군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46780', '보성군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46790', '화순군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46800', '장흥군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46810', '강진군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46820', '해남군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46830', '영암군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46840', '무안군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46860', '함평군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46870', '영광군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46880', '장성군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46890', '완도군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46900', '진도군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('46910', '신안군', '46000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47000', '경상북도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47111', '포항시 남구', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47113', '포항시 북구', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47130', '경주시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47150', '김천시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47170', '안동시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47190', '구미시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47210', '영주시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47230', '영천시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47250', '상주시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47280', '문경시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47290', '경산시', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47730', '의성군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47750', '청송군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47760', '영양군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47770', '영덕군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47820', '청도군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47830', '고령군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47840', '성주군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47850', '칠곡군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47900', '예천군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47920', '봉화군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47930', '울진군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('47940', '울릉군', '47000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48000', '경상남도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48121', '창원시 의창구', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48123', '창원시 성산구', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48125', '창원시 마산합포구', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48127', '창원시 마산회원구', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48129', '창원시 진해구', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48170', '진주시', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48220', '통영시', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48240', '사천시', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48250', '김해시', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48270', '밀양시', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48310', '거제시', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48330', '양산시', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48720', '의령군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48730', '함안군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48740', '창녕군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48820', '고성군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48840', '남해군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48850', '하동군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48860', '산청군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48870', '함양군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48880', '거창군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('48890', '합천군', '48000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('50000', '제주도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('50110', '제주도 제주시', '50000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('50130', '제주도 서귀포시', '50000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51000', '강원도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51110', '춘천시', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51130', '원주시', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51150', '강릉시', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51170', '동해시', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51190', '태백시', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51210', '속초시', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51230', '삼척시', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51720', '홍천군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51730', '횡성군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51750', '영월군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51760', '평창군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51770', '정선군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51780', '철원군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51790', '화천군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51800', '양구군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51810', '인제군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51820', '고성군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('51830', '양양군', '51000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52000', '전라북도', NULL);
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52111', '전주시 완산구', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52113', '전주시 덕진구', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52130', '군산시', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52140', '익산시', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52180', '정읍시', '52000');

INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52190', '남원시', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52210', '김제시', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52710', '완주군', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52720', '진안군', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52730', '무주군', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52740', '장수군', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52750', '임실군', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52770', '순창군', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52790', '고창군', '52000');
INSERT INTO TBL_AREA_C (area_code_sq, area_sigungu, parent_area_code_sq) VALUES ('52800', '부안군', '52000');


-- ==========================================
-- 커뮤니티 기능 테스트용 샘플 데이터
-- ==========================================

-- 1. 게시판 게시글 (QNA 게시판)
INSERT INTO TBL_BOARD_M (board_sq, user_sq, board_ttl, board_description_edt, board_created_at_dtm, board_modified_at_dtm, board_view_cnt, board_comment_cnt, board_recommend_cnt, board_adopt_status_cd, board_is_deleted_yn, board_typ, board_type_cd) VALUES 
(7001, 8001, 'Spring Boot 에러 해결 방법 문의', '<p>Spring Boot 프로젝트에서 DB 연결 오류가 발생합니다. 어떻게 해결해야 할까요?</p>', NOW(), NOW(), 15, 2, 5, 1501, 'N', 'QNA', 1401),
(7002, 9001, 'React Hook 사용법 질문', '<p>useEffect Hook을 사용할 때 dependency array를 어떻게 설정해야 하나요?</p>', NOW(), NOW(), 23, 3, 8, 1502, 'N', 'QNA', 1401),
(7003, 9002, 'Docker 컨테이너 배포 이슈', '<p>Docker 컨테이너를 AWS에 배포할 때 포트 충돌이 발생합니다.</p>', NOW(), NOW(), 10, 1, 2, 1501, 'N', 'QNA', 1401);

-- 2. 답변 게시글
INSERT INTO TBL_BOARD_ANSWER_S (answer_sq, user_sq, board_sq, answer_ttl, answer_description_edt, answer_created_at_dtm, answer_modified_at_dtm, answer_view_cnt, answer_comment_cnt, answer_recommend_cnt, answer_is_adopted_yn, answer_is_deleted_yn) VALUES 
(7101, 9003, 7001, 'application.yml 설정 확인하세요', '<p>데이터베이스 연결 설정에서 url, username, password를 확인해보세요.</p>', NOW(), NOW(), 8, 1, 3, 'Y', 'N'),
(7102, 9004, 7001, 'Driver 의존성 추가 필요', '<p>build.gradle에 MySQL 드라이버 의존성을 추가하셨는지 확인하세요.</p>', NOW(), NOW(), 5, 0, 1, 'N', 'N'),
(7103, 9005, 7002, 'dependency array 설명', '<p>useEffect의 두 번째 인자로 빈 배열을 전달하면 컴포넌트 마운트 시 한 번만 실행됩니다.</p>', NOW(), NOW(), 12, 2, 6, 'Y', 'N');

-- 3. 댓글
INSERT INTO TBL_BOARD_COMMENT_S (comment_sq, user_sq, board_sq, answer_sq, comment_description_txt, comment_created_at_dtm, comment_modified_at_dtm, comment_recommend_cnt, comment_is_deleted_yn, comment_type_cd) VALUES 
(7201, 9006, 7001, NULL, '저도 같은 문제를 겪었는데 도움이 되었습니다!', NOW(), NOW(), 2, 'N', 1601),
(7202, 8001, NULL, 7101, '답변 감사합니다. 해결되었습니다!', NOW(), NOW(), 1, 'N', 1602),
(7203, 9007, 7002, NULL, '좋은 질문이네요. 저도 궁금했습니다.', NOW(), NOW(), 3, 'N', 1601);

-- 4. 게시글 기술 태그
INSERT INTO TBL_BOARD_SKILL_TAG_S (board_skill_tag_sq, board_sq, answer_sq, skill_tag_sq, skill_tag_nm, skill_tag_type_cd) VALUES 
(7301, 7001, NULL, 201, 'Spring Boot', 1801),
(7302, 7001, NULL, 601, 'MySQL', 1801),
(7303, 7002, NULL, 203, 'React', 1801),
(7304, 7003, NULL, 301, 'Docker', 1801),
(7305, NULL, 7103, 203, 'React', 1802);

-- 5. 게시글 일반 태그
INSERT INTO TBL_BOARD_NORMAL_TAG_S (normal_tag_sq, board_sq, answer_sq, normal_tag_nm, normal_tag_type_cd) VALUES 
(7401, 7001, NULL, '초보', 1701),
(7402, 7002, NULL, '급함', 1701),
(7403, 7003, NULL, '배포', 1701);

-- 6. 추천 데이터
INSERT INTO TBL_RECOMMENDATION_S (recommendation_sq, user_sq, board_sq, answer_sq, comment_sq, recommendation_type_cd, reply_comment_sq) VALUES 
(7501, 9001, 7001, NULL, NULL, 1901, NULL),
(7502, 9002, 7001, NULL, NULL, 1901, NULL),
(7503, 9003, NULL, 7101, NULL, 1902, NULL),
(7504, 9004, NULL, NULL, 7201, 1903, NULL);

-- ==========================================
-- 프로젝트 기능 테스트용 샘플 데이터
-- ==========================================

-- 7. 이력서 데이터 (기존 테스트 사용자용)
INSERT INTO TBL_RESUME_M (resume_sq, user_sq, address_sq, resume_ttl, resume_nm, resume_birth_dt, resume_phone_num, resume_email, resume_greeting_txt, resume_is_notification_yn, resume_is_representative_yn, resume_created_at_dtm, resume_modified_at_dtm, resume_is_deleted_yn) VALUES 
(7601, 8001, 8001, '프리랜서 백엔드 개발자 이력서', '테스트프리랜서', '1990-01-01', '010-1234-5678', 'test@freelancer.com', '안녕하세요. 3년차 백엔드 개발자입니다. Spring Boot와 Node.js를 주로 사용합니다.', 'Y', 'Y', NOW(), NOW(), 'N');

-- 8. 이력서 기술 태그
INSERT INTO TBL_RESUME_SKILL_TAG_S (resume_skill_sq, resume_sq, skill_tag_sq, parent_skill_tag_sq, skill_tag_lvl, skill_tag_nm) VALUES 
(7701, 7601, 101, 100, 2, 'Java'),
(7702, 7601, 201, 200, 2, 'Spring Boot'),
(7703, 7601, 601, 600, 2, 'MySQL'),
(7704, 7601, 301, 300, 2, 'Docker');

-- 9. 이력서 경력 정보
INSERT INTO TBL_RESUME_CAREER_S (career_sq, resume_sq, career_company_nm, career_department_nm, career_position_nm, career_start_dt, career_end_dt) VALUES 
(7801, 7601, 'ABC IT 솔루션', '개발팀', '주임', '2021-03-01', '2023-12-31'),
(7802, 7601, '스타트업XYZ', '백엔드팀', '대리', '2024-01-01', NULL);

-- 10. 프로젝트 계약 형태 (기존 프로젝트에 추가)
INSERT INTO TBL_PROJECT_CONTRACT_TYPE_S (contract_type_sq, project_sq, contract_type_cd) VALUES 
(7901, 9001, 903), -- 웹 개발 프로젝트 - 프리랜서
(7902, 9002, 903), -- 모바일 앱 개발 - 프리랜서
(7903, 9003, 902), -- 데이터베이스 관리 - 계약직
(7904, 9004, 903), -- AI 서비스 개발 - 프리랜서
(7905, 9006, 903); -- Vue.js 프론트엔드 개발 - 프리랜서

-- 11. 프로젝트 지원 내역
INSERT INTO TBL_PROJECT_APPLICATION_H (project_application_sq, project_sq, resume_sq, company_sq, project_application_status_cd, project_application_member_type_cd, project_application_created_at_dtm, selected_interview_dtm, read_application_dtm) VALUES 
(8001, 9001, 7601, NULL, 801, 301, NOW(), NULL, NULL),
(8002, 9002, 7601, NULL, 801, 301, DATE_SUB(NOW(), INTERVAL 2 DAY), NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 12. 스크랩 데이터
INSERT INTO TBL_SCRAP_S (scrap_sq, user_sq, company_sq, project_sq, scrap_type_cd) VALUES 
(8101, 8001, NULL, 9003, 601), -- 프로젝트 스크랩
(8102, 8001, NULL, 9004, 601), -- 프로젝트 스크랩
(8103, 8001, 9005, NULL, 602); -- 기업 스크랩

-- 13. 프로젝트 필수/우대 기술 태그 (일부 프로젝트에 추가)
INSERT INTO TBL_PROJECT_REQUIRED_SKILL_TAG_S (required_skill_sq, project_sq, skill_tag_sq, parent_skill_tag_sq, skill_tag_lvl, skill_tag_nm) VALUES 
(8201, 9001, 203, 200, 2, 'React'),
(8202, 9001, 101, 100, 2, 'Java'),
(8203, 9002, 204, 200, 2, 'Vue.js'),
(8204, 9003, 601, 600, 2, 'MySQL');

INSERT INTO TBL_PROJECT_PREFERRED_SKILL_TAG_S (preferred_skill_sq, project_sq, skill_tag_sq, parent_skill_tag_sq, skill_tag_lvl, skill_tag_nm) VALUES 
(8301, 9001, 301, 300, 2, 'Docker'),
(8302, 9002, 201, 200, 2, 'Spring Boot'),
(8303, 9003, 602, 600, 2, 'OracleDB');

-- 14. 파일 데이터 (프로필 이미지용)
INSERT INTO TBL_COMMON_FILE_S (file_sq, file_original_nm, file_save_nm, file_typ, file_size, file_upload_at, file_is_deleted_yn) VALUES 
(8401, 'profile_test_user.jpg', 'uuid-test-profile-8001.jpg', 'image/jpeg', 102400, NOW(), 'N'),
(8402, 'company_logo_9001.png', 'uuid-company-logo-9001.png', 'image/png', 204800, NOW(), 'N');

-- 15. 사용자 프로필 이미지
INSERT INTO TBL_USER_PROFILE_IMAGE_S (profile_image_sq, user_sq, file_sq) VALUES 
(8501, 8001, 8401);

-- 16. 회사 프로필 이미지
INSERT INTO TBL_COMPANY_PROFILE_IMAGE_S (profile_image_sq, company_sq, file_sq) VALUES 
(8601, 9001, 8402);


-- ==========================================
-- 추가 필요 샘플 데이터 (오류 수정 버전)
-- ==========================================

-- 1. 다양한 모집 상태의 프로젝트 수정 (실제 존재하는 프로젝트만)
-- 곧 마감되는 프로젝트
UPDATE TBL_PROJECT_M SET 
    project_recruit_end_dt = DATE_ADD(NOW(), INTERVAL 7 DAY),
    project_start_dt = DATE_ADD(NOW(), INTERVAL 14 DAY),
    project_end_dt = DATE_ADD(NOW(), INTERVAL 5 MONTH)
WHERE project_sq = 9001;

-- 여유있는 모집 중 프로젝트
UPDATE TBL_PROJECT_M SET 
    project_recruit_end_dt = DATE_ADD(NOW(), INTERVAL 30 DAY),
    project_start_dt = DATE_ADD(NOW(), INTERVAL 45 DAY),
    project_end_dt = DATE_ADD(NOW(), INTERVAL 8 MONTH)
WHERE project_sq = 9002;

-- 진행 중인 프로젝트 (모집 완료)
UPDATE TBL_PROJECT_M SET 
    project_recruit_start_dt = DATE_SUB(NOW(), INTERVAL 60 DAY),
    project_recruit_end_dt = DATE_SUB(NOW(), INTERVAL 30 DAY),
    project_start_dt = DATE_SUB(NOW(), INTERVAL 20 DAY),
    project_end_dt = DATE_ADD(NOW(), INTERVAL 2 MONTH)
WHERE project_sq = 9003;

-- 완료된 프로젝트
UPDATE TBL_PROJECT_M SET 
    project_recruit_start_dt = DATE_SUB(NOW(), INTERVAL 180 DAY),
    project_recruit_end_dt = DATE_SUB(NOW(), INTERVAL 150 DAY),
    project_start_dt = DATE_SUB(NOW(), INTERVAL 140 DAY),
    project_end_dt = DATE_SUB(NOW(), INTERVAL 10 DAY),
    project_activate_yn = 'N'
WHERE project_sq = 9004;

-- 2. 인터뷰 가능 시간대 데이터
INSERT INTO TBL_PROJECT_INTERVIEW_TIME_SLOT_S (interview_sq, project_sq, interview_available_dtm, interview_is_selected_yn) VALUES 
(10001, 9001, DATE_ADD(NOW(), INTERVAL 10 DAY) + INTERVAL 10 HOUR, 'N'),
(10002, 9001, DATE_ADD(NOW(), INTERVAL 10 DAY) + INTERVAL 14 HOUR, 'N'),
(10003, 9001, DATE_ADD(NOW(), INTERVAL 11 DAY) + INTERVAL 10 HOUR, 'N'),
(10004, 9001, DATE_ADD(NOW(), INTERVAL 11 DAY) + INTERVAL 14 HOUR, 'Y'),
(10005, 9002, DATE_ADD(NOW(), INTERVAL 40 DAY) + INTERVAL 10 HOUR, 'N'),
(10006, 9002, DATE_ADD(NOW(), INTERVAL 40 DAY) + INTERVAL 15 HOUR, 'N'),
(10007, 9002, DATE_ADD(NOW(), INTERVAL 41 DAY) + INTERVAL 11 HOUR, 'N');

-- 3. 이력서 프로젝트 이력
INSERT INTO TBL_RESUME_PROJECT_HISTORY_S (project_history_sq, resume_sq, project_history_client, project_history_type_cd, project_history_job_position_type_cd, project_history_task, project_history_start_dt, project_history_end_dt) VALUES 
(10101, 7601, 'A 금융기관', 1102, 1005, '온라인 뱅킹 시스템 개발', '2022-03-01', '2022-12-31'),
(10102, 7601, 'B 쇼핑몰', 1102, 1005, '결제 시스템 구축', '2023-01-15', '2023-08-30'),
(10103, 7601, 'C 스타트업', 1103, 1011, 'ERP 시스템 운영 및 개발', '2023-09-01', NULL);

-- 4. 프로젝트 이력 사용 기술
INSERT INTO TBL_RESUME_PROJECT_HISTORY_SKILL_TAG_S (project_history_skill_sq, project_history_sq, skill_tag_sq, parent_skill_tag_sq, skill_tag_lvl, skill_tag_nm) VALUES 
(10201, 10101, 101, 100, 2, 'Java'),
(10202, 10101, 201, 200, 2, 'Spring Boot'),
(10203, 10101, 601, 600, 2, 'MySQL'),
(10204, 10102, 203, 200, 2, 'React'),
(10205, 10102, 102, 100, 2, 'Python'),
(10206, 10102, 603, 600, 2, 'MongoDB'),
(10207, 10103, 204, 200, 2, 'Vue.js'),
(10208, 10103, 201, 200, 2, 'Spring Boot'),
(10209, 10103, 301, 300, 2, 'Docker');

-- 5. 교육 이력
INSERT INTO TBL_RESUME_EDUCATION_S (education_sq, resume_sq, education_school_nm, education_major_nm, education_admission_dt, education_graduation_dt, education_status_cd) VALUES 
(10301, 7601, '한국대학교', '컴퓨터공학과', '2012-03-01', '2016-02-28', 1201),
(10302, 7601, '서울대학원', '소프트웨어공학과', '2016-03-01', '2018-02-28', 1201);

-- 6. 교육 이수 이력
INSERT INTO TBL_RESUME_TRAINING_HISTORY_S (training_sq, resume_sq, training_institution_nm, training_program_nm, training_start_dt, training_end_dt) VALUES 
(10401, 7601, '국비교육원', 'Java 백엔드 개발자 과정', '2020-01-01', '2020-06-30'),
(10402, 7601, '온라인교육', 'AWS 클라우드 아키텍처', '2021-03-01', '2021-05-31'),
(10403, 7601, 'Docker & Kubernetes 실무', 'DevOps 전문가 과정', '2023-01-01', NULL);

-- 7. 자격증 정보 (참고: TBL_CERTIFICATE_S는 자격증 마스터 테이블이므로 여기서는 임의 코드 사용)
INSERT INTO TBL_RESUME_CERTIFICATION_S (certification_sq, resume_sq, certificate_cd, certification_nm, certification_issuer_nm) VALUES 
(10501, 7601, 1320, '정보처리기사', '한국산업인력공단'),
(10502, 7601, 2290, 'SQLD', '한국데이터산업진흥원'),
(10503, 7601, 9999, 'AWS Solutions Architect', 'Amazon Web Services');

-- 8. 대댓글 데이터
INSERT INTO TBL_BOARD_COMMENT_REPLY_S (reply_comment_sq, comment_sq, board_sq, user_sq, reply_comment_description_txt, reply_comment_created_at_dtm, reply_comment_modified_at_dtm, reply_comment_recommend_cnt, reply_comment_is_deleted_yn) VALUES 
(10601, 7201, 7001, 9008, '저도 그렇게 해결했습니다!', NOW(), NOW(), 1, 'N'),
(10602, 7201, 7001, 9009, '감사합니다. 도움이 되었어요.', NOW(), NOW(), 0, 'N'),
(10603, 7203, 7002, 9010, '저도 배우고 싶네요.', NOW(), NOW(), 2, 'N');

-- 9. 신고 데이터
INSERT INTO TBL_REPORT_S (report_sq, user_sq, board_sq, answer_sq, comment_sq, report_reason_txt, report_type_cd, reply_comment_sq, created_at_dtm) VALUES 
(10701, 9011, 7003, NULL, NULL, '부적절한 내용', 2001, NULL, NOW()),
(10702, 9012, NULL, NULL, 7203, '스팸', 2003, NULL, NOW()),
(10703, 9013, NULL, 7102, NULL, '광고성 게시물', 2002, NULL, NOW());

-- 10. 기업 소속 회원
INSERT INTO TBL_COMPANY_MEMBER_R (company_member_sq, company_sq, user_sq, company_member_join_dt, company_member_leave_dt, company_member_status_cd) VALUES 
(10801, 9001, 9001, '2020-01-15', NULL, 401),
(10802, 9002, 9002, '2021-03-20', NULL, 401),
(10803, 9003, 9003, '2019-05-10', '2023-12-31', 402);

-- 11. 기업 태그
INSERT INTO TBL_COMPANY_TAG_S (tag_sq, company_sq, tag_nm) VALUES 
(10901, 9001, '스타트업'),
(10902, 9001, '리모트 근무'),
(10903, 9001, '자율 출퇴근'),
(10904, 9002, 'SI/SM'),
(10905, 9002, '대기업 협력사'),
(10906, 9003, '솔루션'),
(10907, 9003, '복지 우수');

-- 12. 회사 지원 이력
INSERT INTO TBL_COMPANY_APPLICATION_H (company_application_sq, company_sq, user_sq, resume_sq, company_application_greeting_txt, company_application_status_cd, company_application_read_at_dtm, company_application_created_at_dtm, company_application_is_deleted_yn) VALUES 
(11001, 9001, 8001, 7601, '귀사의 발전에 기여하고 싶습니다.', 501, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), 'N'),
(11002, 9002, 8001, 7601, '3년간의 백엔드 경험을 바탕으로 기여하겠습니다.', 502, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 'N');












-- test

ALTER TABLE TBL_COMPANY_S MODIFY COLUMN COMPANY_VIEW_CNT INT NOT NULL DEFAULT 0 COMMENT '조회수';

