package com.example.demo.domain.mypage.dto.response;

import java.util.List;

import com.example.demo.domain.mypage.dto.ProjectHistoryTypeCodeDTO;

public class ProjectHistoryTypeCodeGroupResponseDTO {
    private List<ProjectHistoryTypeCodeDTO> projectRoleTypeList; // parent 1000
    private List<ProjectHistoryTypeCodeDTO> projectTaskTypeList; // parent 1100

    public List<ProjectHistoryTypeCodeDTO> getProjectRoleTypeList() {
        return projectRoleTypeList;
    }

    public void setProjectRoleTypeList(List<ProjectHistoryTypeCodeDTO> projectRoleTypeList) {
        this.projectRoleTypeList = projectRoleTypeList;
    }

    public List<ProjectHistoryTypeCodeDTO> getProjectTaskTypeList() {
        return projectTaskTypeList;
    }

    public void setProjectTaskTypeList(List<ProjectHistoryTypeCodeDTO> projectTaskTypeList) {
        this.projectTaskTypeList = projectTaskTypeList;
    }
}