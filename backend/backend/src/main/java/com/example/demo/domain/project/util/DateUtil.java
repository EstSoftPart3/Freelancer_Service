package com.example.demo.domain.project.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtil {
    private static final DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static String formatLocalDate(LocalDateTime ldt) {
        return ldt == null ? null : ldt.format(dtFormatter);
    }
}