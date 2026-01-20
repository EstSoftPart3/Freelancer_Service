package com.example.demo.domain.map.vo;

import com.example.demo.domain.affiliation.entity.Company;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CompanyWithDistanceVo extends Company {
	private Double distance;
}