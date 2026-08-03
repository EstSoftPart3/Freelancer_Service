package com.example.demo.domain.admin.constant;

/**
 * 시드 입력 한 건의 종류.
 *
 * <p>
 * 공지(1403)와 고객의소리(1404)는 의도적으로 뺐다. 공지로 등록하면
 * {@code BoardService.createBoard} 와 같은 경로에서 <b>전 사용자 알림 배치</b>가 돌고,
 * VOC 는 비공개 정책이 걸린 도메인이라 더미데이터의 대상이 아니다.
 * </p>
 */
public enum SeedPostType {

	/** 일반게시판 (board_type_cd 1401). 카테고리 필수. */
	BOARD,
	/** Q&amp;A (board_type_cd 1402). 답변·채택상태가 붙는다. */
	QNA
}
