package com.example.demo.domain.community.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.domain.community.entity.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, Integer> {
}
