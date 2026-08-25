package com.example.demo.domain.admin.dto.response;

import java.util.List;

import com.example.demo.domain.admin.dto.ApplySeedBotDTO;

import lombok.Builder;
import lombok.Getter;

/** 봇 계정 현황 — 몇 개가 있고 그중 몇이 이력서를 가졌는지. */
@Getter
@Builder
public class ApplySeedStatusResponseDTO {

    private int totalBots;
    private int botsWithResume;
    private int botsWithoutResume;
    private List<ApplySeedBotDTO> bots;
}
