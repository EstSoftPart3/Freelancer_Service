package com.example.demo.domain.project.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.project.dto.request.SkillInsertRequest;


@Mapper
public interface SkillMapper {
	
	List<String> findAllReqSkills();
	
	
	List<String> findAllReqSkillsByProjectSq(@Param("projectSq") Long projectSq);
	List<String> findAllPreferSkillsByProjectSq(@Param("projectSq") Long projectSq);
	SkillInsertRequest findSkillTagInfoByName(@Param("name") String name);
	Long findParentSkillTagSq(@Param("skill_tag_sq") Long skill_tag_sq);
	
	void deleteReqSkillsByProjectSq(@Param("projectSq") Long projectSq);
	void deletePreferSkillsByProjectSq(@Param("projectSq") Long projectSq);
	
	
}
