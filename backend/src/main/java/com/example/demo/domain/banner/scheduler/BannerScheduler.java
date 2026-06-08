package com.example.demo.domain.banner.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.demo.domain.banner.service.BannerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class BannerScheduler {

    private final BannerService bannerService;

    @Scheduled(cron = "0 0 1 * * *")
    public void deactivateExpiredBanners() {
        try {
            int rows = bannerService.deactivateExpiredBanners();
            if (rows > 0) {
                log.info("만료 배너 비활성 배치 완료: {}건", rows);
            }
        } catch (Exception e) {
            log.error("만료 배너 비활성 배치 실패", e);
        }
    }
}
