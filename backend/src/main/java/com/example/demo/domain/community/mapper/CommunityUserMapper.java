package com.example.demo.domain.community.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.user.dto.UserDTO;

@Mapper
public interface CommunityUserMapper {
     UserDTO findById(@Param("userSq") Long userSq);

     List<Long> findAllUserSqs();

     //게시글 작성자 조회
     List<UserDTO> findUsersByIds(@Param("userSqs") List<Long> userSq);
}