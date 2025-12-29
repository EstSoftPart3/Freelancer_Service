package com.example.demo.domain.notification.setting.repository;

public enum NotificationCategory {

    COMMENT,
    RECRUIT,
    SCRAP_COMPANY,
    UNKNOWN;

    public static NotificationCategory fromTargetTypeCd(Long targetTypeCd) {
        if (targetTypeCd == null) return UNKNOWN;

        return switch (targetTypeCd.intValue()) {
            case 2201, 2202 -> COMMENT;

            case 2203, 2204, 2207 -> RECRUIT;

            case 2205, 2206 -> SCRAP_COMPANY;

            default -> UNKNOWN;
        };
    }
}