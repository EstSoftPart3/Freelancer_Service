package com.example.demo.common.mapper;

import java.util.List;
import java.util.Map;

import javax.swing.ListModel;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.project.dto.request.SkillInsertRequest;

@Mapper
public interface CommonCodeMapper {
	Long findCommonCodeSqByName(@Param("name") String name, @Param("parentCodeSq") Long parentCodeSq);
	Long findCommonCodeSqByEngName(@Param("engName") String engName, @Param("parentCodeSq") Long parentCodeSq);
	List<String> findByParentCode(@Param("parentCodeSq") Long parentCodeSq);
	String findCommonCodeNmBySq(@Param("codeSq") Long codeSq);
	List<Map<Long, String>> findCommonCodeSqAndNmByParent(@Param("parentCodeSq") Long parentCodeSq);
}
