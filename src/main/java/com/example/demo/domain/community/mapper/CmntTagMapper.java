package com.example.demo.domain.community.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.community.entity.*;
import java.util.*;

@Mapper
public interface CmntTagMapper {
//	전체 태그
	List <CommonSkillTag> findParentSkillTags(); 
    List <CommonSkillTag> findAll(@Param("skillTags") List<CommonSkillTag> skillTags);
	
//	일반 태그
    List <NormalTag> findNT(@Param("boardSq") Long boardSq, @Param("answerSq") Long answerSq);
    void insertNT(@Param("normalTags") List<NormalTag> normalTags);
    void deleteNT(@Param("boardSq") Long boardSq, @Param("answerSq") Long answerSq);
    
//  스킬 태그
    List <SkillTag> findST(@Param("boardSq") Long boardSq, @Param("answerSq") Long answerSq);
    void insertST(@Param("skillTags") List<SkillTag> skillTags);
    void deleteST(@Param("boardSq") Long boardSq, @Param("answerSq") Long answerSq);
     
}
