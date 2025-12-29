package com.example.demo.domain.notification.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationSettingUpdateRequest {

    // null이면 해당 항목은 변경하지 않음 (PATCH 방식)
    private String projectAlarmYn;   // "Y" or "N" or null
    private String commentAlarmYn;
    private String resultAlarmYn;
    private String systemAlarmYn;
}
