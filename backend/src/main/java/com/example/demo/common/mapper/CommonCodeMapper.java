package com.example.demo.common.mapper;

import java.util.List;
import java.util.Map;

import javax.swing.ListModel;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.dto.CommonCodeDTO;
import com.example.demo.domain.project.dto.request.SkillInsertRequest;

@Mapper
public interface CommonCodeMapper {
	/**
	 * 부모 코드의 활성 하위 코드를 코드 순서대로 반환한다.
	 *
	 * <p>
	 * 기존 {@code findCommonCodeSqAndNmByParent} 는 {@code List<Map<Long,String>>} 을 돌려주는데
	 * 실제로는 컬럼명이 키인 맵이라 타입이 거짓이고, 비활성 코드와 정렬도 처리하지 않는다.
	 * 신규 호출부는 이 메서드를 쓴다.
	 * </p>
	 */
	List<CommonCodeDTO> findActiveChildrenByParent(@Param("parentCodeSq") Long parentCodeSq);

	Long findCommonCodeSqByName(@Param("name") String name, @Param("parentCodeSq") Long parentCodeSq);
	Long findCommonCodeSqByEngName(@Param("engName") String engName, @Param("parentCodeSq") Long parentCodeSq);
	List<String> findByParentCode(@Param("parentCodeSq") Long parentCodeSq);
	String findCommonCodeNmBySq(@Param("codeSq") Long codeSq);
	List<Map<Long, String>> findCommonCodeSqAndNmByParent(@Param("parentCodeSq") Long parentCodeSq);
}
