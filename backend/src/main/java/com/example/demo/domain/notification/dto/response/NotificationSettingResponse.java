package com.example.demo.domain.notification.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationSettingResponse {

    private Long userSq;

    private String projectAlarmYn;   // Y / N
    private String commentAlarmYn;   // Y / N
    private String resultAlarmYn;    // Y / N
    private String systemAlarmYn;    // Y / N
}
