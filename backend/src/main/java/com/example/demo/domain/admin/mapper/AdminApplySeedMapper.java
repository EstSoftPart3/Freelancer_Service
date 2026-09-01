package com.example.demo.domain.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.admin.dto.ApplySeedAreaDTO;
import com.example.demo.domain.admin.dto.ApplySeedBotDTO;
import com.example.demo.domain.admin.dto.ApplySeedInsertDTO;
import com.example.demo.domain.admin.dto.ApplySeedPairDTO;
import com.example.demo.domain.admin.dto.ApplySeedProjectDTO;
import com.example.demo.domain.admin.dto.response.ApplySeedRevokeResponseDTO;

/**
 * 봇 지원 시드 전용 매퍼.
 *
 * <p>
 * {@code ProjectMapper.insertProjectApplication} 을 쓰지 않는 이유는 두 가지다 —
 * 그쪽은 {@code project_application_created_at_dtm} 이 {@code NOW()} 로 박혀 있어 지원일시를
 * 흩뿌릴 수 없고, 이를 호출하는 {@code ProjectService} 가 지원마다 기업에 알림을 보낸다.
 * 커뮤니티 시더가 {@code AdminSeedMapper} 를 따로 둔 것과 같은 이유다.
 * </p>
 */
@Mapper
public interface AdminApplySeedMapper {

	/**
	 * 채용중인 공고. {@code projectSqs} 를 주면 그중에서만 고른다.
	 *
	 * <p>
	 * 모집중 판정은 {@code ProjectMapper.recruitingCondition} 을 그대로 include 한다 —
	 * FO 카드의 "채용중" 뱃지와 기준이 어긋나면, 화면에는 마감으로 보이는 공고에 지원이 붙는다.
	 * </p>
	 */
	List<ApplySeedProjectDTO> findRecruitingProjects(@Param("projectSqs") List<Long> projectSqs);

	/** 봇 계정과 대표 이력서. 이력서가 없으면 {@code resumeSq} 가 null 로 온다. */
	List<ApplySeedBotDTO> findBots();

	/** 봇 이력서 주소에 붙일 시군구 코드 목록. */
	List<ApplySeedAreaDTO> findAreaCodes();

	/** 대상 공고에 이미 존재하는 (공고, 지원자) 쌍. 중복 지원을 피하는 데 쓴다. */
	List<ApplySeedPairDTO> findExistingApplications(@Param("projectSqs") List<Long> projectSqs);

	/** 지원 1건 INSERT. 작성일시를 파라미터로 받는다는 점이 기존 매퍼와 다르다. */
	int insertApplication(ApplySeedInsertDTO row);

	/** {@code project_candidate_cnt} 를 delta 만큼 더한다(음수면 뺀다). 0 아래로는 내려가지 않는다. */
	int addCandidateCnt(@Param("projectSq") Long projectSq, @Param("delta") int delta);

	/**
	 * {@code project_view_cnt} 를 delta 만큼 더한다.
	 *
	 * <p>
	 * 시드는 실제 HTTP 트래픽이 아니라 조회수 증가 API 를 타지 않는다. 그래서 지원만 20건이고
	 * 조회수는 0인 공고가 생겼다. 여기서 함께 올린다.
	 * </p>
	 */
	int addViewCnt(@Param("projectSq") Long projectSq, @Param("delta") int delta);

	/** 회수 대상 집계 — 공고별 봇 지원 건수. 미리보기와 실행이 같은 쿼리를 쓴다. */
	List<ApplySeedRevokeResponseDTO.Sample> findBotApplicationCounts(@Param("projectSqs") List<Long> projectSqs);

	/**
	 * 봇이 만든 지원을 물리 삭제한다.
	 *
	 * <p>
	 * 상태를 806(지원취소)으로 바꾸는 방법도 있지만 그러면 지원 이력이 화면에 남고,
	 * {@code hasAppliedProject} 가 false 를 돌려줘 같은 봇이 재지원할 수 있게 된다.
	 * 시드는 흔적 없이 걷어내는 쪽이 맞다.
	 * </p>
	 */
	int deleteBotApplications(@Param("projectSqs") List<Long> projectSqs);
}
