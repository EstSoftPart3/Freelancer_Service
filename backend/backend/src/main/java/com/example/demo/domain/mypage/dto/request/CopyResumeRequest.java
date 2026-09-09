package com.example.demo.domain.mypage.dto.request;

import lombok.Data;

@Data
public class CopyResumeRequest {
    private boolean withFiles;

    public boolean isWithFiles() {
        return withFiles;
    }

    public void setWithFiles(boolean withFiles) {
        this.withFiles = withFiles;
    }
}
