package com.example.demo.domain.user.mapper;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CompanyVerificationMapper {
    boolean existsByBizNum(String bizNum);
}