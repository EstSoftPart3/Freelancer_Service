package com.example.demo.domain.project.vo;

import com.example.demo.domain.project.entity.Project;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSearchResultWithDistance extends Project{    
    private Double distance;	
}